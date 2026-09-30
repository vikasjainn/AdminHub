'use client';

import Modal, { DANGER_BUTTON, PRIMARY_BUTTON, SECONDARY_BUTTON } from '@/components/modals/Modal';
import { useAppDispatch } from '@/store/hooks';
import { closeModal } from '@/store/uiSlice';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  pending?: boolean;
  onConfirm: () => void;
}

export default function ConfirmDialog({ title, description, confirmLabel, tone = 'danger', pending, onConfirm }: ConfirmDialogProps) {
  const dispatch = useAppDispatch();
  return (
    <Modal
      title={title}
      description={description}
      footer={
        <>
          <button type="button" className={SECONDARY_BUTTON} disabled={pending} onClick={() => dispatch(closeModal())}>
            Keep
          </button>
          <button type="button" className={tone === 'danger' ? DANGER_BUTTON : PRIMARY_BUTTON} disabled={pending} onClick={onConfirm}>
            {pending ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    />
  );
}
