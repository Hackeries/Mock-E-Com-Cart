import React from 'react';
import './Cart.css';

function Cart({ cart, onRemoveItem, onUpdateQuantity, onCheckout, onContinueShopping }) {
  const handleQuantityChange = (itemId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (qty > 0) {
      onUpdateQuantity(itemId, qty);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <button className="btn btn-secondary" onClick={onContinueShopping}>
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
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="cart-item-quantity">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  />
                </div>
                <div className="cart-item-subtotal">
                  <strong>${item.subtotal.toFixed(2)}</strong>
                </div>
                <button
                  className="btn btn-danger remove-btn"
                  onClick={() => onRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-total">
              <h3>Total: ${cart.total.toFixed(2)}</h3>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
