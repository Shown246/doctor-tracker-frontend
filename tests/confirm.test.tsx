import { expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Confirm } from '@/components/shared';

it('waits for explicit confirmation and backend success before dismissing deletion', async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  const action = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <Confirm
      label="Delete patient"
      title="Permanently delete patient"
      description="All links and private notes will be removed and portal access will end."
      onConfirm={action}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Delete patient' }));
  expect(action).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog')).toHaveTextContent(
    'portal access will end',
  );
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(action).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Delete patient' }));
  await user.click(
    screen.getByRole('button', { name: 'Permanently delete patient' }),
  );
  expect(screen.getByRole('button', { name: 'Please wait…' })).toBeDisabled();
  expect(screen.getByRole('dialog')).toBeVisible();
  finish();
  await waitFor(() =>
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  expect(action).toHaveBeenCalledOnce();
});
it('keeps the confirmation open with a recoverable error after failure', async () => {
  const user = userEvent.setup();
  render(
    <Confirm
      label="Unlink"
      title="Unlink doctor"
      description="The doctor's note will be permanently deleted."
      onConfirm={vi.fn().mockRejectedValue(new Error('Connection lost'))}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Unlink' }));
  await user.click(screen.getByRole('button', { name: 'Unlink doctor' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost');
  expect(screen.getByRole('dialog')).toBeVisible();
});
