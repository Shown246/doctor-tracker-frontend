import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm, RegisterForm } from '@/components/auth';

const calls = vi.hoisted(() => ({ GET: vi.fn(), POST: vi.fn() }));
vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  api: calls,
}));
function login(error?: string) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <LoginForm googleError={error} />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  calls.GET.mockReset();
  calls.POST.mockReset();
});
describe('Google authentication forms', () => {
  it('offers Google on login and shows safe callback errors', () => {
    login('cancelled');
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('cancelled');
  });
  it('keeps password registration available alongside Google', () => {
    render(<RegisterForm />);
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Password', { exact: true })).toBeVisible();
  });
  it('shows configuration failures and allows another attempt', async () => {
    calls.POST.mockRejectedValue(
      new Error('Google Sign-In is not configured.'),
    );
    login();
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'not configured',
    );
    expect(calls.POST).toHaveBeenCalledWith('/auth/google/start');
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeEnabled();
  });
  it('uses verified identity and asks only for the missing profile fields', async () => {
    calls.GET.mockResolvedValue({
      data: {
        data: {
          name: 'Google Example',
          email: 'google@example.test',
          existingAccount: false,
        },
      },
    });
    render(<RegisterForm google />);
    expect(await screen.findByText(/google@example.test/)).toBeVisible();
    expect(
      screen.queryByLabelText('Password', { exact: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Email', { exact: true }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Specialization')).toBeVisible();
    await userEvent.click(screen.getByRole('radio', { name: 'Patient' }));
    expect(screen.getByLabelText('Date of birth')).toBeVisible();
    expect(screen.queryByLabelText('Specialization')).not.toBeInTheDocument();
  });
  it('requires password verification to link an existing account', async () => {
    calls.GET.mockResolvedValue({
      data: {
        data: {
          name: 'Google Example',
          email: 'google@example.test',
          existingAccount: true,
        },
      },
    });
    calls.POST.mockRejectedValue(new Error('Invalid email or password'));
    render(<RegisterForm google />);
    const input = await screen.findByLabelText('Current password', {
      exact: true,
    });
    await userEvent.type(input, 'incorrect-password');
    await userEvent.click(
      screen.getByRole('button', { name: 'Link Google and sign in' }),
    );
    expect(calls.POST).toHaveBeenCalledWith('/auth/google/link', {
      body: { password: 'incorrect-password' },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid email or password',
    );
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
  it('offers a fresh Google attempt when registration verification has expired', async () => {
    calls.GET.mockRejectedValue(new Error('Google verification expired.'));
    render(<RegisterForm google />);
    expect(await screen.findByRole('alert')).toHaveTextContent('expired');
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible();
  });
});
