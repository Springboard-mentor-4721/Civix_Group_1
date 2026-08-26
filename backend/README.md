# Civix Backend Service (Phase 1)

Civix is a Digital Civic Engagement & Petition Platform designed to empower citizens and government officials to engage transparently on civic issues, petitions, polling, and governance reporting.

This service constitutes the **REST API Backend** built for **Phase 1 / Milestone 1: User Roles & Verification**.

---

## 🛠 Tech Stack

- **Runtime Environment:** Node.js (v18+)
- **Web Framework:** Express.js (v4.x)
- **Database:** MongoDB
- **Object Data Modeling (ODM):** Mongoose (v8.x)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Password Security:** `bcryptjs`
- **Validation:** `express-validator`
- **CORS:** `cors`
- **Testing:** Jest, Supertest, `mongodb-memory-server`

---

## 📁 Architecture & Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic (Mongoose)
│   ├── controllers/
│   │   └── auth.controller.js    # HTTP controllers for auth endpoints
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication middleware (extracts & verifies Bearer token)
│   │   ├── role.middleware.js    # Reusable role-based access control (citizen / official)
│   │   ├── validate.middleware.js# Express-validator error handling middleware
│   │   └── error.middleware.js   # Centralized error handler & 404 handler
│   ├── models/
│   │   └── user.model.js         # Mongoose User model with secure hashing & schema validation
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoint definitions (/register, /login, /me)
│   │   └── index.js              # Central API router aggregator (/api/health, /api/auth)
│   ├── services/
│   │   └── auth.service.js       # Core authentication business logic & user operations
│   ├── validators/
│   │   └── auth.validator.js     # Payload validation rules for auth routes
│   ├── utils/
│   │   ├── response.js           # Standardized API response formatters
│   │   └── token.js              # JWT generation and verification utilities
│   ├── app.js                    # Express app configuration, middleware, and route mounting
│   └── server.js                 # Server entry point: connects to DB and listens on PORT
├── tests/
│   └── auth.test.js              # Integration test suite for Phase 1 endpoints
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore file for backend
├── package.json                  # Dependencies, metadata, and scripts
└── README.md                     # Backend documentation
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to create `.env`:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port number for the HTTP server | `5000` |
| `NODE_ENV` | Application environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/civix` |
| `JWT_SECRET` | Secret key used for signing and verifying JWTs | *Random secure string* |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `CLIENT_ORIGIN` | Angular frontend client origin for CORS | `http://localhost:4200` |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode (with hot-reload)
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

### 4. Run Automated Test Suite
```bash
npm test
```

---

## 📡 API Specification (Phase 1)

All endpoints are prefixed with `/api`.

### Standard Response Format

**Success Response (2xx):**
```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

**Error Response (4xx / 5xx):**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Access:** Public
- **Description:** Verifies that the API service is alive and healthy.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Civix API is operational",
  "data": {
    "status": "online",
    "timestamp": "2026-08-26T15:30:00.000Z"
  }
}
```

---

### 2. User Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Description:** Registers a new `citizen` or `official` user with optional location and ID verification data.

**Request Body (Citizen Example):**
```json
{
  "name": "John Citizen",
  "email": "john.citizen@example.com",
  "password": "Password123!",
  "role": "citizen",
  "location": {
    "address": "123 Civic Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
}
```

**Request Body (Official Example):**
```json
{
  "name": "Jane Official",
  "email": "jane.official@gov.in",
  "password": "OfficialPass123!",
  "role": "official",
  "location": {
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "verification": {
    "documentType": "GOVERNMENT_OFFICIAL_ID"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "67be0c5f2b84784a9e53b491",
      "name": "John Citizen",
      "email": "john.citizen@example.com",
      "role": "citizen",
      "location": {
        "address": "123 Civic Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "verification": {
        "isVerified": false,
        "status": "unsubmitted",
        "documentType": null,
        "verifiedAt": null
      },
      "createdAt": "2026-08-26T15:30:00.000Z",
      "updatedAt": "2026-08-26T15:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Authenticates a user with email and password, returning a signed JWT token.

**Request Body:**
```json
{
  "email": "john.citizen@example.com",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "67be0c5f2b84784a9e53b491",
      "name": "John Citizen",
      "email": "john.citizen@example.com",
      "role": "citizen",
      "location": {
        "address": "123 Civic Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "verification": {
        "isVerified": false,
        "status": "unsubmitted",
        "documentType": null,
        "verifiedAt": null
      },
      "createdAt": "2026-08-26T15:30:00.000Z",
      "updatedAt": "2026-08-26T15:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Protected (Requires `Authorization: Bearer <token>`)
- **Description:** Retrieves the authenticated user's profile info (useful for Angular frontend session restoration and dashboard personalization).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "67be0c5f2b84784a9e53b491",
      "name": "John Citizen",
      "email": "john.citizen@example.com",
      "role": "citizen",
      "location": {
        "address": "123 Civic Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560001",
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "verification": {
        "isVerified": false,
        "status": "unsubmitted",
        "documentType": null,
        "verifiedAt": null
      },
      "createdAt": "2026-08-26T15:30:00.000Z",
      "updatedAt": "2026-08-26T15:30:00.000Z"
    }
  }
}
```

---

## 🔒 Security Measures

1. **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 salt rounds in pre-save Mongoose hooks.
2. **Field Stripping:** The `password` field is configured with `select: false` on Mongoose queries and explicitly deleted during JSON serialization (`toJSON` / `toObject` transforms).
3. **Environment Isolation:** Secrets (`JWT_SECRET`, `MONGODB_URI`) are loaded via `dotenv` from `.env` which is ignored in Git.
4. **Input Validation:** Incoming request payloads are validated and sanitized via `express-validator` prior to hitting business logic.
5. **Generic Error Responses:** Login failures return generic messages (`Invalid email or password`) to prevent account enumeration.
6. **Role-Based Access Control:** Reusable `authorize('official')` and `authorize('citizen')` middleware guards sensitive routes.
