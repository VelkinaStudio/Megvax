import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Active',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Paused',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Draft',
  },
};

export const Small: Story = {
  args: {
    variant: 'success',
    size: 'sm',
    children: 'Small Badge',
  },
};

export const WithDot: Story = {
  args: {
    variant: 'success',
    dot: true,
    children: 'Live',
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Badge',
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="danger">Danger</Badge>
        <Badge variant="info">Info</Badge>
        <Badge variant="neutral">Neutral</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" size="sm">Small</Badge>
        <Badge variant="success" size="md">Medium</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="success" dot>Active</Badge>
        <Badge variant="warning" dot>Pending</Badge>
        <Badge variant="danger" dot>Paused</Badge>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-600">Campaign Status Examples:</p>
        <div className="flex gap-2">
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="danger" dot>Paused</Badge>
          <Badge variant="neutral">Archived</Badge>
        </div>
      </div>
    </div>
  ),
};
