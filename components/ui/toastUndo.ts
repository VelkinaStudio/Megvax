export type ArchiveEntity = 'campaign' | 'adset' | 'ad';

type AddToastFn = (message: string, type?: 'success' | 'error' | 'info', options?: { durationMs?: number; action?: { label: string; onClick: () => void } }) => void;

type UndoAction = { label: string; onClick: () => void };

function entityPath(entity: ArchiveEntity): string {
  if (entity === 'campaign') return 'campaigns';
  if (entity === 'adset') return 'adsets';
  return 'ads';
}

export function createPatchUndoAction(params: {
  addToast: AddToastFn;
  baseUrl: string;
  entity: ArchiveEntity;
  id: string;
  body: Record<string, unknown>;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
}): UndoAction {
  const {
    addToast,
    baseUrl,
    entity,
    id,
    body,
    label = 'Undo',
    successMessage = 'Undone.',
    errorMessage = 'Undo failed.',
  } = params;

  return {
    label,
    onClick: () => {
      void (async () => {
        try {
          await fetch(`${baseUrl}/api/meta/${entityPath(entity)}/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          addToast(successMessage, 'success');
        } catch {
          addToast(errorMessage, 'error');
        }
      })();
    },
  };
}

export function createStatusUndoAction(params: {
  addToast: AddToastFn;
  baseUrl: string;
  entity: ArchiveEntity;
  id: string;
  status: string;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
}): UndoAction {
  const {
    addToast,
    baseUrl,
    entity,
    id,
    status,
    label = 'Undo',
    successMessage = 'Undone.',
    errorMessage = 'Undo failed.',
  } = params;

  return {
    label,
    onClick: () => {
      void (async () => {
        try {
          await fetch(`${baseUrl}/api/meta/${entityPath(entity)}/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });
          addToast(successMessage, 'success');
        } catch {
          addToast(errorMessage, 'error');
        }
      })();
    },
  };
}

export function createArchiveUndoAction(params: {
  addToast: AddToastFn;
  baseUrl: string;
  entity: ArchiveEntity;
  id: string;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
}): UndoAction {
  const {
    addToast,
    baseUrl,
    entity,
    id,
    label = 'Undo',
    successMessage = 'Undone. Entity archived.',
    errorMessage = 'Undo failed.',
  } = params;

  return {
    label,
    onClick: () => {
      void (async () => {
        try {
          await fetch(`${baseUrl}/api/meta/${entityPath(entity)}/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'archived' }),
          });
          addToast(successMessage, 'success');
        } catch {
          addToast(errorMessage, 'error');
        }
      })();
    },
  };
}

export function createArchiveChainUndoAction(params: {
  addToast: AddToastFn;
  baseUrl: string;
  items: Array<{ entity: ArchiveEntity; id: string }>;
  label?: string;
  successMessage?: string;
  errorMessage?: string;
}): UndoAction {
  const {
    addToast,
    baseUrl,
    items,
    label = 'Undo',
    successMessage = 'Undone. Entities archived.',
    errorMessage = 'Undo failed.',
  } = params;

  return {
    label,
    onClick: () => {
      void (async () => {
        try {
          for (const item of items) {
            await fetch(`${baseUrl}/api/meta/${entityPath(item.entity)}/${item.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'archived' }),
            });
          }
          addToast(successMessage, 'success');
        } catch {
          addToast(errorMessage, 'error');
        }
      })();
    },
  };
}
