import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login, mutate, session, signup } from './helpers';

test('patient signup is active immediately while doctor signup requires approval', async ({
  browser,
}) => {
  const stamp = Date.now();
  const admin = await session(browser, 'admin');
  for (const role of ['doctor', 'patient'] as const) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const name = `Signup ${role} ${stamp}`;
    const email = `signup-${role}-${stamp}@example.test`;
    await signup(page, role, name, email);
    await login(page, role, email);
    if (role === 'doctor') {
      await expect(
        page.getByRole('heading', { name: 'Your registration is in review' }),
      ).toBeVisible();
      await page.goto('/doctor');
      await expect(page).toHaveURL('/status');
      await admin.page.goto('/admin/registrations?status=pending');
      await admin.page.getByRole('link', { name, exact: true }).click();
      await admin.page
        .getByRole('button', { name: 'Approve and create profile' })
        .click();
      await expect(
        admin.page.getByText('This registration has already been reviewed.', {
          exact: false,
        }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Check status' }).click();
    } else {
      await admin.page.goto('/admin/registrations?status=pending');
      await expect(
        admin.page.getByRole('link', { name, exact: true }),
      ).toHaveCount(0);
      expect((await context.request.get('/api/v1/me/profile')).status()).toBe(
        200,
      );
    }
    await expect(page).toHaveURL(`/${role}`);
    await page.goto('/admin/patients');
    await expect(page).toHaveURL(`/${role}`);
    await context.close();
  }
  await admin.context.close();
});

test('admin links registered patients to multiple doctors, unlinks and confirms permanent deletion', async ({
  browser,
}) => {
  const { context, page } = await session(browser, 'admin');
  const stamp = Date.now();
  await page.goto('/admin/doctors/new');
  await page.getByLabel('Name', { exact: false }).fill(`Dr Workflow ${stamp}`);
  await page
    .getByLabel('Email', { exact: true })
    .fill(`workflow-${stamp}@example.test`);
  await page.getByLabel('Specialization').fill('Neurology');
  await page.getByLabel('Hospital').fill('Synthetic Workflow Hospital');
  await page.getByLabel('Phone', { exact: false }).fill('+8801700000002');
  await page.getByRole('button', { name: 'Create doctor' }).click();
  await expect(page).toHaveURL(/\/admin\/doctors\/[a-f\d]{24}$/);
  const doctorUrl = page.url();
  await page.getByRole('button', { name: 'Edit doctor', exact: true }).click();
  await page
    .getByLabel('Hospital', { exact: true })
    .fill('Updated Synthetic Hospital');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByText('Updated Synthetic Hospital', { exact: true }),
  ).toBeVisible();
  const patientContext = await browser.newContext();
  const patientPage = await patientContext.newPage();
  const patientEmail = `workflow-patient-${stamp}@example.test`;
  await signup(
    patientPage,
    'patient',
    `Workflow Patient ${stamp}`,
    patientEmail,
  );
  await patientContext.close();
  const secondDoctor = await mutate(context.request, 'post', '/doctors', {
    name: `Dr Second ${stamp}`,
    email: `second-${stamp}@example.test`,
    specialization: 'Cardiology',
    hospital: 'Synthetic Hospital',
    phone: '+8801700000003',
  });
  expect(secondDoctor.status()).toBe(201);
  await page.goto('/admin/patients');
  await expect(
    page.getByRole('link', { name: 'Add patient', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Link patient', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('textbox', { name: 'Search patients' })
    .fill(patientEmail);
  await dialog
    .getByRole('button', { name: new RegExp(`Workflow Patient ${stamp}`) })
    .click();
  for (const name of [`Dr Workflow ${stamp}`, `Dr Second ${stamp}`]) {
    await dialog.getByRole('textbox', { name: 'Search doctors' }).fill(name);
    await dialog
      .getByRole('button', { name: new RegExp(`${name}.*Select`) })
      .click();
  }
  await dialog
    .getByRole('button', { name: 'Link selected doctors (2)', exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search records' })
    .fill(patientEmail);
  await expect(page).toHaveURL(/search=workflow-patient/);
  await page
    .getByRole('link', { name: `Workflow Patient ${stamp}`, exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/patients\/[a-f\d]{24}$/);
  const patientUrl = page.url();
  for (const name of [`Dr Workflow ${stamp}`, `Dr Second ${stamp}`]) {
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  }
  const secondLink = page.locator('div.rounded-lg.border').filter({
    has: page.getByRole('link', { name: `Dr Second ${stamp}`, exact: true }),
  });
  await secondLink.getByRole('button', { name: 'Unlink', exact: true }).click();
  await page
    .getByRole('button', { name: 'Unlink doctor', exact: true })
    .click();
  await page.getByRole('button', { name: 'Edit patient', exact: true }).click();
  await page
    .getByLabel('Address', { exact: true })
    .fill('Updated synthetic address');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByText('Updated synthetic address', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Unlink', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'private note will be permanently deleted',
  );
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByRole('link', { name: `Dr Workflow ${stamp}`, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Unlink', exact: true }).click();
  await page
    .getByRole('button', { name: 'Unlink doctor', exact: true })
    .click();
  await expect(
    page.getByText('No doctors are linked to this patient.'),
  ).toBeVisible();
  await page.goto(doctorUrl);
  await page.getByRole('button', { name: 'Link existing patient' }).click();
  await page
    .getByRole('textbox', { name: 'Search patients' })
    .fill(`Workflow Patient ${stamp}`);
  await page
    .getByRole('button', { name: new RegExp(`Workflow Patient ${stamp}`) })
    .click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(
    page.getByRole('link', { name: `Workflow Patient ${stamp}`, exact: true }),
  ).toBeVisible();
  await page.goto(patientUrl);
  await page
    .getByRole('button', { name: 'Delete patient', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toContainText('lose portal access');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: `Workflow Patient ${stamp}`,
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Delete patient', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Permanently delete patient', exact: true })
    .click();
  await expect(page).toHaveURL('/admin/patients');
  await page.goto(patientUrl);
  await expect(
    page.getByRole('alert', { name: 'Request error' }),
  ).toContainText('Record unavailable');
  await context.close();
});

test('doctor revisions and private notes survive review, unlinking revokes access and relinking clears notes', async ({
  browser,
}, testInfo) => {
  const doctor = await session(browser, 'doctor');
  await doctor.page.setViewportSize({ width: 390, height: 844 });
  const admin = await session(browser, 'admin');
  const doctorRequests: string[] = [];
  doctor.page.on('request', (request) => {
    if (request.url().includes('/api/v1/')) doctorRequests.push(request.url());
  });
  await doctor.page.goto('/doctor/patients');
  await doctor.page
    .getByRole('link', { name: 'Synthetic Patient 1', exact: true })
    .click();
  await expect(doctor.page).toHaveURL(/\/doctor\/patients\/[a-f0-9]{24}$/);
  const url = doctor.page.url();
  const patientId = url.split('/').at(-1)!;
  await expect(
    doctor.page.getByText('Synthetic private note for doctor 2', {
      exact: true,
    }),
  ).toHaveCount(0);
  await doctor.page
    .getByLabel('Condition', { exact: true })
    .fill('Doctor synthetic update');
  await doctor.page
    .getByLabel('Status', { exact: false })
    .selectOption('under_treatment');
  await doctor.page
    .getByRole('button', { name: 'Save changes', exact: true })
    .click();
  await expect(
    doctor.page.getByText('Doctor synthetic update', { exact: true }),
  ).toBeVisible();
  await doctor.page
    .getByLabel('Your private note', { exact: false })
    .fill('Private synthetic note visible only to author and admins');
  await doctor.page
    .getByRole('button', { name: 'Save note', exact: true })
    .click();
  await expect(
    doctor.page.getByText('Private note saved', { exact: true }),
  ).toBeVisible();
  await doctor.page.screenshot({
    path: testInfo.outputPath('doctor-patient-mobile.png'),
    fullPage: true,
  });
  await admin.page.goto(`/admin/patients/${patientId}`);
  await expect(
    admin.page.getByText(
      'Private synthetic note visible only to author and admins',
      { exact: true },
    ),
  ).toBeVisible();
  await doctor.page
    .getByLabel('Condition', { exact: true })
    .fill('Stale doctor draft');
  const latest = await admin.context.request.get(
    `/api/v1/patients/${patientId}`,
  );
  const revision = (await latest.json()).data.revision;
  expect(
    (
      await mutate(admin.context.request, 'patch', `/patients/${patientId}`, {
        condition: 'Newer admin update',
        revision,
      })
    ).ok(),
  ).toBeTruthy();
  await doctor.page
    .getByRole('button', { name: 'Save changes', exact: true })
    .click();
  await expect(
    doctor.page.getByRole('alert', { name: 'Request error' }),
  ).toContainText('This record needs review');
  await expect(
    doctor.page.getByLabel('Condition', { exact: true }),
  ).toHaveValue('Stale doctor draft');
  await doctor.page
    .getByRole('button', { name: 'Load latest version', exact: true })
    .click();
  await expect(
    doctor.page.getByLabel('Condition', { exact: true }),
  ).toHaveValue('Newer admin update');
  const me = await doctor.context.request.get('/api/v1/auth/me');
  const doctorId = (await me.json()).data.profileId;
  expect(
    (
      await mutate(
        admin.context.request,
        'delete',
        `/doctors/${doctorId}/patients/${patientId}`,
      )
    ).ok(),
  ).toBeTruthy();
  await doctor.page
    .getByRole('button', { name: 'Refresh record', exact: true })
    .click();
  await expect(
    doctor.page.getByLabel('Condition', { exact: true }),
  ).toHaveCount(0);
  await expect(
    doctor.page.getByRole('alert', { name: 'Request error' }),
  ).toContainText('Record unavailable');
  await expect(
    doctor.page.getByLabel('Your private note', { exact: false }),
  ).toHaveCount(0);
  expect(
    (
      await mutate(
        admin.context.request,
        'put',
        `/doctors/${doctorId}/patients/${patientId}`,
      )
    ).ok(),
  ).toBeTruthy();
  await doctor.page
    .getByRole('button', { name: 'Try again', exact: true })
    .click();
  await expect(
    doctor.page.getByLabel('Your private note', { exact: false }),
  ).toHaveValue('');
  expect(
    doctorRequests.some((url) =>
      /\/api\/v1\/(patients|doctors|registrations)(\/|\?)/.test(url),
    ),
  ).toBe(false);
  await doctor.page
    .getByLabel('Your private note', { exact: false })
    .fill('Note to clear');
  await doctor.page.getByRole('button', { name: 'Save note' }).click();
  await doctor.page
    .getByRole('button', { name: 'Clear note', exact: true })
    .click();
  await doctor.page
    .getByRole('button', { name: 'Clear private note', exact: true })
    .click();
  await expect(
    doctor.page.getByLabel('Your private note', { exact: false }),
  ).toHaveValue('');
  await doctor.context.close();
  await admin.context.close();
});

test('patient edits only contact details, linked email stays immutable and accounts clear on logout', async ({
  browser,
}, testInfo) => {
  const patient = await session(browser, 'patient');
  await patient.page.setViewportSize({ width: 390, height: 844 });
  await patient.page.goto('/patient/profile');
  await patient.page
    .getByLabel('Phone', { exact: false })
    .fill('+8801999999999');
  await patient.page
    .getByLabel('Address', { exact: true })
    .fill('Patient edited synthetic address');
  await patient.page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    patient.page.getByText('Contact details updated', { exact: true }),
  ).toBeVisible();
  await patient.page.reload();
  await expect(patient.page.getByLabel('Phone', { exact: false })).toHaveValue(
    '+8801999999999',
  );
  await expect(
    patient.page.getByLabel('Condition', { exact: true }),
  ).toHaveCount(0);
  await patient.page.screenshot({
    path: testInfo.outputPath('patient-profile-mobile.png'),
    fullPage: true,
  });
  const ownProfile = await patient.context.request.get('/api/v1/me/profile');
  const own = (await ownProfile.json()).data;
  const admin = await session(browser, 'admin');
  await admin.page.goto(`/admin/patients/${own.id}`);
  await admin.page
    .getByRole('button', { name: 'Edit patient', exact: true })
    .click();
  await admin.page
    .getByLabel('Email', { exact: true })
    .fill('attempted-change@example.test');
  await admin.page
    .getByRole('button', { name: 'Save changes', exact: true })
    .click();
  await expect(
    admin.page.getByRole('alert', { name: 'Request error' }),
  ).toContainText('Linked profile email cannot change');
  await expect(admin.page.getByLabel('Email', { exact: true })).toHaveAttribute(
    'readonly',
  );
  await expect(admin.page.getByLabel('Email', { exact: true })).toHaveValue(
    own.email,
  );
  await admin.context.close();
  await patient.page.goto('/patient/doctors');
  await expect(
    patient.page.getByRole('heading', { name: 'My doctors', exact: true }),
  ).toBeVisible();
  await expect(
    patient.page.getByText(
      'Private synthetic note visible only to author and admins',
    ),
  ).toHaveCount(0);
  await patient.page.setViewportSize({ width: 1280, height: 720 });
  await patient.page.goto('/patient/patients/aaaaaaaaaaaaaaaaaaaaaaaa');
  await expect(
    patient.page.getByRole('heading', { name: 'Page not found' }),
  ).toBeVisible();
  await patient.page.goto('/admin');
  await expect(patient.page).toHaveURL('/patient');
  await patient.page
    .getByRole('button', { name: 'Sign out', exact: true })
    .click();
  await expect(patient.page).toHaveURL('/login');
  await login(patient.page, 'doctor');
  await expect(
    patient.page.getByRole('link', { name: 'Registrations', exact: true }),
  ).toHaveCount(0);
  await expect(
    patient.page.getByRole('link', { name: 'My patients', exact: true }),
  ).toBeVisible();
  await expect(
    patient.page.getByText('Patient edited synthetic address', { exact: true }),
  ).toHaveCount(0);
  await patient.context.clearCookies();
  await patient.page.reload();
  await expect(patient.page).toHaveURL(/\/login(?:\?reason=expired)?$/);
  await patient.context.close();
});

test('URL state, desktop and mobile layouts, keyboard navigation and accessible forms', async ({
  browser,
}, testInfo) => {
  const { context, page } = await session(browser, 'admin');
  await page.goto('/admin/patients?status=stable&sort=name&limit=10&page=2');
  await page.getByRole('textbox', { name: 'Search records' }).fill('Synthetic');
  await expect(page).toHaveURL(/search=Synthetic/);
  expect(new URL(page.url()).searchParams.get('page')).toBeNull();
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'Search records' }),
  ).toHaveValue('Synthetic');
  expect(new URL(page.url()).searchParams.get('status')).toBe('stable');
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Care at a glance' }),
  ).toBeVisible();
  await expect(page.getByText('Total doctors', { exact: true })).toBeVisible();
  await expect(page.locator('.recharts-pie-sector').first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('admin-desktop.png'),
    fullPage: true,
  });
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Patients', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Patients', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('patients-mobile.png'),
    fullPage: true,
  });
  await page.goto('/admin/patients/new');
  await expect(page).toHaveURL('/admin/patients');
  await page.getByRole('button', { name: 'Link patient', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const linkAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(linkAxe.violations).toEqual([]);
  await context.close();
  const anonymous = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const auth = await anonymous.newPage();
  await auth.goto('/login');
  await auth.keyboard.press('Tab');
  await expect(
    auth.getByRole('link', { name: 'DoctorTracker Connected care' }),
  ).toBeFocused();
  const authAxe = await new AxeBuilder({ page: auth })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(authAxe.violations).toEqual([]);
  await auth.screenshot({
    path: testInfo.outputPath('login-mobile.png'),
    fullPage: true,
  });
  await anonymous.close();
});
