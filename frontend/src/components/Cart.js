import React from 'react';
import './Cart.css';

function Cart({ cart, onRemoveItem, onUpdateQuantity, onCheckout, onContinueShopping, processingItems = new Set() }) {
  const handleQuantityChange = (itemId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty >= 1 && qty <= 99) {
      onUpdateQuantity(itemId, qty);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button 
          className="btn btn-secondary" 
          onClick={onContinueShopping}
          aria-label="Continue shopping"
        >
          ← Continue Shopping
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="btn btn-primary" onClick={onContinueShopping}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items" role="list">
            {cart.items.map((item) => (
              <article key={item.id} className="cart-item" role="listitem">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity">
                  <label htmlFor={`qty-${item.id}`}>Quantity:</label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    max="99"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    disabled={processingItems.has(item.id)}
                    aria-label={`Quantity for ${item.name}`}
                  />
                </div>
                <div className="cart-item-subtotal">
                  <span className="sr-only">Subtotal:</span>
                  <strong>${item.subtotal.toFixed(2)}</strong>
                </div>
                <button
                  className="btn btn-danger remove-btn"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={processingItems.has(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  {processingItems.has(item.id) ? 'Removing...' : 'Remove'}
                </button>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <h3>Total: ${cart.total.toFixed(2)}</h3>
            </div>
            <button 
              className="btn btn-primary checkout-btn" 
              onClick={onCheckout}
              aria-label="Proceed to checkout"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
