import {
  expect,
  type Browser,
  type Page,
  type APIRequestContext,
} from '@playwright/test';
const password = process.env.E2E_PASSWORD;
export function credentials(role: 'admin' | 'doctor' | 'patient') {
  const email = process.env[`E2E_${role.toUpperCase()}_EMAIL`];
  if (!email || !password)
    throw new Error(
      'Use npm run test:e2e, or provide explicit synthetic E2E credentials',
    );
  return { email, password };
}
export async function login(
  page: Page,
  role: 'admin' | 'doctor' | 'patient',
  email?: string,
) {
  const c = credentials(role);
  await page.goto('/login');
  await page.getByLabel('Email', { exact: true }).fill(email ?? c.email);
  await page.getByLabel('Password', { exact: false }).fill(c.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/${role}$|/status$`));
}
export async function session(
  browser: Browser,
  role: 'admin' | 'doctor' | 'patient',
) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, role);
  return { context, page };
}
export async function mutate(
  request: APIRequestContext,
  method: 'post' | 'put' | 'patch' | 'delete',
  path: string,
  data?: unknown,
) {
  const response = await request.get('/api/v1/auth/csrf');
  const token = (await response.json()).data.csrfToken;
  return request[method](`/api/v1${path}`, {
    headers: { 'X-CSRF-Token': token },
    data,
  });
}
export async function fillPatient(page: Page, name: string, email?: string) {
  await page.getByLabel('Name', { exact: false }).first().fill(name);
  if (email) await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Date of birth').fill('1994-02-28');
  await page.getByLabel('Phone', { exact: false }).fill('+8801700000001');
  await page
    .getByLabel('Condition', { exact: true })
    .fill('Synthetic observation');
  await page.getByLabel('Status', { exact: false }).selectOption('stable');
}
export async function signup(
  page: Page,
  role: 'doctor' | 'patient',
  name: string,
  email: string,
) {
  await page.goto('/register');
  await page
    .getByRole('radio', {
      name: role === 'doctor' ? 'Doctor' : 'Patient',
      exact: true,
    })
    .check();
  await page.getByLabel('Full name').fill(name);
  await page.getByLabel('Email', { exact: false }).fill(email);
  await page
    .getByLabel('Password', { exact: false })
    .fill(credentials('admin').password);
  await page.getByLabel('Phone', { exact: false }).fill('+8801800000001');
  if (role === 'doctor') {
    await page.getByLabel('Specialization').fill('Cardiology');
    await page.getByLabel('Hospital').fill('Synthetic Hospital');
  } else await page.getByLabel('Date of birth').fill('1992-05-15');
  await page.getByRole('button', { name: 'Submit registration' }).click();
  await expect(page).toHaveURL('/status?submitted=1');
}
