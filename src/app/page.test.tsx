import { render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import Home from './page';

jest.mock('./auth-context', () => ({
  useAuth: () => ({
    authState: { status: 'unauthenticated', user: null },
  }),
}));

jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

jest.mock('react-sticky-el', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

test('renders welcome message', () => {
  render(
    <Theme>
      <Home />
    </Theme>
  );
  // const button = screen.getByTestId('my-button'); // <button data-testid="my-button" ...>
  // expect(button).toBeInTheDocument();

  expect(screen.getByText('Welcome to FocusFlow')).toBeInTheDocument();
});