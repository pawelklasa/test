import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing page headline', () => {
  render(<App />);
  const headline = screen.getByText(/welcome to my landing page/i);
  expect(headline).toBeInTheDocument();
});
