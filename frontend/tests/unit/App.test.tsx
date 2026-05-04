import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  it('shows login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to Agentic Chat')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows continue button on login page', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});
