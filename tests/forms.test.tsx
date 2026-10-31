import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordForm, patientFields, clinicalFields } from '@/components/forms';
import { ApiError } from '@/lib/api/client';

describe('patient and clinical forms', () => {
  it('keeps entered values and maps backend errors to visible fields', async () => {
    const user = userEvent.setup();
    const save = vi.fn().mockRejectedValue(
      new ApiError(400, 'VALIDATION_ERROR', 'Please review your details', {
        phone: ['Phone is invalid'],
      }),
    );
    render(
      <RecordForm
        fields={[{ name: 'phone', label: 'Phone', required: true }]}
        defaults={{ phone: 'entered-value' }}
        onSave={save}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Phone is invalid')).toBeVisible();
    expect(screen.getByLabelText('Phone', { exact: false })).toHaveValue(
      'entered-value',
    );
    expect(screen.getByLabelText('Phone', { exact: false })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
  it('rejects an impossible birth date before submitting', async () => {
    const user = userEvent.setup();
    const save = vi.fn();
    render(
      <RecordForm
        fields={patientFields.filter((f) => f.name === 'dateOfBirth')}
        defaults={{ dateOfBirth: '2025-02-30' }}
        onSave={save}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText(/Enter a real birth date/)).toBeVisible();
    expect(save).not.toHaveBeenCalled();
  });
  it('offers a deliberate reload on a clinical conflict without retrying the write', async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    const save = vi
      .fn()
      .mockRejectedValue(
        new ApiError(409, 'REVISION_CONFLICT', 'The record has changed'),
      );
    render(
      <RecordForm
        fields={clinicalFields}
        defaults={{ condition: 'My draft', status: 'stable' }}
        onSave={save}
        onReload={reload}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Load the latest version',
    );
    expect(screen.getByLabelText('Condition')).toHaveValue('My draft');
    await user.click(
      screen.getByRole('button', { name: 'Load latest version' }),
    );
    expect(reload).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledOnce();
  });
  it('locks a linked email after the backend reports immutability', async () => {
    const user = userEvent.setup();
    render(
      <RecordForm
        fields={[{ name: 'email', label: 'Email', type: 'email' }]}
        defaults={{ email: 'linked@example.test' }}
        onSave={vi
          .fn()
          .mockRejectedValue(
            new ApiError(
              409,
              'EMAIL_IMMUTABLE',
              'Linked profile email cannot change',
            ),
          )}
      />,
    );
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'different@example.test');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(screen.getByLabelText('Email')).toHaveAttribute('readonly'),
    );
    expect(screen.getByLabelText('Email')).toHaveValue('linked@example.test');
  });
});
