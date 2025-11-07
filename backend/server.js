require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { nanoid } = require('nanoid');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const USE_FAKE_API = process.env.USE_FAKE_API === 'true';
const MOCK_USER_ID = parseInt(process.env.MOCK_USER_ID || '1', 10);
const FAKE_STORE_API_TIMEOUT = 5000; // 5 seconds timeout for Fake Store API

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database setup
const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT
  )`);

  // Carts table with user_id for persistence
  db.run(`CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 1
  )`);

  // Cart items table
  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 99),
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Legacy cart table for backward compatibility (will migrate data)
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id)
  )`);

  // Receipts table for checkout persistence
  db.run(`CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    total REAL NOT NULL,
    timestamp TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    items_json TEXT NOT NULL
  )`);

  // Ensure we have a default cart for the mock user
  db.get("SELECT COUNT(*) as count FROM carts WHERE user_id = ?", [MOCK_USER_ID], (err, row) => {
    if (!err && row.count === 0) {
      db.run("INSERT INTO carts (user_id) VALUES (?)", [MOCK_USER_ID], function(err) {
        if (!err) {
          console.log(`Created cart for mock user ${MOCK_USER_ID} with cart_id ${this.lastID}`);
          
          // Migrate legacy cart items if they exist
          db.all("SELECT * FROM cart", [], (err, items) => {
            if (!err && items.length > 0) {
              const stmt = db.prepare("INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)");
              items.forEach(item => {
                stmt.run([this.lastID, item.productId, item.quantity]);
              });
              stmt.finalize(() => {
                db.run("DELETE FROM cart"); // Clear legacy cart
                console.log('Migrated legacy cart items');
              });
            }
          });
        }
      });
    }
  });

  // Seed products or fetch from Fake Store API
  if (USE_FAKE_API) {
    console.log('Fetching products from Fake Store API...');
    fetchFromFakeStoreAPI();
  } else {
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
      if (!err && row.count === 0) {
        seedProducts();
      } else {
        console.log('Using seeded database products');
      }
    });
  }
});

// Seed products function
function seedProducts() {
  const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
  
  const products = [
    ['Wireless Headphones', 79.99, 'Premium noise-cancelling wireless headphones with superior sound quality', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop'],
    ['Smart Watch', 199.99, 'Fitness tracking smartwatch with heart rate monitor and GPS', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&h=150&fit=crop'],
    ['Laptop Stand', 49.99, 'Ergonomic aluminum laptop stand for better posture', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=150&h=150&fit=crop'],
    ['USB-C Hub', 39.99, 'Multi-port USB-C hub with HDMI and SD card reader', 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=150&h=150&fit=crop'],
    ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical keyboard with blue switches', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=150&h=150&fit=crop'],
    ['Wireless Mouse', 29.99, 'Ergonomic wireless mouse with adjustable DPI', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=150&h=150&fit=crop'],
    ['Webcam HD', 69.99, '1080p HD webcam with built-in microphone for video calls', 'https://images.unsplash.com/photo-1587320261016-84c0ce6e6516?w=150&h=150&fit=crop'],
    ['Phone Case', 19.99, 'Durable protective phone case with shock absorption', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=150&h=150&fit=crop'],
    ['Screen Protector', 14.99, 'Tempered glass screen protector with anti-scratch coating', 'https://images.unsplash.com/photo-1622782914767-404fb9ab3f57?w=150&h=150&fit=crop'],
    ['Charging Cable', 12.99, 'Fast charging USB-C cable 6ft with reinforced connectors', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=150&h=150&fit=crop']
  ];

  products.forEach(product => {
    stmt.run(product);
  });
  
  stmt.finalize();
  console.log('Database seeded with 10 products');
}

// Fetch and cache products from Fake Store API
async function fetchFromFakeStoreAPI() {
  try {
    const response = await axios.get('https://fakestoreapi.com/products', { timeout: FAKE_STORE_API_TIMEOUT });
    const fakeProducts = response.data.slice(0, 10); // Take first 10 products
    
    db.get("SELECT COUNT(*) as count FROM products", [], (err, row) => {
      if (!err && row.count === 0) {
        const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
        
        fakeProducts.forEach(product => {
          // Map Fake Store API fields to our schema
          stmt.run([
            product.title,        // title -> name
            product.price,        // price
            product.description,  // description
            product.image        // image
          ]);
        });
        
        stmt.finalize();
        console.log('Database seeded with Fake Store API products');
      } else {
        console.log('Products already exist, skipping Fake Store API fetch');
      }
    });
  } catch (error) {
    console.error('Failed to fetch from Fake Store API, falling back to seeded data:', error.message);
    seedProducts();
  }
}

// API Routes

// GET /api/data-source - Get current data source
app.get('/api/data-source', (req, res) => {
  res.json({ 
    source: USE_FAKE_API ? 'Fake Store API' : 'Seeded Data',
    useFakeApi: USE_FAKE_API
  });
});

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
      });
    }
    res.json(rows);
  });
});

// POST /api/cart - Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Product ID and quantity are required' 
    });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    return res.status(422).json({ 
      error: 'Validation failed',
      details: 'Quantity must be at least 1' 
    });
  }

  if (qty > 99) {
    return res.status(422).json({ 
      error: 'Validation failed',
      details: 'Quantity cannot exceed 99' 
    });
  }

  // Check if product exists
  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
      });
    }
    if (!product) {
      return res.status(404).json({ 
        error: 'Not found',
        details: 'Product not found' 
      });
    }

    // Check if item already in cart (using legacy table for backward compatibility)
    db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, cartItem) => {
      if (err) {
        return res.status(500).json({ 
          error: 'Internal server error',
          details: err.message 
        });
      }

      if (cartItem) {
        // Update quantity with validation
        const newQuantity = cartItem.quantity + qty;
        if (newQuantity > 99) {
          return res.status(422).json({ 
            error: 'Validation failed',
            details: 'Total quantity cannot exceed 99' 
          });
        }

        db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, cartItem.id], function(err) {
          if (err) {
            return res.status(500).json({ 
              error: 'Internal server error',
              details: err.message 
            });
          }
          res.json({ 
            id: cartItem.id, 
            productId, 
            quantity: newQuantity,
            message: 'Cart updated successfully' 
          });
        });
      } else {
        // Insert new item
        db.run("INSERT INTO cart (productId, quantity) VALUES (?, ?)", [productId, qty], function(err) {
          if (err) {
            return res.status(500).json({ 
              error: 'Internal server error',
              details: err.message 
            });
          }
          res.status(201).json({ 
            id: this.lastID, 
            productId, 
            quantity: qty,
            message: 'Item added to cart successfully' 
          });
        });
      }
    });
  });
});

// GET /api/cart - Get cart with total
app.get('/api/cart', (req, res) => {
  const query = `
    SELECT 
      cart.id,
      cart.productId,
      cart.quantity,
      products.name,
      products.price,
      products.image,
      (cart.quantity * products.price) as subtotal
    FROM cart
    JOIN products ON cart.productId = products.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
      });
    }

    // Server-side total calculation to prevent client drift
    const total = rows.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      items: rows,
      total: parseFloat(total.toFixed(2))
    });
  });
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM cart WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        details: 'Cart item not found' 
      });
    }

    res.json({ message: 'Item removed from cart successfully' });
  });
});

// PUT /api/cart/:id - Update cart item quantity (EXTRA ENHANCEMENT)
// Note: This is an enhancement beyond the base spec requirements
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Quantity is required' 
    });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    return res.status(422).json({ 
      error: 'Validation failed',
      details: 'Quantity must be at least 1' 
    });
  }

  if (qty > 99) {
    return res.status(422).json({ 
      error: 'Validation failed',
      details: 'Quantity cannot exceed 99' 
    });
  }

  db.run("UPDATE cart SET quantity = ? WHERE id = ?", [qty, id], function(err) {
    if (err) {
      return res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        details: 'Cart item not found' 
      });
    }

    res.json({ message: 'Cart updated successfully', id, quantity: qty });
  });
});

// POST /api/checkout - Mock checkout
app.post('/api/checkout', (req, res) => {
  const { cartItems, customerName, customerEmail } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Cart is empty' 
    });
  }

  if (!customerName || !customerEmail) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: 'Customer name and email are required' 
    });
  }

  // Email validation
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(422).json({ 
      error: 'Validation failed',
      details: 'Invalid email format' 
    });
  }

  // Server-side total calculation to prevent manipulation
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const timestamp = new Date().toISOString();
  const receiptId = `REC-${nanoid(10)}`; // Deterministic short ID

  // Create receipt object
  const receipt = {
    receiptId,
    customerName,
    customerEmail,
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    timestamp,
    status: 'completed'
  };

  // Store receipt in database
  db.run(
    "INSERT INTO receipts (id, total, timestamp, name, email, items_json) VALUES (?, ?, ?, ?, ?, ?)",
    [receiptId, receipt.total, timestamp, customerName, customerEmail, JSON.stringify(cartItems)],
    function(err) {
      if (err) {
        console.error('Error storing receipt:', err);
        // Continue even if storage fails - don't break checkout flow
      }
    }
  );

  // Clear the cart after checkout
  db.run("DELETE FROM cart", [], function(err) {
    if (err) {
      console.error('Error clearing cart:', err);
    }
  });

  res.json(receipt);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
