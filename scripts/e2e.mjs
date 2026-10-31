import { createRequire } from 'node:module';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';

// Test orchestration only: production/frontend code never imports backend source.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backend = resolve(
  process.env.E2E_BACKEND_DIR ?? resolve(root, '../doctor-tracker-backend'),
);
const requireBackend = createRequire(resolve(backend, 'package.json'));
const { MongoMemoryReplSet } = requireBackend('mongodb-memory-server');
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run through npm run test:e2e');
const backendPort = 4100;
const frontendPort = 3100;
const base = `http://localhost:${frontendPort}`;
const password = randomBytes(24).toString('hex');
const children = [];
let replica;
function run(args, cwd, env, background = false) {
  const child = spawn(process.execPath, [npm, ...args], {
    cwd,
    env,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (background) {
    children.push(child);
    return child;
  }
  return once(child, 'exit').then(([code]) => {
    if (code !== 0) throw new Error(`${args.join(' ')} failed (${code})`);
  });
}
async function available(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}
async function ready(url, child) {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('Test server exited');
    if (await available(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Timed out waiting for test server');
}
async function stop() {
  for (const child of children.reverse()) {
    if (child.exitCode !== null) continue;
    if (process.platform === 'win32') {
      const killer = spawn(
        'taskkill',
        ['/PID', String(child.pid), '/T', '/F'],
        { windowsHide: true, stdio: 'ignore' },
      );
      await once(killer, 'exit');
    } else {
      child.kill('SIGTERM');
    }
  }
  await replica?.stop();
}
try {
  if (
    (await available(`${base}/login`)) ||
    (await available(`http://localhost:${backendPort}/health/live`))
  )
    throw new Error(
      'E2E ports 3100/4100 must be unused; refusing to reuse an unknown server',
    );
  replica = await MongoMemoryReplSet.create({
    binary: {
      version: '8.2.6',
      downloadDir: resolve(backend, '.cache/mongodb-binaries'),
    },
    replSet: { count: 1 },
  });
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: String(backendPort),
    MONGODB_URI: replica.getUri(),
    MONGODB_DATABASE: 'doctor_tracker_frontend_test',
    FIXTURE_DATABASE: 'doctor_tracker_frontend_test',
    SESSION_SECRET: randomBytes(32).toString('hex'),
    FRONTEND_ORIGIN: base,
    LOG_LEVEL: 'warn',
    TRUST_PROXY: 'false',
    SEED_DEMO: 'true',
    DEMO_ADMIN_EMAIL: 'admin@frontend.example.test',
    DEMO_ADMIN_PASSWORD: password,
    DEMO_DOCTOR_EMAIL: 'doctor@frontend.example.test',
    DEMO_DOCTOR_PASSWORD: password,
    DEMO_PATIENT_EMAIL: 'patient@frontend.example.test',
    DEMO_PATIENT_PASSWORD: password,
  };
  await run(['run', 'db:indexes'], backend, env);
  await run(['run', 'seed:demo'], backend, env);
  await run(['run', 'build'], backend, env);
  const api = run(['start'], backend, env, true);
  await ready(`http://localhost:${backendPort}/health/ready`, api);
  const uiEnv = {
    ...process.env,
    BACKEND_ORIGIN: `http://localhost:${backendPort}`,
    NEXT_DIST_DIR: '.next-e2e',
    NEXT_TELEMETRY_DISABLED: '1',
    E2E_BASE_URL: base,
    E2E_PASSWORD: password,
    E2E_ADMIN_EMAIL: env.DEMO_ADMIN_EMAIL,
    E2E_DOCTOR_EMAIL: env.DEMO_DOCTOR_EMAIL,
    E2E_PATIENT_EMAIL: env.DEMO_PATIENT_EMAIL,
  };
  const ui = run(
    ['run', 'dev', '--', '--port', String(frontendPort)],
    root,
    uiEnv,
    true,
  );
  await ready(`${base}/login`, ui);
  await run(
    ['exec', '--', 'playwright', 'test', ...process.argv.slice(2)],
    root,
    uiEnv,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : 'E2E failed');
  process.exitCode = 1;
} finally {
  await stop();
}
