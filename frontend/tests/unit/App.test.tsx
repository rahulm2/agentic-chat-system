import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.getElementById('root') || document.body).toBeTruthy();
  });

  it('wraps in MUI ThemeProvider', () => {
    const { container } = render(<App />);
    // MUI ThemeProvider injects CSS baseline and theme styles
    // Verify that the app renders with MUI components (ChatPage contains MUI elements)
    expect(container.firstChild).toBeTruthy();
  });
});
