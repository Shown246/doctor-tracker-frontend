import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkPatientDialog } from '@/components/management';

const { put, invalidate } = vi.hoisted(() => ({
  put: vi.fn(),
  invalidate: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/client')>()),
  api: { PUT: put },
  queryKeys: { resource: (id: string, resource: string) => [id, resource] },
}));
vi.mock('@/components/account-context', () => ({
  useAccount: () => ({ id: 'admin', role: 'admin' }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: invalidate }),
}));
vi.mock('@/components/lists', () => ({
  RecordPicker: ({
    kind,
    selected = [],
    onSelect,
  }: {
    kind: string;
    selected?: string[];
    onSelect: (record: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
    }) => void;
  }) =>
    kind === 'patients' ? (
      <button
        onClick={() =>
          onSelect({
            id: 'patient',
            name: 'Registered Patient',
            phone: '01700000000',
            email: 'patient@example.test',
          })
        }
      >
        Select patient
      </button>
    ) : (
      <>
        {['a', 'b'].map((id) => (
          <button
            key={id}
            disabled={selected.includes(id)}
            onClick={() => onSelect({ id, name: `Doctor ${id}` })}
          >
            Select doctor {id}
          </button>
        ))}
      </>
    ),
}));

beforeEach(() => {
  put.mockReset();
  invalidate.mockClear();
});
describe('linking registered patients', () => {
  it('links multiple selected doctors to the same existing patient', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    put.mockResolvedValue({});
    render(<LinkPatientDialog onClose={close} />);
    await user.click(screen.getByRole('button', { name: 'Select patient' }));
    expect(screen.getByText(/patient@example.test/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Select doctor a' }));
    await user.click(screen.getByRole('button', { name: 'Select doctor b' }));
    await user.click(
      screen.getByRole('button', { name: 'Link selected doctors (2)' }),
    );
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(put.mock.calls.map((call) => call[1].params.path)).toEqual([
      { doctorId: 'a', patientId: 'patient' },
      { doctorId: 'b', patientId: 'patient' },
    ]);
    expect(invalidate).toHaveBeenCalled();
  });
  it('retains failed selections and retries only the remaining doctors', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    put
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error('Link failed'))
      .mockResolvedValueOnce({});
    render(<LinkPatientDialog onClose={close} />);
    await user.click(screen.getByRole('button', { name: 'Select patient' }));
    await user.click(screen.getByRole('button', { name: 'Select doctor a' }));
    await user.click(screen.getByRole('button', { name: 'Select doctor b' }));
    await user.click(
      screen.getByRole('button', { name: 'Link selected doctors (2)' }),
    );
    const retry = await screen.findByRole('button', {
      name: 'Link selected doctors (1)',
    });
    expect(close).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: 'Remove Doctor a' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Doctor b' }),
    ).toBeVisible();
    await user.click(retry);
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(put.mock.calls.map((call) => call[1].params.path.doctorId)).toEqual([
      'a',
      'b',
      'b',
    ]);
  });
});
