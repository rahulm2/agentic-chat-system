import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageList from '../../../src/components/MessageList';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

const noop = vi.fn();

describe('MessageList', () => {
  it('shows welcome prompts when no messages', () => {
    render(<MessageList messages={[]} streamingMessageId={null} onSelectPrompt={noop} />);

    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });

  it('renders message area with data-testid="message-area"', () => {
    render(<MessageList messages={[]} streamingMessageId={null} onSelectPrompt={noop} />);

    expect(screen.getByTestId('message-area')).toBeInTheDocument();
  });

  it('renders list of messages', () => {
    const messages = [
      { id: 'msg-1', role: 'user' as const, content: 'First message' },
      { id: 'msg-2', role: 'assistant' as const, content: 'Second message' },
      { id: 'msg-3', role: 'user' as const, content: 'Third message' },
    ];

    render(<MessageList messages={messages} streamingMessageId={null} onSelectPrompt={noop} />);

    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(screen.getByText('Third message')).toBeInTheDocument();
  });

  it('renders both user and assistant messages', () => {
    const messages = [
      { id: 'msg-1', role: 'user' as const, content: 'User says hello' },
      { id: 'msg-2', role: 'assistant' as const, content: 'Assistant replies' },
    ];

    render(<MessageList messages={messages} streamingMessageId={null} onSelectPrompt={noop} />);

    expect(screen.getByText('User says hello')).toBeInTheDocument();
    expect(screen.getByText('Assistant replies')).toBeInTheDocument();
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
  });
});
