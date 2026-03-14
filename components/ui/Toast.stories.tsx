import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToast } from './Toast';
import { Button } from './Button';

const meta = {
  title: 'UI/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

function ToastDemo() {
  const toast = useToast();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Toast Notifications</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click buttons below to trigger different toast notifications.
        They will appear in the bottom-right corner.
      </p>

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          onClick={() => toast.success('Campaign activated successfully!')}
        >
          Show Success Toast
        </Button>

        <Button
          variant="secondary"
          onClick={() => toast.error('Failed to connect to Meta Ads API.')}
        >
          Show Error Toast
        </Button>

        <Button
          variant="ghost"
          onClick={() => toast.info('New features are now available.')}
        >
          Show Info Toast
        </Button>

        <Button
          variant="primary"
          onClick={() =>
            toast.success('Campaign paused', {
              action: {
                label: 'Undo',
                onClick: () => console.log('Undo action'),
              },
            })
          }
        >
          Toast with Action (Undo)
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            toast.info('3 new optimization opportunities found', {
              action: {
                label: 'View',
                onClick: () => console.log('View action'),
              },
              duration: 8000,
            })
          }
        >
          Long Duration Toast (8s)
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            toast.success('First toast');
            setTimeout(() => toast.info('Second toast'), 500);
            setTimeout(() => toast.error('Third toast'), 1000);
          }}
        >
          Multiple Toasts (Stacking)
        </Button>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  args: { children: <div /> },
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};

export const Success: Story = {
  args: { children: <div /> },
  render: () => (
    <ToastProvider>
      <div className="flex flex-col gap-3">
        <Button onClick={() => {
          const toast = useToast();
          toast.success('Campaign activated!');
        }}>
          Success Example
        </Button>
        <p className="text-sm text-gray-600">
          Success toasts for positive actions (saves, activations, etc.)
        </p>
      </div>
    </ToastProvider>
  ),
};

export const Error: Story = {
  args: { children: <div /> },
  render: () => (
    <ToastProvider>
      <div className="flex flex-col gap-3">
        <Button variant="danger" onClick={() => {
          const toast = useToast();
          toast.error('Connection failed');
        }}>
          Error Example
        </Button>
        <p className="text-sm text-gray-600">
          Error toasts for failures and critical issues
        </p>
      </div>
    </ToastProvider>
  ),
};

export const WithAction: Story = {
  args: { children: <div /> },
  render: () => (
    <ToastProvider>
      <div className="flex flex-col gap-3">
        <Button onClick={() => {
          const toast = useToast();
          toast.success('Campaign paused', {
            action: {
              label: 'Undo',
              onClick: () => alert('Undo clicked'),
            },
          });
        }}>
          Toast with Undo
        </Button>
        <p className="text-sm text-gray-600">
          Toasts can have action buttons (e.g., Undo, View, Retry)
        </p>
      </div>
    </ToastProvider>
  ),
};
