import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ArrowRight, Download, Plus } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    fullWidth: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Campaign',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

export const WithIconLeft: Story = {
  args: {
    variant: 'primary',
    children: 'Add Campaign',
    icon: <Plus className="w-4 h-4" />,
    iconPosition: 'left',
  },
};

export const WithIconRight: Story = {
  args: {
    variant: 'primary',
    children: 'Continue',
    icon: <ArrowRight className="w-4 h-4" />,
    iconPosition: 'right',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Saving...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" icon={<Download className="w-4 h-4" />}>
          With Icon
        </Button>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  ),
};
