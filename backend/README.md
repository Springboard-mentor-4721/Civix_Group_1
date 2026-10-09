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
│   │   ├── poll.service.js       # Poll business logic, atomic voting, sentiment calculations
│   │   ├── official.service.js   # Official locality filtering, response audit history, status updates
│   │   └── report.service.js     # Monthly engagement metric aggregations & RFC-4180 CSV export
│   ├── validators/
│   │   ├── auth.validator.js     # Payload validation rules for auth routes
│   │   ├── petition.validator.js # Payload and query validation rules for petitions
│   │   ├── poll.validator.js     # Payload and query validation rules for polls & voting
│   │   ├── official.validator.js # Payload and query validation rules for official responses & queries
│   │   └── report.validator.js   # Payload and query validation rules for monthly reports & exports
│   ├── utils/
│   │   ├── response.js           # Standardized API response formatters
│   │   └── token.js              # JWT generation and verification utilities
│   ├── app.js                    # Express app configuration, middleware, and route mounting
│   └── server.js                 # Server entry point: connects to DB and listens on PORT
├── tests/
│   ├── auth.test.js              # Integration test suite for Milestone 1 auth endpoints
│   ├── petition.test.js          # Integration test suite for Milestone 2 petition endpoints
│   ├── poll.test.js              # Integration test suite for Milestone 3 poll & voting endpoints
│   ├── official.test.js          # Integration test suite for Milestone 4 official portal & responses
│   └── report.test.js            # Integration test suite for Milestone 4 monthly reports & CSV export
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

## 📡 Complete API Reference

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

### 🔑 Milestone 1: Authentication & User Management

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new Citizen or Official user |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT Bearer token |
| `GET` | `/api/auth/me` | Protected | Retrieve authenticated user's profile |
| `POST` | `/api/auth/change-password` | Protected | Change account password with old password verification |

---

### 📋 Milestone 2: Petition Management & Signing

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

### 📊 Milestone 3: Polls, Public Voting & Live Sentiment Tracking

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

### 🏛️ Milestone 4: Official Dashboard, Response Workflow & Monthly Reports

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/official/petitions` | Official Only | View petitions relevant to official's locality (with search/filters/pagination) |
| `POST` | `/api/official/petitions/:id/response` | Official Only | Submit official comment, update status (`under_review`/`closed`/`active`) |
| `PATCH` | `/api/official/petitions/:id/status` | Official Only | Update petition status with optional department/title context |
| `GET` | `/api/official/petitions/:id/responses` | Protected | Retrieve full chronological official response history for a petition |
| `GET` | `/api/petitions/:id/responses` | Public / All | Direct alias to retrieve official response history for a petition |
| `GET` | `/api/reports/monthly` | Public / All | Retrieve structured monthly civic engagement report metrics (JSON) |
| `GET` | `/api/reports/monthly/export` | Public / All | Download monthly engagement report as an RFC-4180 formatted CSV |

---

### 💡 Milestone 4 API Usage Examples

#### 1. Official Locality Dashboard (`GET /api/official/petitions`)
**Headers:** `Authorization: Bearer <official_token>`

**Query Parameters (Optional):**
- `city=Bengaluru` (overrides official's profile city if specified)
- `state=Karnataka`
- `status=under_review` (or `active`, `closed`)
- `category=Infrastructure`
- `search=potholes`
- `page=1`
- `limit=10`

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Locality petitions retrieved successfully",
  "data": {
    "polls": [
      {
        "_id": "67be184b2e8a123456789abc",
        "title": "Fix Severe Potholes on MG Road Bengaluru",
        "description": "The MG Road stretch near the metro station has numerous deep potholes...",
        "category": "Infrastructure",
        "status": "under_review",
        "signaturesCount": 142,
        "location": {
          "city": "Bengaluru",
          "state": "Karnataka",
          "address": "MG Road"
        },
        "createdBy": {
          "_id": "67be0c5f2b84784a9e53b491",
          "name": "Citizen Jane",
          "role": "citizen"
        },
        "createdAt": "2026-09-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "officialJurisdiction": {
      "city": "Bengaluru",
      "state": "Karnataka"
    }
  }
}
```

---

#### 2. Official Response to Petition (`POST /api/official/petitions/:id/response`)
**Headers:** `Authorization: Bearer <official_token>`

**Request Body:**
```json
{
  "comment": "An engineering inspection team has assessed the road damage. Tenders are now invited for road resurfacing.",
  "status": "under_review",
  "department": "Bruhat Bengaluru Mahanagara Palike (BBMP) - Road Infrastructure",
  "officialTitle": "Executive City Engineer"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Official response recorded successfully",
  "data": {
    "officialResponse": {
      "_id": "67be300f4e8a123456789aaa",
      "petition": "67be184b2e8a123456789abc",
      "official": {
        "_id": "67be0c5f2b84784a9e53b999",
        "name": "Officer Bengaluru",
        "email": "officer.blr@gov.org",
        "role": "official",
        "location": { "city": "Bengaluru", "state": "Karnataka" }
      },
      "comment": "An engineering inspection team has assessed the road damage. Tenders are now invited for road resurfacing.",
      "previousStatus": "active",
      "newStatus": "under_review",
      "department": "Bruhat Bengaluru Mahanagara Palike (BBMP) - Road Infrastructure",
      "officialTitle": "Executive City Engineer",
      "createdAt": "2026-09-05T14:30:00.000Z",
      "updatedAt": "2026-09-05T14:30:00.000Z"
    },
    "petition": {
      "_id": "67be184b2e8a123456789abc",
      "title": "Fix Severe Potholes on MG Road Bengaluru",
      "status": "under_review"
    }
  }
}
```

---

#### 3. View Petition Response History (`GET /api/petitions/:id/responses`)
**Access:** Public / Authenticated

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Petition responses retrieved successfully",
  "data": {
    "petitionId": "67be184b2e8a123456789abc",
    "totalResponses": 1,
    "responses": [
      {
        "_id": "67be300f4e8a123456789aaa",
        "official": {
          "name": "Officer Bengaluru",
          "email": "officer.blr@gov.org",
          "role": "official"
        },
        "comment": "An engineering inspection team has assessed the road damage...",
        "previousStatus": "active",
        "newStatus": "under_review",
        "department": "BBMP Road Infrastructure",
        "createdAt": "2026-09-05T14:30:00.000Z"
      }
    ]
  }
}
```

---

#### 4. Monthly Civic Engagement Report (`GET /api/reports/monthly`)
**Query Parameters (Optional):**
- `month=9`
- `year=2026`
- `city=Bengaluru` (optional locality filter)
- `category=Infrastructure` (optional category filter)

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Monthly civic engagement report generated successfully",
  "data": {
    "period": {
      "month": 9,
      "monthName": "September",
      "year": 2026,
      "startDate": "2026-09-01T00:00:00.000Z",
      "endDate": "2026-09-30T23:59:59.999Z"
    },
    "filters": {
      "city": "Bengaluru",
      "state": null,
      "category": null
    },
    "summary": {
      "totalEngagementActivities": 312,
      "totalPetitions": 14,
      "totalSignatures": 195,
      "totalPolls": 5,
      "totalVotes": 90,
      "totalOfficialResponses": 8
    },
    "petitions": {
      "total": 14,
      "byStatus": {
        "active": 6,
        "under_review": 5,
        "closed": 3,
        "draft": 0,
        "flagged": 0
      },
      "byCategory": {
        "Infrastructure": 8,
        "Environment": 4,
        "Transportation": 2
      },
      "byCity": {
        "Bengaluru": 14
      }
    },
    "polls": {
      "total": 5,
      "byStatus": {
        "active": 4,
        "closed": 1
      },
      "byCategory": {
        "Transportation": 3,
        "Environment": 2
      }
    },
    "officialResponses": {
      "total": 8,
      "byNewStatus": {
        "under_review": 5,
        "closed": 3,
        "active": 0
      }
    }
  }
}
```

---

#### 5. Export Monthly Report as CSV (`GET /api/reports/monthly/export`)
**Headers received:**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="civic-engagement-report-2026-09.csv"`

**CSV Content Body Preview:**
```csv
"Civix Digital Civic Engagement Monthly Report"
"Period","September 2026"
"Start Date","2026-09-01T00:00:00.000Z"
"End Date","2026-09-30T23:59:59.999Z"

"--- EXECUTIVE SUMMARY ---"
"Metric","Count"
"Total Civic Engagement Activities","312"
"Total Petitions Created","14"
"Total Signatures Gathered","195"
"Total Polls Created","5"
"Total Votes Cast","90"
"Total Official Responses","8"

"--- PETITIONS BY STATUS ---"
"Status","Count"
"active","6"
"under_review","5"
"closed","3"

"--- PETITIONS BY CATEGORY ---"
"Category","Count"
"Infrastructure","8"
"Environment","4"
"Transportation","2"

"--- POLLS BY STATUS & CATEGORY ---"
"Metric","Value","Count"
"Status","active","4"
"Status","closed","1"
"Category","Transportation","3"
"Category","Environment","2"

"--- OFFICIAL RESPONSES BY RESOLUTION STATUS ---"
"Resolution Status","Count"
"under_review","5"
"closed","3"
```

---

## 🔒 Security, Authorization & Business Rules

1. **Role-Based Access Control:**
   - Official endpoints (`/api/official/*`) require valid JWT authentication AND user role `official`.
   - Citizen users attempting official actions receive `403 Forbidden` (`Access denied. Requires one of the following roles: official`).
2. **Petition Status Lifecycle:**
   - Supported statuses: `draft`, `active`, `under_review`, `closed`, `flagged`.
   - Officials can transition petitions through governance phases (e.g. `active` -> `under_review` -> `closed`).
3. **Audit History & Response Immutability:**
   - Every response or status change initiated by an official is persisted as an `OfficialResponse` record linking the petition, official, timestamps, comments, previous status, and new status.
4. **Locality Awareness:**
   - The official dashboard automatically defaults to the official's registered city/state while allowing flexible query overrides for regional directors.
5. **Robust Engagement Aggregation:**
   - Monthly reports compute accurate metrics across all 5 key engagement collections: Petitions, Signatures, Polls, Votes, and Official Responses.
