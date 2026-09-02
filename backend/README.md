# Civix Backend Service (Milestone 1 & Milestone 2)

Civix is a Digital Civic Engagement & Petition Platform designed to empower citizens and government officials to engage transparently on civic issues, petitions, polling, and governance reporting.

This service constitutes the **REST API Backend** for:
- **Milestone 1:** User Roles & Verification (Authentication, JWT, Roles, Profile)
- **Milestone 2:** Petition Creation & Management (Create, View, Search, Filter, Pagination, Edit/Delete before signatures)

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
│   │   ├── auth.controller.js    # Auth HTTP controllers (register, login, me)
│   │   └── petition.controller.js# Petition HTTP controllers (CRUD, search, filter)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication middleware
│   │   ├── role.middleware.js    # Role-based access control (citizen / official)
│   │   ├── validate.middleware.js# Express-validator error handling middleware
│   │   └── error.middleware.js   # Centralized error handler & 404 handler
│   ├── models/
│   │   ├── user.model.js         # Mongoose User model
│   │   └── petition.model.js     # Mongoose Petition model
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoint definitions (/api/auth)
│   │   ├── petition.routes.js    # Petition endpoint definitions (/api/petitions)
│   │   └── index.js              # Central API router aggregator
│   ├── services/
│   │   ├── auth.service.js       # Authentication business logic & user operations
│   │   └── petition.service.js   # Petition business logic, search, filter, restrictions
│   ├── validators/
│   │   ├── auth.validator.js     # Payload validation rules for auth routes
│   │   └── petition.validator.js # Payload and query validation rules for petitions
│   ├── utils/
│   │   ├── response.js           # Standardized API response formatters
│   │   └── token.js              # JWT generation and verification utilities
│   ├── app.js                    # Express app configuration, middleware, and route mounting
│   └── server.js                 # Server entry point: connects to DB and listens on PORT
├── tests/
│   ├── auth.test.js              # Integration test suite for Milestone 1 auth endpoints
│   └── petition.test.js          # Integration test suite for Milestone 2 petition endpoints
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

## 📡 API Specification

All endpoints are prefixed with `/api`.

### Standard Response Formats

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
      "field": "title",
      "message": "Title must be between 5 and 150 characters"
    }
  ]
}
```

---

### Authentication Endpoints (Milestone 1)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Service health & status check |
| `POST` | `/api/auth/register` | Public | Register `citizen` or `official` with location & verification state |
| `POST` | `/api/auth/login` | Public | Authenticate user & return signed JWT with safe user profile |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user profile (Bearer token) |
| `POST` | `/api/auth/change-password` | Protected | Change password for authenticated user |

---

### Petition Endpoints (Milestone 2)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/petitions` | Protected | Create a new civic petition |
| `POST` | `/api/petitions/:id/sign` | Protected | Sign a petition (atomic increment, prevents duplicate signing) |
| `GET` | `/api/petitions` | Public | List active petitions with search, filter, sorting, and pagination |
| `GET` | `/api/petitions/my` | Protected | List petitions created by the authenticated user (including drafts) |
| `GET` | `/api/petitions/:id` | Public | Get details of a single petition by ID (populated creator) |
| `PUT` | `/api/petitions/:id` | Protected (Creator) | Edit petition (Allowed ONLY if `signaturesCount === 0`) |
| `DELETE` | `/api/petitions/:id` | Protected (Creator) | Delete petition (Allowed ONLY if `signaturesCount === 0`) |

---

### Petition API Examples

#### 1. Create a Petition (`POST /api/petitions`)
**Headers:** `Authorization: Bearer <token>`
```json
{
  "title": "Fix Main Street Potholes and Improve Road Safety",
  "description": "The potholes on Main Street from 1st Cross to 5th Block have become dangerous for commuters and pedestrians.",
  "category": "Infrastructure",
  "tags": ["roads", "safety", "infrastructure"],
  "targetSignatures": 250,
  "location": {
    "address": "Main Street, Koramangala",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560034",
    "latitude": 12.9352,
    "longitude": 77.6245
  },
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Petition created successfully",
  "data": {
    "petition": {
      "_id": "67be184b2e8a123456789abc",
      "title": "Fix Main Street Potholes and Improve Road Safety",
      "description": "The potholes on Main Street from 1st Cross to 5th Block have become dangerous for commuters and pedestrians.",
      "category": "Infrastructure",
      "tags": ["roads", "safety", "infrastructure"],
      "targetSignatures": 250,
      "signaturesCount": 0,
      "location": {
        "address": "Main Street, Koramangala",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.9352,
        "longitude": 77.6245
      },
      "creator": {
        "_id": "67be0c5f2b84784a9e53b491",
        "name": "John Citizen",
        "email": "citizen@example.com",
        "role": "citizen",
        "location": { "city": "Bengaluru", "state": "Karnataka" }
      },
      "status": "active",
      "mediaUrls": [],
      "createdAt": "2026-08-28T18:00:00.000Z",
      "updatedAt": "2026-08-28T18:00:00.000Z"
    }
  }
}
```

---

#### 2. Query Petitions with Search & Filters (`GET /api/petitions`)
**Query Parameters:**
- `search=potholes` (searches title, description, and tags)
- `category=Infrastructure`
- `city=Bengaluru`
- `state=Karnataka`
- `tag=safety`
- `page=1`
- `limit=10`
- `sortBy=createdAt`
- `order=desc`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Petitions retrieved successfully",
  "data": {
    "petitions": [
      {
        "_id": "67be184b2e8a123456789abc",
        "title": "Fix Main Street Potholes and Improve Road Safety",
        "description": "The potholes on Main Street from 1st Cross to 5th Block have become dangerous...",
        "category": "Infrastructure",
        "tags": ["roads", "safety", "infrastructure"],
        "targetSignatures": 250,
        "signaturesCount": 0,
        "location": {
          "city": "Bengaluru",
          "state": "Karnataka"
        },
        "creator": {
          "_id": "67be0c5f2b84784a9e53b491",
          "name": "John Citizen",
          "role": "citizen"
        },
        "status": "active",
        "createdAt": "2026-08-28T18:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

#### 3. Edit Petition (`PUT /api/petitions/:id`)
**Headers:** `Authorization: Bearer <token>`
- **Rule:** Restricted to the creator, and only if `signaturesCount === 0`.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Petition updated successfully",
  "data": {
    "petition": { ... }
  }
}
```

---

#### 4. Delete Petition (`DELETE /api/petitions/:id`)
**Headers:** `Authorization: Bearer <token>`
- **Rule:** Restricted to the creator, and only if `signaturesCount === 0`.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Petition deleted successfully",
  "data": {
    "deleted": true,
    "id": "67be184b2e8a123456789abc"
  }
}
```

---

#### 5. Sign a Petition (`POST /api/petitions/:id/sign`)
**Headers:** `Authorization: Bearer <token>`
- **Behavior:** Records a signature document, prevents duplicate signatures per user via unique compound indexing, and atomically increments `signaturesCount`.
- **Closed / Inactive Petitions:** Rejects signing if the petition is closed or inactive (`400 Bad Request`).
- **Duplicate Signing:** Rejects duplicate signing attempts by the same user with `400 Bad Request` (`You have already signed this petition`).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Petition signed successfully",
  "data": {
    "petitionId": "67be184b2e8a123456789abc",
    "signaturesCount": 1
  }
}
```

---

## 🔒 Security & Business Rules

1. **Ownership Authorization:** Only the user who created a petition can update or delete it. Non-creators receive `403 Forbidden`.
2. **Signature Integrity Constraint:** Once a petition receives signatures (`signaturesCount > 0`), it is locked from modification and deletion to protect the integrity of citizen endorsements (`400 Bad Request`).
3. **Data Sanitization & Indexing:** Full-text and compound indexes ensure performant search across large datasets while preventing injection via structured regex sanitation.
4. **Zero Sensitive Data Exposure:** Password fields are stripped during query population and serialization.
