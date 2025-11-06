const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

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

  // Cart table
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(id)
  )`);

  // Check if products exist, if not, seed them
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)");
      
      const products = [
        ['Wireless Headphones', 79.99, 'Premium noise-cancelling wireless headphones', 'https://via.placeholder.com/150?text=Headphones'],
        ['Smart Watch', 199.99, 'Fitness tracking smartwatch with heart rate monitor', 'https://via.placeholder.com/150?text=Smart+Watch'],
        ['Laptop Stand', 49.99, 'Ergonomic aluminum laptop stand', 'https://via.placeholder.com/150?text=Laptop+Stand'],
        ['USB-C Hub', 39.99, 'Multi-port USB-C hub with HDMI and SD card reader', 'https://via.placeholder.com/150?text=USB+Hub'],
        ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical keyboard with blue switches', 'https://via.placeholder.com/150?text=Keyboard'],
        ['Wireless Mouse', 29.99, 'Ergonomic wireless mouse with adjustable DPI', 'https://via.placeholder.com/150?text=Mouse'],
        ['Webcam HD', 69.99, '1080p HD webcam with built-in microphone', 'https://via.placeholder.com/150?text=Webcam'],
        ['Phone Case', 19.99, 'Durable protective phone case', 'https://via.placeholder.com/150?text=Phone+Case'],
        ['Screen Protector', 14.99, 'Tempered glass screen protector', 'https://via.placeholder.com/150?text=Screen+Protector'],
        ['Charging Cable', 12.99, 'Fast charging USB-C cable 6ft', 'https://via.placeholder.com/150?text=Cable']
      ];

      products.forEach(product => {
        stmt.run(product);
      });
      
      stmt.finalize();
      console.log('Database seeded with products');
    }
  });
});

// API Routes

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /api/cart - Add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  if (quantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }

  // Check if product exists
  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    db.get("SELECT * FROM cart WHERE productId = ?", [productId], (err, cartItem) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (cartItem) {
        // Update quantity
        const newQuantity = cartItem.quantity + quantity;
        db.run("UPDATE cart SET quantity = ? WHERE id = ?", [newQuantity, cartItem.id], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
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
        db.run("INSERT INTO cart (productId, quantity) VALUES (?, ?)", [productId, quantity], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ 
            id: this.lastID, 
            productId, 
            quantity,
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
      return res.status(500).json({ error: err.message });
    }

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
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  });
});

// PUT /api/cart/:id - Update cart item quantity
app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  db.run("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated successfully', id, quantity });
  });
});

// POST /api/checkout - Mock checkout
app.post('/api/checkout', (req, res) => {
  const { cartItems, customerName, customerEmail } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  if (!customerName || !customerEmail) {
    return res.status(400).json({ error: 'Customer name and email are required' });
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const timestamp = new Date().toISOString();

  // Clear the cart after checkout
  db.run("DELETE FROM cart", [], function(err) {
    if (err) {
      console.error('Error clearing cart:', err);
    }
  });

  // Create mock receipt
  const receipt = {
    receiptId: `REC-${Date.now()}`,
    customerName,
    customerEmail,
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    timestamp,
    status: 'completed'
  };

  res.json(receipt);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
