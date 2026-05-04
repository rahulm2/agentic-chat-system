import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatPage from '../../src/components/ChatPage';

describe('ChatPage', () => {
  it('renders ChatHeader, message area, and ChatInput', () => {
    render(<ChatPage />);

    // ChatHeader should show the app title
    expect(screen.getByText('Agentic Chat')).toBeInTheDocument();

    // Message area should exist
    expect(screen.getByTestId('message-area')).toBeInTheDocument();

    // ChatInput should render its text field
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });
});
