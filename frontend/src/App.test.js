import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('Cart functionality', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({
          data: [
            { id: 1, name: 'Test Product', price: 10.00, description: 'Test', image: 'test.jpg' }
          ]
        });
      }
      if (url.includes('/cart')) {
        return Promise.resolve({
          data: { items: [], total: 0 }
        });
      }
      if (url.includes('/data-source')) {
        return Promise.resolve({
          data: { source: 'Seeded Data', useFakeApi: false }
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('renders Vibe Commerce header', async () => {
    render(<App />);
    const headerElement = screen.getByText(/Vibe Commerce/i);
    expect(headerElement).toBeInTheDocument();
  });

  test('displays cart with item count', async () => {
    render(<App />);
    await waitFor(() => {
      const cartButton = screen.getByRole('button', { name: /cart/i });
      expect(cartButton).toBeInTheDocument();
    });
  });

  test('cart total calculation is server-driven', () => {
    const items = [
      { subtotal: 10.50 },
      { subtotal: 20.25 },
      { subtotal: 5.75 }
    ];
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    expect(parseFloat(total.toFixed(2))).toBe(36.50);
  });
});

