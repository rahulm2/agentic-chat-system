import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../../src/components/ChatInput';

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByPlaceholderText('Message Agentic Chat...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('calls onSend with message text when submitted', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Message Agentic Chat...');
    await user.type(input, 'Hello world');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith('Hello world');
  });

  it('clears input after send', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(<ChatInput onSend={onSend} />);

    const input = screen.getByPlaceholderText('Message Agentic Chat...');
    await user.type(input, 'Hello world');
    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(input).toHaveValue('');
  });
});
