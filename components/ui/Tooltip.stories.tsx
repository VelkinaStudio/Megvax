import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './Tooltip';
import { Button } from './Button';
import { HelpCircle } from 'lucide-react';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: 'This is a helpful tooltip',
    placement: 'top',
    children: (
      <Button variant="secondary">
        Hover me
      </Button>
    ),
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip appears below',
    placement: 'bottom',
    children: (
      <Button variant="secondary">
        Hover me
      </Button>
    ),
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on the left',
    placement: 'left',
    children: (
      <Button variant="secondary">
        Hover me
      </Button>
    ),
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on the right',
    placement: 'right',
    children: (
      <Button variant="secondary">
        Hover me
      </Button>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    content: 'ROAS (Return on Ad Spend) measures the revenue generated per dollar spent on ads.',
    placement: 'top',
    children: (
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <HelpCircle className="w-5 h-5" />
      </button>
    ),
  },
};

export const LongText: Story = {
  args: {
    content: 'This is a longer tooltip with multiple lines of text to demonstrate how tooltips handle longer content. It should wrap nicely within the max-width constraint.',
    placement: 'top',
    children: (
      <Button variant="secondary">
        Hover for long text
      </Button>
    ),
  },
};

export const QuickDelay: Story = {
  args: {
    content: 'Quick tooltip (200ms)',
    delay: 200,
    children: (
      <Button variant="secondary">
        Quick tooltip
      </Button>
    ),
  },
};

export const AllPlacements: Story = {
  args: {
    content: 'Tooltip',
    children: <Button variant="secondary">Button</Button>,
  },
  render: () => (
    <div className="flex flex-col items-center gap-20 p-20">
      <Tooltip content="Top tooltip" placement="top">
        <Button variant="secondary">Top</Button>
      </Tooltip>

      <div className="flex items-center gap-20">
        <Tooltip content="Left tooltip" placement="left">
          <Button variant="secondary">Left</Button>
        </Tooltip>

        <Tooltip content="Right tooltip" placement="right">
          <Button variant="secondary">Right</Button>
        </Tooltip>
      </div>

      <Tooltip content="Bottom tooltip" placement="bottom">
        <Button variant="secondary">Bottom</Button>
      </Tooltip>
    </div>
  ),
};
