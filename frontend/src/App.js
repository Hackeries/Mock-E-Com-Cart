import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  const [dataSource, setDataSource] = useState('');
  const [processingItems, setProcessingItems] = useState(new Set());

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchDataSource();
  }, []);

  const fetchDataSource = async () => {
    try {
      const response = await axios.get(`${API_URL}/data-source`);
      setDataSource(response.data.source);
    } catch (err) {
      console.error('Failed to fetch data source:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      toast.error('Failed to load products. Please try again.');
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
    // Prevent duplicate requests
    if (processingItems.has(productId)) return;
    
    setProcessingItems(prev => new Set(prev).add(productId));
    
    try {
      await axios.post(`${API_URL}/cart`, {
        productId,
        quantity: 1
      });
      await fetchCart();
      toast.success('Product added to cart!', {
        position: 'bottom-right',
        autoClose: 2000
      });
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.details || 'Failed to add item to cart';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (processingItems.has(cartItemId)) return;
    
    setProcessingItems(prev => new Set(prev).add(cartItemId));

    // Optimistic update
    const previousCart = { ...cart };
    setCart(prev => ({
      items: prev.items.filter(item => item.id !== cartItemId),
      total: prev.items
        .filter(item => item.id !== cartItemId)
        .reduce((sum, item) => sum + item.subtotal, 0)
    }));

    try {
      await axios.delete(`${API_URL}/cart/${cartItemId}`);
      toast.info('Item removed from cart', {
        position: 'bottom-right',
        autoClose: 2000
      });
    } catch (err) {
      // Rollback on error
      setCart(previousCart);
      const errorMsg = err.response?.data?.details || 'Failed to remove item from cart';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
      await fetchCart(); // Sync with server
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    if (processingItems.has(cartItemId)) return;
    
    setProcessingItems(prev => new Set(prev).add(cartItemId));

    try {
      await axios.put(`${API_URL}/cart/${cartItemId}`, { quantity });
      await fetchCart();
      toast.success('Quantity updated', {
        position: 'bottom-right',
        autoClose: 1500
      });
    } catch (err) {
      const errorMsg = err.response?.data?.details || 'Failed to update cart';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
      await fetchCart(); // Revert to server state
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
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
      toast.success('Order completed successfully!', {
        position: 'top-center',
        autoClose: 3000
      });
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.details || 'Failed to process checkout';
      setError(errorMsg);
      toast.error(errorMsg);
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
        {dataSource && (
          <div className="data-source-badge" aria-label={`Product data from ${dataSource}`}>
            📦 {dataSource}
          </div>
        )}
        <div className="header-actions">
          <button 
            className="cart-button"
            onClick={() => setShowCart(!showCart)}
            aria-label={`Shopping cart with ${cart.items.length} items`}
          >
            🛒 Cart ({cart.items.length})
          </button>
        </div>
      </header>

      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {/* Announcements handled by toast notifications */}
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
          <button 
            onClick={() => setError(null)}
            aria-label="Dismiss error message"
          >
            ×
          </button>
        </div>
      )}

      <main className="main-content">
        {!showCart ? (
          <div className="products-section">
            <h2>Products</h2>
            {loading ? (
              <div className="loading" role="status" aria-live="polite">
                Loading products...
              </div>
            ) : (
              <ProductGrid 
                products={products} 
                onAddToCart={addToCart}
                processingItems={processingItems}
              />
            )}
          </div>
        ) : (
          <Cart
            cart={cart}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onCheckout={() => setShowCheckout(true)}
            onContinueShopping={() => setShowCart(false)}
            processingItems={processingItems}
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
          <div className="modal receipt-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="receipt-title" aria-modal="true">
            <div className="modal-header">
              <h2 id="receipt-title">Order Confirmation</h2>
              <button className="close-button" onClick={closeReceipt} aria-label="Close receipt">×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-info">
                <p><strong>Receipt ID:</strong> {receipt.receiptId}</p>
                <p><strong>Customer:</strong> {receipt.customerName}</p>
                <p><strong>Email:</strong> {receipt.customerEmail}</p>
                <p><strong>Date:</strong> {new Date(receipt.timestamp).toLocaleString()}</p>
                <p><strong>Status:</strong> <span className="status-badge">{receipt.status}</span></p>
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

      <ToastContainer />
    </div>
  );
}

export default App;
