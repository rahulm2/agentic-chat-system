import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  it('wraps in MUI ThemeProvider and renders ChatPage with provider', () => {
    render(<App />);
    // App renders ThemeProvider > ChatProvider > ChatPage
    // ChatPage renders ChatHeader with title, MessageList with message-area, and ChatInput
    expect(screen.getByText('Agentic Chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
  });
});
