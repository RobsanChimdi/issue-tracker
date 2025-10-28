'use client';

import { useTransition } from 'react';
import { deleteIssue } from '@/app/actions/deletionAnd Updation';

export function DeleteB({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      await deleteIssue(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors"
    >
      {isPending ? 'Deleting...' : 'Delete Issue'}
    </button>
  );
}
