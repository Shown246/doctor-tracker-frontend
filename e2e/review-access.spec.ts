import { test, expect } from '@playwright/test';
import { credentials, login, mutate, session, signup } from './helpers';

test('rejected submissions show their reason and cannot enter a portal', async ({
  browser,
}) => {
  const admin = await session(browser, 'admin');
  const context = await browser.newContext();
  const page = await context.newPage();
  const stamp = Date.now();
  const name = `Rejected Synthetic ${stamp}`;
  const email = `rejected-${stamp}@example.test`;
  await signup(page, 'doctor', name, email);
  await admin.page.goto('/admin/registrations?status=pending');
  await admin.page.getByRole('link', { name, exact: true }).click();
  await admin.page
    .getByLabel('Rejection reason (optional)')
    .fill('Synthetic rejection feedback');
  await admin.page
    .getByRole('button', { name: 'Reject registration', exact: true })
    .click();
  await expect(
    admin.page.getByText('This registration has already been reviewed.', {
      exact: false,
    }),
  ).toBeVisible();
  await login(page, 'doctor', email);
  await expect(
    page.getByRole('heading', { name: 'Registration not approved' }),
  ).toBeVisible();
  await expect(page.locator('blockquote')).toContainText(
    'Synthetic rejection feedback',
  );
  await page.goto('/doctor/profile');
  await expect(page).toHaveURL('/status');
  expect((await context.request.get('/api/v1/me/profile')).status()).toBe(403);
  await context.close();
  await admin.context.close();
});

test('approval can link an existing matching profile and preserves its professional details', async ({
  browser,
}) => {
  const admin = await session(browser, 'admin');
  const context = await browser.newContext();
  const page = await context.newPage();
  const stamp = Date.now();
  const name = `Linked Synthetic ${stamp}`;
  const email = `link-${stamp}@example.test`;
  await admin.page.goto('/admin/doctors/new');
  await admin.page.getByLabel('Name', { exact: true }).fill(name);
  await admin.page.getByLabel('Email', { exact: true }).fill(email);
  await admin.page.getByLabel('Specialization').fill('Existing Specialty');
  await admin.page.getByLabel('Hospital').fill('Existing Synthetic Hospital');
  await admin.page.getByLabel('Phone', { exact: true }).fill('+8801700000003');
  await admin.page.getByRole('button', { name: 'Create doctor' }).click();
  await expect(admin.page).toHaveURL(/\/admin\/doctors\/[a-f\d]{24}$/);
  await signup(page, 'doctor', name, email);
  await admin.page.goto('/admin/registrations?status=pending');
  await admin.page.getByRole('link', { name, exact: true }).click();
  await admin.page
    .getByRole('radio', { name: 'Link a matching existing profile' })
    .check();
  await admin.page.getByRole('textbox', { name: 'Search doctors' }).fill(email);
  await admin.page.getByRole('button', { name: new RegExp(name) }).click();
  await admin.page
    .getByRole('button', { name: 'Approve and link profile' })
    .click();
  await expect(
    admin.page.getByText('This registration has already been reviewed.', {
      exact: false,
    }),
  ).toBeVisible();
  await login(page, 'doctor', email);
  await page.goto('/doctor/profile');
  await expect(
    page.getByText('Existing Specialty', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Existing Synthetic Hospital', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await context.close();
  await admin.context.close();
});

test('private-note conflicts preserve the draft and require loading the latest note', async ({
  browser,
}) => {
  const doctor = await session(browser, 'doctor');
  await doctor.page.goto('/doctor/patients');
  await doctor.page
    .getByRole('link', { name: 'Synthetic Patient 3', exact: true })
    .click();
  await expect(doctor.page).toHaveURL(/\/doctor\/patients\/[a-f0-9]{24}$/);
  const other = await doctor.context.newPage();
  await other.goto(doctor.page.url());
  await expect(
    other.getByLabel('Your private note', { exact: true }),
  ).toBeVisible();
  await doctor.page
    .getByLabel('Your private note', { exact: true })
    .fill('First concurrent note');
  await other
    .getByLabel('Your private note', { exact: true })
    .fill('Second stale note');
  await doctor.page
    .getByRole('button', { name: 'Save note', exact: true })
    .click();
  await expect(
    doctor.page.getByText('Private note saved', { exact: true }),
  ).toBeVisible();
  await other.getByRole('button', { name: 'Save note', exact: true }).click();
  await expect(
    other.getByRole('alert', { name: 'Request error' }),
  ).toContainText('This record needs review');
  await expect(
    other.getByLabel('Your private note', { exact: true }),
  ).toHaveValue('Second stale note');
  await other
    .getByRole('button', { name: 'Load latest version', exact: true })
    .click();
  await expect(
    other.getByLabel('Your private note', { exact: true }),
  ).toHaveValue('First concurrent note');
  await doctor.context.close();
});

test('deleting a linked patient revokes their current session and hides private data', async ({
  browser,
}) => {
  const admin = await session(browser, 'admin');
  const context = await browser.newContext();
  const page = await context.newPage();
  const stamp = Date.now();
  const name = `Deleted Account ${stamp}`;
  const email = `deleted-${stamp}@example.test`;
  await signup(page, 'patient', name, email);
  await login(page, 'patient', email);
  const me = await context.request.get('/api/v1/auth/me');
  const id = (await me.json()).data.profileId;
  await page.goto('/patient/profile');
  await expect(page.getByLabel('Phone', { exact: true })).toBeVisible();
  expect(
    (await mutate(admin.context.request, 'delete', `/patients/${id}`)).status(),
  ).toBe(204);
  await page.getByLabel('Phone', { exact: true }).fill('+8801777777777');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page).toHaveURL('/access-denied');
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL('/login');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page
    .getByLabel('Password', { exact: true })
    .fill(credentials('patient').password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('alert', { name: 'Request error' }),
  ).toContainText('Invalid email or password');
  await context.close();
  await admin.context.close();
});
