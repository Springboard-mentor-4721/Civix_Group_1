# Civix Backend Service (Milestones 1, 2 & 3)

Civix is a Digital Civic Engagement & Petition Platform designed to empower citizens and government officials to engage transparently on civic issues, petitions, polling, sentiment tracking, and governance reporting.

This service constitutes the **REST API Backend** for:
- **Milestone 1:** User Roles & Verification (Authentication, JWT, Roles, Profile, Change Password)
- **Milestone 2:** Petition Creation & Management (Create, View, Sign, Search, Filter, Pagination, Edit/Delete before signatures)
- **Milestone 3:** Issue-Specific Polls, Public Voting & Live Sentiment Tracking (Poll Creation, Public Voting, Sentiment Results Dashboard, Status Management)

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
│   │   ├── auth.controller.js    # Auth HTTP controllers (register, login, me, change-password)
│   │   ├── petition.controller.js# Petition HTTP controllers (CRUD, signing, search, filter)
│   │   └── poll.controller.js    # Poll HTTP controllers (CRUD, voting, results, status)
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT authentication middleware
│   │   ├── role.middleware.js    # Role-based access control (citizen / official)
│   │   ├── validate.middleware.js# Express-validator error handling middleware
│   │   └── error.middleware.js   # Centralized error handler & 404 handler
│   ├── models/
│   │   ├── user.model.js         # Mongoose User model (authentication & profile)
│   │   ├── petition.model.js     # Mongoose Petition model
│   │   ├── signature.model.js    # Mongoose Signature model (unique petition signing)
│   │   ├── poll.model.js         # Mongoose Poll model (options, votesCount, totalVotes)
│   │   └── vote.model.js         # Mongoose Vote model (unique poll voting constraint)
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoint definitions (/api/auth)
│   │   ├── petition.routes.js    # Petition endpoint definitions (/api/petitions)
│   │   ├── poll.routes.js        # Poll endpoint definitions (/api/polls)
│   │   └── index.js              # Central API router aggregator
│   ├── services/
│   │   ├── auth.service.js       # Authentication business logic & password handling
│   │   ├── petition.service.js   # Petition business logic, signing, search, filter
│   │   └── poll.service.js       # Poll business logic, atomic voting, sentiment calculations
│   ├── validators/
│   │   ├── auth.validator.js     # Payload validation rules for auth routes
│   │   ├── petition.validator.js # Payload and query validation rules for petitions
│   │   └── poll.validator.js     # Payload and query validation rules for polls & voting
│   ├── utils/
│   │   ├── response.js           # Standardized API response formatters
│   │   └── token.js              # JWT generation and verification utilities
│   ├── app.js                    # Express app configuration, middleware, and route mounting
│   └── server.js                 # Server entry point: connects to DB and listens on PORT
├── tests/
│   ├── auth.test.js              # Integration test suite for Milestone 1 auth endpoints
│   ├── petition.test.js          # Integration test suite for Milestone 2 petition endpoints
│   └── poll.test.js              # Integration test suite for Milestone 3 poll & voting endpoints
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
| `CLIENT_ORIGIN` | Frontend client origin for CORS | `http://localhost:4200` |

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

### 3. Run Automated Tests
```bash
npm test
```

---

## 📡 API Reference

### Standard Response Format

#### Success Response (`2xx`)
```json
{
  "success": true,
  "message": "Human-readable success message",
  "data": { ... }
}
```

#### Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation failure message"
    }
  ]
}
```

---

### 🔑 Milestone 1: Authentication & User Management Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Citizen or Official user |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user's profile |
| `POST` | `/api/auth/change-password` | Protected | Change account password with old password verification |

---

### 📋 Milestone 2: Petition Management & Signing Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/petitions` | Protected | Create a new petition with category, tags, target & location |
| `GET` | `/api/petitions` | Public | List petitions with search, filters, pagination, and sorting |
| `GET` | `/api/petitions/my` | Protected | List petitions created by the currently authenticated user |
| `GET` | `/api/petitions/:id` | Public | Retrieve a single petition by its MongoDB ObjectId |
| `POST` | `/api/petitions/:id/sign` | Protected | Sign an active petition (atomic signature recording & count increment) |
| `PUT` | `/api/petitions/:id` | Protected | Update petition details (restricted to creator, only before signatures) |
| `DELETE` | `/api/petitions/:id` | Protected | Delete petition (restricted to creator, only before signatures) |

---

### 📊 Milestone 3: Polls, Public Voting & Live Sentiment Tracking Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/polls` | Protected | Create an issue-specific poll with >= 2 options & location |
| `GET` | `/api/polls` | Public | List polls with search, category, location, status filters, and pagination |
| `GET` | `/api/polls/my` | Protected | List polls created by the currently authenticated user |
| `GET` | `/api/polls/:id` | Public | Retrieve detailed poll information and current option vote counts |
| `POST` | `/api/polls/:id/vote` | Protected | Cast a vote on a poll option (atomic update, duplicate prevention) |
| `GET` | `/api/polls/:id/results` | Public | Retrieve live poll results and percentage breakdown for sentiment dashboards |
| `PATCH` | `/api/polls/:id/status` | Protected | Update poll status (`active` / `closed`) by creator or official |
| `DELETE` | `/api/polls/:id` | Protected | Delete poll (restricted to creator/official, only before votes are cast) |

---

### 💡 Milestone 3 API Usage Examples

#### 1. Create a Poll (`POST /api/polls`)
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Should the city implement a 24/7 bus lane on Outer Ring Road?",
  "description": "We are gathering citizen opinions on dedicated bus transit corridors to reduce traffic congestion.",
  "category": "Transportation",
  "options": [
    "Yes, 24/7 dedicated lane",
    "Yes, but peak hours only",
    "No, it will increase car traffic"
  ],
  "location": {
    "city": "Bengaluru",
    "state": "Karnataka",
    "address": "Outer Ring Road Corridor",
    "pincode": "560103"
  },
  "endDate": "2026-10-31T23:59:59.000Z",
  "relatedPetition": "67be184b2e8a123456789abc"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Poll created successfully",
  "data": {
    "poll": {
      "_id": "67be201f3e8a123456789def",
      "title": "Should the city implement a 24/7 bus lane on Outer Ring Road?",
      "description": "We are gathering citizen opinions on dedicated bus transit corridors...",
      "category": "Transportation",
      "options": [
        {
          "_id": "67be201f3e8a123456789de1",
          "text": "Yes, 24/7 dedicated lane",
          "votesCount": 0
        },
        {
          "_id": "67be201f3e8a123456789de2",
          "text": "Yes, but peak hours only",
          "votesCount": 0
        },
        {
          "_id": "67be201f3e8a123456789de3",
          "text": "No, it will increase car traffic",
          "votesCount": 0
        }
      ],
      "totalVotes": 0,
      "status": "active",
      "location": {
        "city": "Bengaluru",
        "state": "Karnataka",
        "address": "Outer Ring Road Corridor",
        "pincode": "560103"
      },
      "createdBy": {
        "_id": "67be0c5f2b84784a9e53b491",
        "name": "Citizen One",
        "email": "citizen1@civix.org",
        "role": "citizen"
      },
      "relatedPetition": {
        "_id": "67be184b2e8a123456789abc",
        "title": "Construct Solar-Powered Bus Shelters in Koramangala",
        "category": "Transportation",
        "status": "active"
      },
      "createdAt": "2026-08-28T19:00:00.000Z",
      "updatedAt": "2026-08-28T19:00:00.000Z"
    }
  }
}
```

---

#### 2. Query Polls (`GET /api/polls`)
**Query Parameters:**
- `search=corridor` (searches title and description)
- `category=Transportation`
- `city=Bengaluru`
- `state=Karnataka`
- `status=active` (or `closed`)
- `relatedPetition=67be184b2e8a123456789abc`
- `sortBy=totalVotes`
- `order=desc`
- `page=1`
- `limit=10`

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Polls retrieved successfully",
  "data": {
    "polls": [
      {
        "_id": "67be201f3e8a123456789def",
        "title": "Should the city implement a 24/7 bus lane on Outer Ring Road?",
        "category": "Transportation",
        "totalVotes": 42,
        "status": "active",
        "location": {
          "city": "Bengaluru",
          "state": "Karnataka"
        },
        "createdBy": {
          "_id": "67be0c5f2b84784a9e53b491",
          "name": "Citizen One",
          "role": "citizen"
        },
        "createdAt": "2026-08-28T19:00:00.000Z"
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

#### 3. Cast a Vote (`POST /api/polls/:id/vote`)
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "optionId": "67be201f3e8a123456789de1"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "vote": {
      "pollId": "67be201f3e8a123456789def",
      "optionId": "67be201f3e8a123456789de1",
      "votedAt": "2026-08-28T19:05:00.000Z"
    },
    "poll": {
      "_id": "67be201f3e8a123456789def",
      "totalVotes": 1,
      "options": [
        {
          "_id": "67be201f3e8a123456789de1",
          "text": "Yes, 24/7 dedicated lane",
          "votesCount": 1
        }
      ]
    },
    "results": {
      "pollId": "67be201f3e8a123456789def",
      "title": "Should the city implement a 24/7 bus lane on Outer Ring Road?",
      "totalVotes": 1,
      "options": [
        {
          "_id": "67be201f3e8a123456789de1",
          "text": "Yes, 24/7 dedicated lane",
          "votesCount": 1,
          "percentage": 100.0
        },
        {
          "_id": "67be201f3e8a123456789de2",
          "text": "Yes, but peak hours only",
          "votesCount": 0,
          "percentage": 0.0
        },
        {
          "_id": "67be201f3e8a123456789de3",
          "text": "No, it will increase car traffic",
          "votesCount": 0,
          "percentage": 0.0
        }
      ]
    }
  }
}
```

---

#### 4. Live Sentiment / Poll Results Dashboard (`GET /api/polls/:id/results`)
**Access:** Public

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Poll results retrieved successfully",
  "data": {
    "results": {
      "pollId": "67be201f3e8a123456789def",
      "title": "Should the city implement a 24/7 bus lane on Outer Ring Road?",
      "description": "We are gathering citizen opinions on dedicated bus transit corridors...",
      "category": "Transportation",
      "status": "active",
      "totalVotes": 150,
      "options": [
        {
          "_id": "67be201f3e8a123456789de1",
          "text": "Yes, 24/7 dedicated lane",
          "votesCount": 90,
          "percentage": 60.0
        },
        {
          "_id": "67be201f3e8a123456789de2",
          "text": "Yes, but peak hours only",
          "votesCount": 45,
          "percentage": 30.0
        },
        {
          "_id": "67be201f3e8a123456789de3",
          "text": "No, it will increase car traffic",
          "votesCount": 15,
          "percentage": 10.0
        }
      ],
      "startDate": "2026-08-28T19:00:00.000Z",
      "endDate": "2026-10-31T23:59:59.000Z",
      "location": {
        "city": "Bengaluru",
        "state": "Karnataka",
        "address": "Outer Ring Road Corridor"
      }
    }
  }
}
```

---

#### 5. Close / Update Poll Status (`PATCH /api/polls/:id/status`)
**Headers:** `Authorization: Bearer <token>`
- **Access:** Restricted to the poll creator or users with the `official` role.

**Request Body:**
```json
{
  "status": "closed"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Poll status updated successfully",
  "data": {
    "poll": {
      "_id": "67be201f3e8a123456789def",
      "status": "closed"
    }
  }
}
```

---

## 🔒 Security & Voting Rules

1. **Duplicate Vote Prevention:**
   - Enforced at the application level and the database layer via a unique compound index on the `Vote` model: `{ poll: 1, user: 1 }, { unique: true }`.
   - Repeated voting attempts by the same user return `400 Bad Request` (`You have already voted on this poll`).
2. **Atomic Vote Counting:**
   - Option vote counts and total poll votes are updated atomically using MongoDB `$inc` operators (`'options.$.votesCount': 1, totalVotes: 1`) to eliminate concurrency race conditions.
3. **Closed Poll Protection:**
   - Once a poll status becomes `closed` (or its `endDate` passes), new votes are rejected (`400 Bad Request`), while poll results remain public and viewable for sentiment analysis.
4. **Poll Modification & Deletion Rules:**
   - Only the poll creator or official can close a poll.
   - Deletion is only permitted before any votes have been cast (`totalVotes === 0`).
5. **Data Privacy:**
   - Voter identities are securely stored in the `Vote` collection for auditability and duplicate prevention, but individual vote-user mappings are never exposed in public results endpoints.
