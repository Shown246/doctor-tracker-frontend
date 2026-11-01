'use client';
import { useId, useMemo, useState } from 'react';
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetError,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { genders, statuses } from '@/lib/api/types';
import { title, today } from '@/lib/utils';
import { ErrorState, Submit } from './shared';
import { Button } from './ui/button';

export type Values = Record<string, string>;
export type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  max?: number;
  min?: number;
  options?: readonly string[];
  readOnly?: boolean;
  help?: string;
  autoComplete?: string;
};
export const doctorFields: Field[] = [
  { name: 'name', label: 'Name', required: true, max: 120 },
  { name: 'email', label: 'Email', type: 'email', required: true, max: 254 },
  { name: 'specialization', label: 'Specialization', required: true, max: 120 },
  { name: 'hospital', label: 'Hospital', required: true, max: 200 },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, max: 32 },
];
export const clinicalFields: Field[] = [
  { name: 'condition', label: 'Condition', type: 'textarea', max: 2000 },
  { name: 'status', label: 'Status', options: statuses, required: true },
];
export const patientFields: Field[] = [
  { name: 'name', label: 'Name', required: true, max: 120 },
  { name: 'email', label: 'Email', type: 'email', max: 254 },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
  { name: 'gender', label: 'Gender', options: genders, required: true },
  { name: 'phone', label: 'Phone', type: 'tel', required: true, max: 32 },
  { name: 'address', label: 'Address', type: 'textarea', max: 500 },
];
export function formSchema(fields: Field[]) {
  const shape: Record<string, z.ZodType<string, string>> = {};
  for (const field of fields) {
    let value = field.type === 'password' ? z.string() : z.string().trim();
    if (field.required)
      value = value.min(
        field.min ?? 1,
        `${field.label} is required${field.min ? ` (at least ${field.min} characters)` : ''}`,
      );
    if (field.max)
      value = value.max(field.max, `Use at most ${field.max} characters`);
    let schema: z.ZodType<string, string> = value;
    if (field.type === 'email')
      schema = value.refine(
        (v) => !v || z.email().safeParse(v).success,
        'Enter a valid email',
      );
    if (field.options)
      schema = schema.refine(
        (v) => field.options!.includes(v),
        `Choose ${field.label.toLowerCase()}`,
      );
    if (field.type === 'date')
      schema = schema.refine(
        (v) =>
          /^\d{4}-\d{2}-\d{2}$/.test(v) &&
          v >= '1900-01-01' &&
          v <= today() &&
          Number.isFinite(Date.parse(`${v}T00:00:00Z`)) &&
          new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v,
        'Enter a real birth date from 1900 through today',
      );
    shape[field.name] = schema;
  }
  return z.object(shape);
}
export function FieldInput({
  field,
  register,
  errors,
}: {
  field: Field;
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
}) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const error = errors[field.name]?.message;
  const shared = {
    id,
    ...register(field.name),
    readOnly: field.readOnly,
    'aria-invalid': !!error,
    'aria-describedby': `${id}-help`,
    maxLength: field.max,
    required: field.required,
    className: 'input',
  };
  return (
    <div
      className={field.type === 'textarea' ? 'field col-span-full' : 'field'}
    >
      <label htmlFor={id}>{field.label}</label>
      {field.options ? (
        <select {...shared} disabled={field.readOnly}>
          <option value="">Choose {field.label.toLowerCase()}</option>
          {field.options.map((v) => (
            <option key={v} value={v}>
              {title(v)}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea {...shared} rows={4} />
      ) : field.type === 'password' ? (
        <div className="relative">
          <input
            {...shared}
            style={{ paddingRight: '3rem' }}
            type={showPassword ? 'text' : 'password'}
            autoComplete={field.autoComplete ?? 'new-password'}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-controls={id}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </Button>
        </div>
      ) : (
        <input
          {...shared}
          type={field.type ?? 'text'}
          autoComplete={
            field.autoComplete ??
            (field.type === 'email'
              ? 'email'
              : field.type === 'tel'
                ? 'tel'
                : undefined)
          }
          min={field.type === 'date' ? '1900-01-01' : undefined}
          max={field.type === 'date' ? today() : undefined}
        />
      )}
      <p id={`${id}-help`} className={error ? 'field-error' : 'field-help'}>
        {error ?? field.help}
      </p>
    </div>
  );
}
export function applyFieldErrors(
  error: unknown,
  setError: UseFormSetError<Values>,
) {
  if (error instanceof ApiError)
    for (const [key, messages] of Object.entries(error.fieldErrors ?? {}))
      setError(
        key.replace(/^profile\./, ''),
        { type: 'server', message: messages.join(' ') },
        { shouldFocus: true },
      );
}
export function RecordForm({
  fields,
  defaults,
  onSave,
  onReload,
  submitLabel,
  children,
}: {
  fields: Field[];
  defaults?: Values;
  onSave: (values: Values) => Promise<unknown>;
  onReload?: () => void | Promise<void>;
  submitLabel?: string;
  children?: React.ReactNode;
}) {
  const schema = useMemo(() => formSchema(fields), [fields]);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      fields.map((f) => [f.name, defaults?.[f.name] ?? '']),
    ),
  });
  const [error, setError] = useState<unknown>();
  const [lockedEmail, setLockedEmail] = useState(false);
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        setError(undefined);
        try {
          await onSave(values);
        } catch (err) {
          applyFieldErrors(err, form.setError);
          setError(err);
          if (err instanceof ApiError && err.code === 'EMAIL_IMMUTABLE') {
            setLockedEmail(true);
            form.setValue('email', defaults?.email ?? '');
          }
        }
      })}
      className="space-y-5"
    >
      <div className="form-grid">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={
              lockedEmail && field.name === 'email'
                ? {
                    ...field,
                    readOnly: true,
                    help: 'This email is linked to a login account and cannot change.',
                  }
                : field
            }
            register={form.register}
            errors={form.formState.errors}
          />
        ))}
      </div>
      {children}
      {!!error && (
        <ErrorState
          error={error}
          retry={
            error instanceof ApiError &&
            error.status === 409 &&
            error.code !== 'EMAIL_IMMUTABLE'
              ? () => {
                  void Promise.resolve().then(onReload).catch(setError);
                }
              : undefined
          }
        />
      )}
      <Submit busy={form.formState.isSubmitting}>{submitLabel}</Submit>
    </form>
  );
}
