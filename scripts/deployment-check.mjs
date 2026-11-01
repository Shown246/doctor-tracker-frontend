import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = 'https://doctor.qatarcentral.cloudapp.azure.com';
const seed = Object.fromEntries(
  (await readFile(process.env.DEMO_SEED_FILE, 'utf8'))
    .split(/\r?\n/)
    .filter((line) => line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i), line.slice(i + 1)];
    }),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('../deployment/screenshots', { recursive: true });
try {
  if (process.argv.includes('--reuse-session')) {
    const context = await browser.newContext({
      baseURL: base,
      storageState: '../deployment/session-state.json',
    });
    assert.equal((await context.request.get('/api/v1/auth/me')).status(), 200);
    const page = await context.newPage();
    await page.goto('/admin');
    await page
      .locator('.stat-value')
      .first()
      .waitFor({ state: 'visible', timeout: 30000 });
    assert.equal(new URL(page.url()).pathname, '/admin');
    await context.close();
    console.log(
      'Existing admin session and seeded dashboard survived restart of all four services',
    );
  } else {
    for (const role of ['admin', 'doctor', 'patient']) {
      const context = await browser.newContext({ baseURL: base });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/login');
      await page
        .getByLabel('Email', { exact: true })
        .fill(seed[`DEMO_${role.toUpperCase()}_EMAIL`]);
      await page
        .locator('input[name="password"]')
        .fill(seed[`DEMO_${role.toUpperCase()}_PASSWORD`]);
      await page.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page.waitForURL(`${base}/${role}`, { timeout: 30000 });
      assert.equal(
        (await context.request.get('/api/v1/dashboard')).status(),
        200,
      );
      assert.equal(
        (await context.request.get('/api/v1/auth/me')).status(),
        200,
      );
      const cookie = (await context.cookies()).find(
        (c) => c.name === 'doctor_tracker.sid',
      );
      assert.ok(cookie?.secure && cookie.httpOnly && cookie.sameSite === 'Lax');
      const paths =
        role === 'admin'
          ? ['/admin/doctors', '/admin/patients', '/admin/registrations']
          : [`/${role}/profile`];
      for (const path of paths) {
        const response = await page.goto(path);
        assert.equal(response.status(), 200);
        assert.equal(new URL(page.url()).pathname, path);
      }
      await page.goto(`/${role}`);
      await page
        .locator('.stat-value')
        .first()
        .waitFor({ state: 'visible', timeout: 30000 });
      await page.screenshot({
        path: `../deployment/screenshots/${role}.png`,
        fullPage: true,
      });
      if (role === 'admin')
        await context.storageState({
          path: '../deployment/session-state.json',
        });
      if (role === 'patient') {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({
          path: '../deployment/screenshots/patient-mobile.png',
          fullPage: true,
        });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
      }
      assert.deepEqual(errors, []);
      console.log(
        `${role}: browser login, portal, API access, secure cookie and navigation passed`,
      );
      await context.close();
    }
    const response = await fetch(`${base}/health/ready`);
    assert.equal(response.status, 200);
    console.log('Public HTTPS readiness passed');
  }
} finally {
  await browser.close();
}
