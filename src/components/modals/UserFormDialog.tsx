'use client';

import { useState } from 'react';
import Modal, { CONTROL_CLASS, Field, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/components/modals/Modal';
import { ROLES, USER_STATUSES } from '@/lib/constants';
import { useUserMutations, type UserFormValues } from '@/hooks/mutations';
import { useAppDispatch } from '@/store/hooks';
import { closeModal } from '@/store/uiSlice';
import type { Role, User, UserStatus } from '@/types';

type FormErrors = Partial<Record<keyof UserFormValues, string>>;

const EMPTY: UserFormValues = { firstName: '', lastName: '', email: '', phone: '', role: 'Viewer', status: 'Active' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: UserFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required';
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
}

const toFormValues = (user: User): UserFormValues => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
});

/** Add (no `user`) or edit (`user`) form. */
export default function UserFormDialog({ user }: { user?: User }) {
  const dispatch = useAppDispatch();
  const { create, update } = useUserMutations();
  const [values, setValues] = useState<UserFormValues>(user ? toFormValues(user) : EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(values) : {};
  const pending = create.isPending || update.isPending;

  const set = <K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(validate(values)).length) return;
    const cleaned = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    };
    if (user) update.mutate({ user, patch: cleaned });
    else create.mutate(cleaned);
  };

  return (
    <Modal
      title={user ? 'Edit user' : 'Add user'}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={() => dispatch(closeModal())}>
            Cancel
          </button>
          <button type="button" className={PRIMARY_BUTTON} disabled={pending} onClick={submit}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errors.firstName}>
          <input autoFocus className={CONTROL_CLASS} value={values.firstName} onChange={(e) => set('firstName', e.target.value)} />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input className={CONTROL_CLASS} value={values.lastName} onChange={(e) => set('lastName', e.target.value)} />
        </Field>
      </div>
      <Field label="Email" error={errors.email}>
        <input type="email" className={CONTROL_CLASS} value={values.email} onChange={(e) => set('email', e.target.value)} />
      </Field>
      <Field label="Phone">
        <input className={CONTROL_CLASS} value={values.phone} onChange={(e) => set('phone', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Role">
          <select className={CONTROL_CLASS} value={values.role} onChange={(e) => set('role', e.target.value as Role)}>
            {ROLES.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className={CONTROL_CLASS} value={values.status} onChange={(e) => set('status', e.target.value as UserStatus)}>
            {USER_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
