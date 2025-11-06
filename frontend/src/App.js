import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      setCart(response.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(`${API_URL}/cart`, {
        productId,
        quantity: 1
      });
      await fetchCart();
      setError(null);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error(err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`);
      await fetchCart();
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error(err);
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    try {
      await axios.put(`${API_URL}/cart/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      setError('Failed to update cart');
      console.error(err);
    }
  };

  const handleCheckout = async (customerInfo) => {
    try {
      const response = await axios.post(`${API_URL}/checkout`, {
        cartItems: cart.items,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email
      });
      setReceipt(response.data);
      await fetchCart(); // Refresh cart after checkout
      setShowCheckout(false);
      setError(null);
    } catch (err) {
      setError('Failed to process checkout');
      console.error(err);
    }
  };

  const closeReceipt = () => {
    setReceipt(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vibe Commerce</h1>
        <div className="header-actions">
          <button 
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
          >
            🛒 Cart ({cart.items.length})
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <main className="main-content">
        {!showCart ? (
          <div className="products-section">
            <h2>Products</h2>
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <ProductGrid products={products} onAddToCart={addToCart} />
            )}
          </div>
        ) : (
          <Cart
            cart={cart}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={() => setShowCheckout(true)}
            onContinueShopping={() => setShowCart(false)}
          />
        )}
      </main>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckout}
        />
      )}

      {receipt && (
        <div className="modal-overlay" onClick={closeReceipt}>
          <div className="modal receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Confirmation</h2>
              <button className="close-button" onClick={closeReceipt}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-info">
                <p><strong>Receipt ID:</strong> {receipt.receiptId}</p>
                <p><strong>Customer:</strong> {receipt.customerName}</p>
                <p><strong>Email:</strong> {receipt.customerEmail}</p>
                <p><strong>Date:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> {receipt.status}</p>
              </div>
              <div className="receipt-items">
                <h3>Items:</h3>
                {receipt.items.map((item, index) => (
                  <div key={index} className="receipt-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="receipt-total">
                <strong>Total: ${receipt.total.toFixed(2)}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeReceipt}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
