import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Mail, Search, User } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Campaign Name',
    placeholder: 'Enter campaign name',
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Budget',
    placeholder: '0.00',
    helperText: 'Enter your daily budget in TRY',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search campaigns...',
    icon: <Search className="w-5 h-5" />,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Username',
    value: 'johndoe',
    success: 'Username is available',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Campaign ID',
    value: 'CAMP-12345',
    disabled: true,
  },
};

export const AllStates: Story = {
  args: {
    placeholder: 'Input',
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8 w-full">
      <Input label="Default State" placeholder="Enter text..." />

      <Input
        label="With Icon"
        placeholder="Search..."
        icon={<Search className="w-5 h-5" />}
      />

      <Input
        label="Required Field"
        placeholder="Required..."
        required
        helperText="This field is required"
      />

      <Input
        label="Error State"
        value="invalid"
        error="This value is invalid"
      />

      <Input
        label="Success State"
        value="valid"
        success="Looks good!"
      />

      <Input label="Disabled" value="Cannot edit" disabled />
    </div>
  ),
};
