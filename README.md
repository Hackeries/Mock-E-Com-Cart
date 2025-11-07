# Mock E-Commerce Cart

A full-stack shopping cart application built for Vibe Commerce screening. This application demonstrates a complete e-commerce flow with product browsing, cart management, and mock checkout functionality with production-ready features including accessibility, persistent storage, and optional Fake Store API integration.

## 🚀 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database for data persistence
- **CORS** - Cross-Origin Resource Sharing
- **Axios** - HTTP client for Fake Store API integration
- **Nanoid** - Unique receipt ID generation
- **dotenv** - Environment configuration

### Frontend
- **React** - UI library
- **Axios** - HTTP client for API requests
- **React Toastify** - Toast notifications for UX feedback
- **CSS3** - Responsive and accessible styling

## ✨ Features

### Core Requirements (Spec-Compliant)

#### Backend API Endpoints
- **GET /api/products** - Fetch all available products
- **POST /api/cart** - Add items to cart with quantity
- **GET /api/cart** - Retrieve cart items with server-calculated total
- **DELETE /api/cart/:id** - Remove items from cart
- **POST /api/checkout** - Process mock checkout and generate receipt

#### Extra Enhancement (Beyond Spec)
- **PUT /api/cart/:id** - Update cart item quantity (internal enhancement)

#### Frontend Features
- **Product Grid** - Displays products with images, descriptions, and prices
- **Add to Cart** - One-click button to add products with loading states
- **Shopping Cart View** - View cart items with quantity management
- **Quantity Update** - Increase or decrease item quantities (1-99)
- **Remove Items** - Delete items from cart with confirmation
- **Checkout Form** - Customer information form with validation
- **Receipt Modal** - Order confirmation with receipt details
- **Responsive Design** - Mobile-first interface with 44px touch targets
- **Error Handling** - User-friendly error messages with toast notifications

### Bonus Features

#### 🎯 Fake Store API Integration
- Toggle between seeded database products and Fake Store API products
- Controlled via `USE_FAKE_API` environment variable
- Automatic fallback to seeded data if API unavailable
- Data source indicator badge in UI

#### ♿ Accessibility (WCAG 2.1 AA Compliant)
- **Semantic HTML** - Proper heading hierarchy and landmarks
- **ARIA Labels** - Descriptive labels for all interactive elements
- **Keyboard Navigation** - Full keyboard-only flow support
- **Focus Management** - Visible focus indicators (2px outline)
- **Screen Reader Support** - aria-live announcements for cart actions
- **Form Accessibility** - Proper labels, required indicators, error messages
- **Touch Targets** - Minimum 44px for mobile ergonomics
- **Color Contrast** - WCAG AA compliant color schemes

#### 💾 Data Persistence
- **Cart Persistence** - Cart tied to mock user ID
- **Receipt Storage** - All checkout transactions stored in database
- **Deterministic IDs** - Receipts use nanoid for unique, short IDs

#### 🛡️ Enhanced Validation
- **Server-side totals** - Prevent client-side manipulation
- **Quantity constraints** - Min 1, Max 99 with 422 error responses
- **Email validation** - Format checking on checkout
- **Product verification** - Ensures products exist before cart operations
- **Structured errors** - `{error, details}` format for all errors

#### 🎨 UX Enhancements
- **Toast Notifications** - Success/error feedback for all actions
- **Optimistic Updates** - Immediate UI updates with rollback on error
- **Loading States** - Disabled buttons during API requests
- **Error Recovery** - Graceful handling with user-friendly messages

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
   
   # Optional: Create .env file for configuration
   cp .env.example .env
   # Edit .env to set USE_FAKE_API=true for Fake Store API mode
   
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

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory (see `.env.example`):

```bash
# Server Configuration
PORT=5000

# Data Source Configuration
# Set to 'true' to fetch products from Fake Store API
# Set to 'false' to use seeded database products (default)
USE_FAKE_API=false

# Mock User ID for cart persistence
MOCK_USER_ID=1
```

### Data Modes

#### Seeded Data Mode (Default)
```bash
USE_FAKE_API=false
npm start
```
- Uses 10 deterministic products with high-quality Unsplash images
- Reliable and fast (no external API calls)
- Full control over product data
- **Recommended for development and demos**

#### Fake Store API Mode
```bash
USE_FAKE_API=true
npm start
```
- Fetches products from https://fakestoreapi.com/products
- Maps external schema: `title → name`, `price`, `description`, `image`
- Caches products in database for consistency
- Fallback to seeded data if API unavailable
- **Optional bonus feature for reviewers**

## 📁 Project Structure

```
Mock-E-Com-Cart/
├── backend/
│   ├── server.js           # Express server and API routes
│   ├── server.test.js      # Backend validation tests
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment configuration template
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
│   │   ├── App.css         # Global styles with accessibility
│   │   ├── App.test.js     # Frontend tests
│   │   └── index.js        # React entry point
│   ├── public/
│   └── package.json        # Frontend dependencies
└── README.md
```

## 🔌 API Documentation

### Products

**GET /api/products**

Retrieve all available products.

```bash
curl http://localhost:5000/api/products
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Wireless Headphones",
    "price": 79.99,
    "description": "Premium noise-cancelling wireless headphones with superior sound quality",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop"
  }
]
```

### Cart

**POST /api/cart**

Add an item to the cart or update quantity if already exists.

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
```

**Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "productId": 1,
  "quantity": 2,
  "message": "Item added to cart successfully"
}
```

**Validation Errors:**
- **400** - Missing productId or quantity
- **404** - Product not found
- **422** - Quantity < 1 or > 99

**GET /api/cart**

Retrieve all cart items with server-calculated total.

```bash
curl http://localhost:5000/api/cart
```

**Response:**
```json
{
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

**PUT /api/cart/:id** *(Extra Enhancement - Beyond Spec)*

Update the quantity of a cart item.

```bash
curl -X PUT http://localhost:5000/api/cart/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

**Request:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "message": "Cart updated successfully",
  "id": 1,
  "quantity": 3
}
```

**Validation Errors:**
- **400** - Missing quantity
- **404** - Cart item not found
- **422** - Quantity < 1 or > 99

**DELETE /api/cart/:id**

Remove an item from the cart.

```bash
curl -X DELETE http://localhost:5000/api/cart/1
```

**Response:**
```json
{
  "message": "Item removed from cart successfully"
}
```

**Error:**
- **404** - Cart item not found

### Checkout

**POST /api/checkout**

Process a mock checkout and generate a receipt.

```bash
curl -X POST http://localhost:5000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [...],
    "customerName": "John Doe",
    "customerEmail": "john.doe@example.com"
  }'
```

**Request:**
```json
{
  "cartItems": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "name": "Wireless Headphones",
      "price": 79.99,
      "subtotal": 159.98
    }
  ],
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com"
}
```

**Response:**
```json
{
  "receiptId": "REC-K8jD9fL2pQ",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "items": [...],
  "total": 159.98,
  "timestamp": "2025-11-07T10:43:14.550Z",
  "status": "completed"
}
```

**Validation Errors:**
- **400** - Cart is empty or missing customer info
- **422** - Invalid email format

### Data Source

**GET /api/data-source**

Get the current product data source.

```bash
curl http://localhost:5000/api/data-source
```

**Response:**
```json
{
  "source": "Seeded Data",
  "useFakeApi": false
}
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Tests cover:
- Quantity validation (1-99 range)
- Email format validation
- Server-side total calculation

### Frontend Tests

```bash
cd frontend
npm test
```

Tests cover:
- Component rendering
- Cart functionality
- Total calculation logic

## 📋 Demo Script

Follow this exact flow for a comprehensive demonstration:

1. **Browse Products**
   - Load the application at `http://localhost:3000`
   - Observe the product grid with 10 items
   - Note the data source badge ("Seeded Data" or "Fake Store API")

2. **Add to Cart**
   - Click "Add to Cart" on 2-3 different products
   - Observe success toast notifications
   - See cart count update in header

3. **View Cart**
   - Click the "Cart (X)" button in header
   - View cart items with images and prices
   - Note server-calculated total

4. **Edit Quantities**
   - Increase/decrease quantity using number input
   - Observe quantity update toast
   - See total recalculated automatically

5. **Remove Item**
   - Click "Remove" on one item
   - Observe removal toast notification
   - See total update

6. **Checkout Flow**
   - Click "Proceed to Checkout"
   - Fill in customer name and email
   - Try submitting with invalid email (see validation)
   - Correct and submit

7. **View Receipt**
   - See order confirmation modal
   - Note unique receipt ID (e.g., REC-K8jD9fL2pQ)
   - Observe timestamp and order details
   - Click "Close"

8. **Verify Cart Cleared**
   - Click "Cart" button
   - Confirm cart is empty after checkout

### Keyboard Navigation Demo

1. Press `Tab` to navigate through all interactive elements
2. Press `Enter` or `Space` to activate buttons
3. Use arrow keys in number inputs
4. Navigate through form fields with `Tab`
5. Close modals with `Esc` key

## 🔒 Security & Error Handling

### Implemented Safeguards

- ✅ **Input validation** on all API endpoints
- ✅ **Email format validation** on checkout with regex
- ✅ **Quantity validation** (1-99 range) with 422 errors
- ✅ **Product existence verification** before cart operations
- ✅ **Server-side total calculation** to prevent manipulation
- ✅ **Structured error responses** with `{error, details}` format
- ✅ **SQL injection protection** via parameterized queries
- ✅ **CORS enabled** for cross-origin requests
- ✅ **Graceful error handling** with user-friendly messages
- ✅ **No PII exposure** in receipts (minimal customer data)

### Error Response Format

All errors follow this structure:

```json
{
  "error": "Validation failed",
  "details": "Quantity must be at least 1"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (missing required fields)
- `404` - Not Found (resource doesn't exist)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

## 📊 Requirements Compliance

### ✅ Base Requirements

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Backend REST APIs | ✅ | Express.js with 5 spec-compliant endpoints |
| Product listing | ✅ | GET /api/products |
| Add to cart | ✅ | POST /api/cart |
| View cart | ✅ | GET /api/cart with server-calculated total |
| Remove from cart | ✅ | DELETE /api/cart/:id |
| Checkout | ✅ | POST /api/checkout with validation |
| Frontend product grid | ✅ | React component with responsive grid |
| Cart management | ✅ | Full CRUD with optimistic updates |
| Checkout form | ✅ | Name + email with validation |
| Receipt display | ✅ | Modal with order confirmation |
| Responsive design | ✅ | Mobile-first with breakpoints |
| Error handling | ✅ | Toast notifications + structured errors |

### 🌟 Bonus Features

| Feature | Status | Implementation |
|---------|--------|----------------|
| Fake Store API | ✅ | USE_FAKE_API toggle with fallback |
| Data persistence | ✅ | SQLite with receipts table |
| User sessions | ✅ | Mock user ID for cart persistence |
| Accessibility | ✅ | WCAG 2.1 AA compliant |
| Advanced validation | ✅ | Server-side with 422 errors |
| Testing | ✅ | Jest tests for backend + frontend |

### 🎯 Extra Enhancements (Beyond Spec)

- **PUT /api/cart/:id** - Update quantity endpoint (documented as extra)
- **Optimistic updates** - Immediate UI feedback with rollback
- **Toast notifications** - Real-time user feedback
- **Loading states** - Disabled buttons during requests
- **Data source badge** - Shows Seeded/Fake Store mode
- **High-quality images** - Unsplash images in seeded data
- **Receipt persistence** - All checkouts stored in database
- **Deterministic IDs** - nanoid for short, unique receipt IDs

## 🎨 Accessibility Highlights

### Keyboard Navigation
- Full keyboard-only navigation support
- Logical tab order matching visual flow
- Visible focus indicators (2px outline)
- No keyboard traps in modals

### Screen Readers
- Semantic HTML with proper landmarks
- ARIA labels on all buttons ("Add Wireless Headphones to cart")
- aria-live regions for dynamic content
- Descriptive alt text on images
- Form field associations with labels

### Form Accessibility
- Explicit labels for all inputs (not placeholders)
- Required field indicators with aria-required
- Inline error messages with aria-describedby
- Error summary at top of form with role="alert"

### Mobile Accessibility
- 44px minimum touch targets
- Responsive text sizing
- High color contrast ratios
- No reliance on hover states

## 🚀 Scripts

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
```

### Frontend

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

## 🌟 Future Enhancements

- User authentication and authorization
- Multiple user cart support
- Product categories and filtering
- Search functionality with autocomplete
- Payment gateway integration (Stripe)
- Order history tracking
- Admin dashboard for product management
- Real-time inventory updates
- Email notifications for orders
- Product reviews and ratings
- Wishlist functionality
- Advanced analytics

## 📝 License

This project is created for the Vibe Commerce screening assignment.

## 👤 Author

Created as part of a full-stack coding assignment demonstrating production-ready web development practices.

---

**Note:** This is a mock e-commerce application for demonstration purposes. No real payments are processed, and all checkout operations are simulated.
