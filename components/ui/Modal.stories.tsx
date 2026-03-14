import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ConfirmModal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    isOpen: true,
    title: 'Basic Modal',
    onClose: () => {},
    children: <p>This is a basic modal with some content inside.</p>,
  },
};

export const WithDescription: Story = {
  args: {
    isOpen: true,
    title: 'Campaign Details',
    description: 'View and edit campaign information',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Here you can view detailed information about your campaign.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-900">Campaign Name</p>
          <p className="text-sm text-gray-600">Summer Sale 2024</p>
        </div>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    isOpen: true,
    title: 'Save Changes',
    description: 'Review your changes before saving',
    onClose: () => {},
    children: <p className="text-gray-700">Are you sure you want to save these changes?</p>,
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </>
    ),
  },
};

export const WithForm: Story = {
  args: {
    isOpen: true,
    title: 'Edit Campaign Name',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <Input
          label="Campaign Name"
          placeholder="Enter new campaign name"
          defaultValue="Summer Sale 2024"
        />
        <Input
          label="Daily Budget"
          placeholder="0.00"
          helperText="Enter your daily budget in TRY"
        />
      </div>
    ),
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Update Campaign</Button>
      </>
    ),
  },
};

export const SmallSize: Story = {
  args: {
    isOpen: true,
    title: 'Quick Action',
    size: 'sm',
    onClose: () => {},
    children: <p className="text-gray-700">This is a small modal for quick actions.</p>,
    footer: <Button variant="primary" fullWidth>Confirm</Button>,
  },
};

export const LargeSize: Story = {
  args: {
    isOpen: true,
    title: 'Campaign Analytics',
    size: 'lg',
    onClose: () => {},
    children: (
      <div className="space-y-4">
        <p className="text-gray-700">
          This large modal can contain more complex content like charts and tables.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm font-medium">Metric {i}</p>
              <p className="text-2xl font-bold mt-2">1,234</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

export const Interactive: Story = {
  args: {
    isOpen: false,
    title: 'Interactive',
    onClose: () => {},
    children: <p>Content</p>,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Interactive Modal"
          description="Click outside or press ESC to close"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            This modal demonstrates the interactive behavior. Try clicking the backdrop
            or pressing the Escape key to close it.
          </p>
        </Modal>
      </div>
    );
  },
};

export const ConfirmDialog: Story = {
  args: {
    isOpen: false,
    title: 'Confirm',
    onClose: () => {},
    children: <p>Content</p>,
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);
      setIsOpen(false);
    };

    return (
      <div>
        <Button variant="danger" onClick={() => setIsOpen(true)}>
          Delete Campaign
        </Button>
        <ConfirmModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onConfirm={handleConfirm}
          title="Delete Campaign"
          message="Are you sure you want to delete this campaign? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
          loading={loading}
        />
      </div>
    );
  },
};

export const AllSizes: Story = {
  args: {
    isOpen: false,
    title: 'Modal',
    onClose: () => {},
    children: <p>Modal content</p>,
  },
  render: () => {
    const [activeSize, setActiveSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null);

    return (
      <div className="flex gap-3">
        <Button onClick={() => setActiveSize('sm')}>Small</Button>
        <Button onClick={() => setActiveSize('md')}>Medium</Button>
        <Button onClick={() => setActiveSize('lg')}>Large</Button>
        <Button onClick={() => setActiveSize('xl')}>Extra Large</Button>

        {activeSize && (
          <Modal
            isOpen={true}
            onClose={() => setActiveSize(null)}
            title={`${activeSize.toUpperCase()} Modal`}
            size={activeSize}
          >
            <p className="text-gray-700">
              This is a {activeSize} sized modal to demonstrate different modal sizes.
            </p>
          </Modal>
        )}
      </div>
    );
  },
};
