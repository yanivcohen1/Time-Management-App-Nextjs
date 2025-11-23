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

jest.mock('lucide-react', () => ({
  CalendarIcon: () => null,
}));

jest.mock('@radix-ui/themes', () => ({
  Badge: () => null,
  Box: () => null,
  Button: () => null,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Checkbox: () => null,
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenu: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Grid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Heading: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
  Select: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Item: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  Separator: () => null,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Popover: {
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Close: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  },
  Theme: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@radix-ui/react-collapsible', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => null,
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('axios-mock-adapter', () => {
  return jest.fn().mockImplementation(() => ({
    onGet: jest.fn().mockReturnThis(),
    reply: jest.fn(),
  }));
});

jest.mock('primereact/toast', () => ({
  Toast: () => null,
}));

jest.mock('./auth-context', () => ({
  useAuth: () => ({
    authState: { status: 'unauthenticated', user: null },
  }),
}));

jest.mock('@/lib-fe/jwt-storage', () => ({
  readJwtToken: () => 'mock-token',
}));

jest.mock('date-fns', () => ({
  format: () => 'mock-date',
}));

jest.mock('@/components/ui/calendar', () => ({
  Calendar: () => null,
}));

jest.mock('@/components/ui/button', () => ({
  Button: () => null,
}));

jest.mock('@/components/ui/popover', () => ({
  Popover: () => null,
  PopoverTrigger: () => null,
  PopoverContent: () => null,
}));

jest.mock('@radix-ui/react-popover', () => ({
  Popover: () => null,
  PopoverTrigger: () => null,
  PopoverContent: () => null,
}));

jest.mock('@/lib/utils', () => ({
  cn: () => '',
}));

test('renders welcome message', () => {
  render(
    <Theme>
      <Home />
    </Theme>
  );
  // const button = screen.getByTestId('my-button'); // <button data-testid="my-button" ...>
  // expect(button).toBeInTheDocument(); // Example assertion

  expect(screen.getByText('Welcome to FocusFlow')).toBeInTheDocument();
});