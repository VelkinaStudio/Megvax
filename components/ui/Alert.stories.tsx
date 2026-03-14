import type { Meta, StoryObj } from '@storybook/react';
import { Alert, Banner } from './Alert';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Your campaign has been activated successfully!',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Your daily budget is nearly exhausted. Consider increasing it.',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Failed to connect to Meta Ads. Please check your credentials.',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    message: 'New features have been added to your dashboard. Check them out!',
  },
};

export const WithTitle: Story = {
  args: {
    type: 'warning',
    title: 'Budget Alert',
    message: 'You have spent 80% of your monthly budget. Review your campaigns.',
  },
};

export const WithAction: Story = {
  args: {
    type: 'info',
    title: 'New Recommendation',
    message: 'We found 3 optimization opportunities for your campaigns.',
    action: {
      label: 'View Recommendations',
      onClick: () => alert('View recommendations'),
    },
  },
};

export const Dismissible: Story = {
  args: {
    type: 'success',
    message: 'Your changes have been saved.',
    dismissible: true,
    onDismiss: () => console.log('Dismissed'),
  },
};

export const AllTypes: Story = {
  args: {
    type: 'info',
    message: 'Alert',
  },
  render: () => (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Alert
        type="success"
        title="Success"
        message="Your campaign has been activated successfully!"
        dismissible
      />
      <Alert
        type="warning"
        title="Warning"
        message="Your daily budget is nearly exhausted."
        action={{
          label: 'Increase Budget',
          onClick: () => {},
        }}
      />
      <Alert
        type="error"
        title="Error"
        message="Failed to connect to Meta Ads API."
        dismissible
      />
      <Alert
        type="info"
        title="Information"
        message="New features are available in your dashboard."
        action={{
          label: 'Learn More',
          onClick: () => {},
        }}
        dismissible
      />
    </div>
  ),
};

export const SuccessBanner: Story = {
  args: { type: 'success', message: 'Banner' },
  render: () => (
    <Banner
      type="success"
      message="Your account has been successfully connected to Meta Ads!"
      dismissible
    />
  ),
};

export const WarningBanner: Story = {
  args: { type: 'warning', message: 'Banner' },
  render: () => (
    <Banner
      type="warning"
      message="Scheduled maintenance will occur on Sunday at 2:00 AM UTC."
      action={{
        label: 'View Details',
        onClick: () => {},
      }}
      dismissible
    />
  ),
};

export const ErrorBanner: Story = {
  args: { type: 'error', message: 'Banner' },
  render: () => (
    <Banner
      type="error"
      message="Connection to Meta Ads API failed. Retrying..."
    />
  ),
};

export const InfoBanner: Story = {
  args: { type: 'info', message: 'Banner' },
  render: () => (
    <Banner
      type="info"
      message="New optimization features are now available!"
      action={{
        label: 'Learn More',
        onClick: () => {},
      }}
      dismissible
    />
  ),
};
