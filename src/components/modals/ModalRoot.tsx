'use client';

import { usePathname, useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import UserFormDialog from '@/components/modals/UserFormDialog';
import BookingFormDialog from '@/components/modals/BookingFormDialog';
import { useLedgerActions, useUserMutations } from '@/hooks/mutations';
import { useBooking, useTransaction, useUser } from '@/hooks/queries';
import { formatMoney } from '@/lib/format';
import { useAppSelector } from '@/store/hooks';

/** Renders whichever dialog the Redux `ui.modal` state asks for. */
export default function ModalRoot() {
  const modal = useAppSelector((state) => state.ui.modal);
  if (!modal) return null;

  switch (modal.kind) {
    case 'addUser':
      return <UserFormDialog />;
    case 'editUser':
      return <EditUser userId={modal.userId} />;
    case 'deleteUser':
      return <DeleteUser userId={modal.userId} />;
    case 'toggleUserStatus':
      return <ToggleUserStatus userId={modal.userId} />;
    case 'refundTransaction':
      return <RefundTransaction transactionId={modal.transactionId} />;
    case 'newBooking':
      return <BookingFormDialog />;
    case 'rescheduleBooking':
      return <RescheduleBooking bookingId={modal.bookingId} />;
    case 'cancelBooking':
      return <CancelBooking bookingId={modal.bookingId} />;
  }
}

function EditUser({ userId }: { userId: number }) {
  const { data: user } = useUser(userId);
  return user ? <UserFormDialog user={user} /> : null;
}

function DeleteUser({ userId }: { userId: number }) {
  const { data: user } = useUser(userId);
  const { remove } = useUserMutations();
  const router = useRouter();
  const pathname = usePathname();
  if (!user) return null;
  return (
    <ConfirmDialog
      title="Delete user"
      description={`${user.firstName} ${user.lastName} will be removed from the directory.`}
      confirmLabel="Delete"
      pending={remove.isPending}
      onConfirm={() =>
        remove.mutate(user, { onSuccess: () => pathname.startsWith('/users/') && router.push('/users') })
      }
    />
  );
}

function ToggleUserStatus({ userId }: { userId: number }) {
  const { data: user } = useUser(userId);
  const { update } = useUserMutations();
  if (!user) return null;
  const suspending = user.status !== 'Suspended';
  return (
    <ConfirmDialog
      title={suspending ? 'Suspend user' : 'Activate user'}
      description={
        suspending
          ? `${user.firstName} ${user.lastName} will lose access until reactivated.`
          : `${user.firstName} ${user.lastName} will regain access to the platform.`
      }
      confirmLabel={suspending ? 'Suspend' : 'Activate'}
      tone={suspending ? 'danger' : 'primary'}
      pending={update.isPending}
      onConfirm={() => update.mutate({ user, patch: { status: suspending ? 'Suspended' : 'Active' } })}
    />
  );
}

function RefundTransaction({ transactionId }: { transactionId: number }) {
  const { data: transaction } = useTransaction(transactionId);
  const { refundTransaction } = useLedgerActions();
  if (!transaction) return null;
  return (
    <ConfirmDialog
      title="Refund transaction"
      description={`${formatMoney(transaction.amount)} will be returned to ${transaction.customer}.`}
      confirmLabel="Refund"
      tone="primary"
      onConfirm={() => refundTransaction(transaction)}
    />
  );
}

function RescheduleBooking({ bookingId }: { bookingId: number }) {
  const { data: booking } = useBooking(bookingId);
  return booking ? <BookingFormDialog booking={booking} /> : null;
}

function CancelBooking({ bookingId }: { bookingId: number }) {
  const { data: booking } = useBooking(bookingId);
  const { cancelBooking } = useLedgerActions();
  if (!booking) return null;
  return (
    <ConfirmDialog
      title="Cancel booking"
      description={`${booking.code} for ${booking.customer} will be marked as cancelled.`}
      confirmLabel="Cancel booking"
      onConfirm={() => cancelBooking(booking)}
    />
  );
}
