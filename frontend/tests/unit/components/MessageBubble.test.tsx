import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from '../../../src/components/MessageBubble';

describe('MessageBubble', () => {
  it('renders user message content', () => {
    render(
      <MessageBubble id="msg-1" role="user" content="Hello from user" />
    );

    expect(screen.getByText('Hello from user')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(
      <MessageBubble id="msg-2" role="assistant" content="Hello from assistant" />
    );

    expect(screen.getByText('Hello from assistant')).toBeInTheDocument();
  });

  it('shows streaming cursor when isStreaming is true', () => {
    const { container } = render(
      <MessageBubble
        id="msg-3"
        role="assistant"
        content="Streaming response"
        isStreaming={true}
      />
    );

    // The streaming cursor is a span with a blink animation inside the Typography
    const cursor = container.querySelector('span');
    expect(cursor).toBeInTheDocument();
  });

  it('does not show streaming cursor when isStreaming is false', () => {
    render(
      <MessageBubble
        id="msg-4"
        role="assistant"
        content="Complete response"
        isStreaming={false}
      />
    );

    // No cursor span should be rendered
    const textElement = screen.getByText('Complete response');
    const cursor = textElement.querySelector('span');
    expect(cursor).toBeNull();
  });

  it('does not show streaming cursor by default (isStreaming not provided)', () => {
    render(
      <MessageBubble id="msg-5" role="assistant" content="Default response" />
    );

    const textElement = screen.getByText('Default response');
    const cursor = textElement.querySelector('span');
    expect(cursor).toBeNull();
  });
});
