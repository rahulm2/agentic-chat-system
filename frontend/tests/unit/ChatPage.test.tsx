import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ChatPage from '../../src/components/ChatPage';
import { ChatProvider } from '../../src/context';

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

    // ChatHeader should show the app title
    expect(screen.getByText('Agentic Chat')).toBeInTheDocument();

    // Message area should exist
    expect(screen.getByTestId('message-area')).toBeInTheDocument();

    // ChatInput should render its text field
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });
});
