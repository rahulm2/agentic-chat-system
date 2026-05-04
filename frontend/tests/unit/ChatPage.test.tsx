import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ChatPage from '../../src/components/ChatPage';
import { ChatProvider } from '../../src/context';

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatProvider>{ui}</ChatProvider>
    </QueryClientProvider>
  );
}

describe('ChatPage', () => {
  it('renders ChatHeader, message area, and ChatInput', () => {
    renderWithProviders(<ChatPage />);

    expect(screen.getByText('Agentic Chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message Agentic Chat...')).toBeInTheDocument();
  });

  it('renders logout button in header', () => {
    renderWithProviders(<ChatPage />);

    expect(screen.getByLabelText('Log out')).toBeInTheDocument();
  });

  it('renders new chat button in header', () => {
    renderWithProviders(<ChatPage />);

    expect(screen.getByLabelText('New chat')).toBeInTheDocument();
  });

  it('shows welcome prompts when no messages', () => {
    renderWithProviders(<ChatPage />);

    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });
});
