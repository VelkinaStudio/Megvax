import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { ArrowRight, TrendingUp } from 'lucide-react';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>This is a default card with some content inside.</p>,
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <p>This is an elevated card with a larger shadow.</p>,
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: <p>Hover over this card to see the interaction effect.</p>,
  },
};

export const Flat: Story = {
  args: {
    variant: 'flat',
    children: <p>This is a flat card with no shadow.</p>,
  },
};

export const WithHeaderAndContent: Story = {
  args: {
    children: (
      <>
        <CardHeader
          title="Campaign Performance"
          description="Overview of your campaign metrics"
        />
        <CardContent>
          <p className="text-gray-700">
            Your campaigns are performing well this week with a 15% increase in ROAS.
          </p>
        </CardContent>
      </>
    ),
  },
};

export const WithHeaderAction: Story = {
  args: {
    children: (
      <>
        <CardHeader
          title="Recent Campaigns"
          description="Your latest ad campaigns"
          action={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        />
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Summer Sale 2024</span>
              <span className="text-sm font-medium text-accent-success">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Black Friday Prep</span>
              <span className="text-sm font-medium text-gray-500">Paused</span>
            </div>
          </div>
        </CardContent>
      </>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <>
        <CardHeader
          title="AI Recommendation"
          description="Optimize your campaign budget"
        />
        <CardContent>
          <p className="text-gray-700">
            We recommend increasing your daily budget by 20% to maximize reach during peak hours.
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex gap-3">
            <Button variant="primary" size="sm">
              Apply
            </Button>
            <Button variant="ghost" size="sm">
              Dismiss
            </Button>
          </div>
        </CardFooter>
      </>
    ),
  },
};

export const MetricCard: Story = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Spend</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">₺12,450</p>
          </div>
          <div className="p-2 bg-accent-primary/10 rounded-lg">
            <TrendingUp className="w-6 h-6 text-accent-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-medium text-accent-success">↑ 12.5%</span>
          <span className="text-sm text-gray-600">vs last week</span>
        </div>
      </>
    ),
  },
};

export const InteractiveList: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="divide-y divide-gray-200">
        {['Campaign A', 'Campaign B', 'Campaign C'].map((name, i) => (
          <div
            key={i}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
          >
            <span className="text-sm font-medium text-gray-900">{name}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-accent-primary transition-colors" />
          </div>
        ))}
      </div>
    ),
  },
};

export const AllVariants: Story = {
  args: {
    children: <p>Card</p>,
  },
  render: () => (
    <div className="flex flex-col gap-6 p-8 w-full">
      <Card variant="default">
        <p>Default Card</p>
      </Card>

      <Card variant="elevated">
        <p>Elevated Card</p>
      </Card>

      <Card variant="interactive">
        <p>Interactive Card (hover me)</p>
      </Card>

      <Card variant="flat">
        <p>Flat Card</p>
      </Card>

      <Card variant="default" padding="sm">
        <p>Small Padding</p>
      </Card>

      <Card variant="default" padding="lg">
        <p>Large Padding</p>
      </Card>
    </div>
  ),
};
