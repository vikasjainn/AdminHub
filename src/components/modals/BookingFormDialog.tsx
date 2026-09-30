'use client';

import { useState } from 'react';
import Modal, { CONTROL_CLASS, Field, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/components/modals/Modal';
import { SERVICE_TYPES } from '@/lib/constants';
import { isoDate, isoFromReference } from '@/lib/dates';
import { useLedgerActions } from '@/hooks/mutations';
import { useUsers } from '@/hooks/queries';
import { useAppDispatch } from '@/store/hooks';
import { closeModal } from '@/store/uiSlice';
import type { Booking, ServiceType } from '@/types';

/** Reschedule (`booking` given) or create a new booking. */
export default function BookingFormDialog({ booking }: { booking?: Booking }) {
  const dispatch = useAppDispatch();
  const { data: users = [] } = useUsers();
  const { rescheduleBooking, createBooking } = useLedgerActions();
  const [userId, setUserId] = useState<number | null>(null);
  const [service, setService] = useState<ServiceType>(SERVICE_TYPES[0]);
  const [date, setDate] = useState(booking?.date ?? isoDate(isoFromReference(1)));
  const [time, setTime] = useState(booking?.time ?? '10:00');
  const customer = users.find((user) => user.id === userId) ?? users[0];
  const canSubmit = Boolean(date && time && (booking || customer));

  const submit = () => {
    if (booking) rescheduleBooking(booking, date, time);
    else if (customer) createBooking({ userId: customer.id, service, date, time }, customer);
  };

  return (
    <Modal
      title={booking ? `Reschedule ${booking.code}` : 'New booking'}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} onClick={() => dispatch(closeModal())}>
            Cancel
          </button>
          <button type="button" className={PRIMARY_BUTTON} disabled={!canSubmit} onClick={submit}>
            {booking ? 'Reschedule' : 'Create booking'}
          </button>
        </>
      }
    >
      {!booking && (
        <>
          <Field label="Customer">
            <select className={CONTROL_CLASS} value={customer?.id ?? ''} onChange={(e) => setUserId(Number(e.target.value))}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service type">
            <select className={CONTROL_CLASS} value={service} onChange={(e) => setService(e.target.value as ServiceType)}>
              {SERVICE_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <input type="date" className={CONTROL_CLASS} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <input type="time" className={CONTROL_CLASS} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
