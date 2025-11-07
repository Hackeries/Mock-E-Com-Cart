import React from 'react';
import './ProductGrid.css';

function ProductGrid({ products, onAddToCart, processingItems = new Set() }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article key={product.id} className="product-card">
          <div className="product-image">
            <img src={product.image} alt={product.name} loading="lazy" />
          </div>
          <div className="product-info">
            <h3>{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="product-footer">
              <span className="product-price" aria-label={`Price: $${product.price.toFixed(2)}`}>
                ${product.price.toFixed(2)}
              </span>
              <button 
                className="btn btn-primary add-to-cart-btn"
                onClick={() => onAddToCart(product.id)}
                disabled={processingItems.has(product.id)}
                aria-label={`Add ${product.name} to cart`}
              >
                {processingItems.has(product.id) ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProductGrid;
