# Mock E-Commerce Cart

A full-stack shopping cart application built for Vibe Commerce screening. This application demonstrates a complete e-commerce flow with product browsing, cart management, and mock checkout functionality.

## 🚀 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database for data persistence
- **CORS** - Cross-Origin Resource Sharing
- **Body-Parser** - Request body parsing middleware

### Frontend
- **React** - UI library
- **Axios** - HTTP client for API requests
- **CSS3** - Responsive styling

## ✨ Features

### Backend API Endpoints

- **GET /api/products** - Fetch all available products (10 mock items)
- **POST /api/cart** - Add items to cart with quantity
- **GET /api/cart** - Retrieve cart items with calculated total
- **PUT /api/cart/:id** - Update cart item quantity
- **DELETE /api/cart/:id** - Remove items from cart
- **POST /api/checkout** - Process mock checkout and generate receipt

### Frontend Features

- **Product Grid** - Displays products with images, descriptions, and prices
- **Add to Cart** - One-click button to add products to cart
- **Shopping Cart View** - View cart items with quantity management
- **Quantity Update** - Increase or decrease item quantities
- **Remove Items** - Delete items from cart
- **Checkout Form** - Customer information form with validation
- **Receipt Modal** - Order confirmation with receipt details
- **Responsive Design** - Mobile-friendly interface
- **Error Handling** - User-friendly error messages

## 📋 Requirements Met

✅ Backend REST APIs for products, cart, and checkout  
✅ Frontend product grid with "Add to Cart" functionality  
✅ Cart view with items, quantities, and totals  
✅ Remove and update cart item functionality  
✅ Checkout form with name and email validation  
✅ Receipt modal showing order confirmation  
✅ Responsive design for mobile and desktop  
✅ SQLite database for data persistence  
✅ Comprehensive error handling  
✅ Clean, maintainable code structure

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hackeries/Mock-E-Com-Cart.git
   cd Mock-E-Com-Cart
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The backend server will start on `http://localhost:5000`

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   The frontend will start on `http://localhost:3000`

4. **Access the Application**
   Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
Mock-E-Com-Cart/
├── backend/
│   ├── server.js           # Express server and API routes
│   ├── package.json        # Backend dependencies
│   └── ecommerce.db        # SQLite database (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductGrid.js      # Product listing component
│   │   │   ├── ProductGrid.css
│   │   │   ├── Cart.js             # Shopping cart component
│   │   │   ├── Cart.css
│   │   │   ├── CheckoutModal.js    # Checkout form component
│   │   │   └── CheckoutModal.css
│   │   ├── App.js          # Main application component
│   │   ├── App.css         # Global styles
│   │   └── index.js        # React entry point
│   ├── public/
│   └── package.json        # Frontend dependencies
└── README.md
```

## 🔌 API Documentation

### Products

**GET /api/products**
```json
Response: [
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "description": "Premium noise-cancelling wireless headphones",
    "image": "https://via.placeholder.com/150?text=Headphones"
  }
]
```

### Cart

**POST /api/cart**
```json
Request: {
  "productId": 1,
  "quantity": 2
}

Response: {
  "id": 1,
  "productId": 1,
  "quantity": 2,
  "message": "Item added to cart successfully"
}
```

**GET /api/cart**
```json
Response: {
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "name": "Wireless Headphones",
      "price": 79.99,
      "image": "...",
      "subtotal": 159.98
    }
  ],
  "total": 159.98
}
```

**PUT /api/cart/:id**
```json
Request: {
  "quantity": 3
}

Response: {
  "message": "Cart updated successfully",
  "id": 1,
  "quantity": 3
}
```

**DELETE /api/cart/:id**
```json
Response: {
  "message": "Item removed from cart successfully"
}
```

### Checkout

**POST /api/checkout**
```json
Request: {
  "cartItems": [...],
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com"
}

Response: {
  "receiptId": "REC-1234567890",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "items": [...],
  "total": 159.98,
  "timestamp": "2025-11-06T11:50:54.887Z",
  "status": "completed"
}
```

## 🧪 Testing the Application

1. **Browse Products** - View the product grid on the home page
2. **Add to Cart** - Click "Add to Cart" on any product
3. **View Cart** - Click the cart button in the header
4. **Update Quantity** - Change quantities in the cart view
5. **Remove Items** - Click "Remove" to delete items from cart
6. **Checkout** - Click "Proceed to Checkout"
7. **Complete Order** - Fill in customer details and submit
8. **View Receipt** - See the order confirmation modal

## 🎨 Screenshots

### Products Page
![Products Page](https://github.com/user-attachments/assets/00d19eba-467b-4470-b75a-c51b32ad7930)

### Shopping Cart
![Shopping Cart](https://github.com/user-attachments/assets/a6b0468d-68e4-40e8-a43e-9780abc392a8)

### Checkout Form
![Checkout Modal](https://github.com/user-attachments/assets/e08590d4-3223-4446-8bb9-bbc342a95521)

### Order Confirmation
![Receipt Modal](https://github.com/user-attachments/assets/06ecc31d-8077-4476-9b36-989c108c16c1)

## 🔒 Security & Error Handling

- Input validation on all API endpoints
- Email format validation on checkout
- Quantity validation (positive integers only)
- Product existence verification before adding to cart
- Graceful error handling with user-friendly messages
- CORS enabled for cross-origin requests

## 🌟 Future Enhancements

- User authentication and authorization
- Multiple user cart support
- Product categories and filtering
- Search functionality
- Payment gateway integration
- Order history tracking
- Admin dashboard for product management
- Real-time inventory updates
- Integration with Fake Store API

## 📝 License

This project is created for the Vibe Commerce screening assignment.

## 👤 Author

Created as part of a full-stack coding assignment.
