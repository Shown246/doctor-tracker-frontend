import { expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DebouncedSearch } from '@/components/lists';
it('waits for a pause before applying the entered search', async () => {
  const user = userEvent.setup();
  const apply = vi.fn();
  render(<DebouncedSearch value="" onChange={apply} />);
  await user.type(
    screen.getByRole('textbox', { name: 'Search records' }),
    '  New patient',
  );
  expect(apply).not.toHaveBeenCalled();
  await waitFor(() => expect(apply).toHaveBeenCalledWith('New patient'));
  expect(apply).toHaveBeenCalledOnce();
});
