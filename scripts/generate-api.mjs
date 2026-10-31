import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import openapiTS, { astToString } from 'openapi-typescript';

const artifact = new URL('../contracts/openapi.json', import.meta.url);
const raw = await fs.readFile(artifact);
const provenance = JSON.parse(
  await fs.readFile(
    new URL('../contracts/provenance.json', import.meta.url),
    'utf8',
  ),
);
if (createHash('sha256').update(raw).digest('hex') !== provenance.sha256)
  throw new Error(
    'Contract checksum mismatch; review and update provenance before generation',
  );
const schema = JSON.parse(raw);
if (schema.info.version !== provenance.version)
  throw new Error('Contract version mismatch');
const output = astToString(await openapiTS(schema));
const target = new URL('../src/lib/api/schema.d.ts', import.meta.url);
if (process.argv.includes('--check')) {
  if ((await fs.readFile(target, 'utf8')) !== output)
    throw new Error('API types are stale; run npm run api:generate');
} else {
  await fs.mkdir(new URL('../src/lib/api/', import.meta.url), {
    recursive: true,
  });
  await fs.writeFile(target, output);
}
