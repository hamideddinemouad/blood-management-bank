# Blood Bank Management System

Blood Bank Management System is a full-stack platform for coordinating blood donation workflows across donors, hospitals, blood labs, and administrators. It includes role-based dashboards, demo access, inventory and request management, public landing metrics, Swagger API documentation, and automated backend smoke tests.

## What The Project Does

The platform is organized around four core roles:

- `Donor`: manages profile, donation history, camp discovery, and camp registration
- `Hospital`: requests blood, views request history, browses donors, and tracks stock
- `Blood Lab`: manages camps, blood stock, incoming hospital requests, and donor donations
- `Admin`: reviews facilities, monitors donors, and inspects system-wide donations and camps

The project also includes a recruiter/demo flow so the product can be explored quickly without manual setup.

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Tailwind CSS
- Lucide React
- React Hot Toast

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- Swagger UI / OpenAPI

### Testing

- Node test runner
- Supertest
- mongodb-memory-server

## Current Highlights

- role-based dashboards with a single dashboard navbar per protected area
- recruiter-friendly demo access from `/fast-test` and `/login`
- Swagger UI at `/api/doc`
- raw OpenAPI JSON at `/api/doc.json`
- backend OpenAPI generation with `npm run swagger:generate`
- backend smoke tests with `npm test`
- auth hardening for admin-only endpoints
- custom favicon and updated application shell

## Project Structure

```text
.
├── backend
│   ├── app.js
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── openapi
│   ├── routes
│   └── test
├── frontend
│   ├── public
│   └── src
└── docker-compose.yml
```

## Running Locally

### 1. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env` from `backend/.env.example`:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/bbms
JWT_SECRET=replace_with_a_real_secret
COOKIE_SAME_SITE=lax
PORT=5000
NODE_ENV=development
ENABLE_SWAGGER=true
CORS_ORIGINS=http://localhost,http://localhost:5173,http://localhost:5174
```

Start the backend:

```bash
npm start
```

Backend will run on:

```text
http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on the Vite dev server, typically:

```text
http://localhost:5173
```

If needed, create `frontend/.env` from `frontend/.env.example`:

```bash
VITE_API_URL=http://localhost:5000
VITE_WEBSITE_NAME=BBMS
```

Frontend environment values are now read through a shared config helper so API and branding config live in one place instead of being repeated across pages and components.

## Docker Setup

You can also run the whole project with Docker:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## Deploying On Vercel

The safest setup for this repository is to deploy it as two Vercel projects from the same Git repository:

- `frontend` as a Vite project
- `backend` as an Express project

This avoids the current Vercel Services beta requirement and matches Vercel's zero-config support for both frameworks.

### Frontend project

In the Vercel dashboard:

1. Import the repository
2. Set the Root Directory to `frontend`
3. Add the environment variable:

```bash
VITE_API_URL=https://your-backend-project.vercel.app
```

For SPA deep links on Vercel, this repo includes `frontend/vercel.json`.

The frontend build now fails fast if:

- `VITE_API_URL` is missing
- `VITE_API_URL` is not a valid absolute `http` or `https` URL
- `VITE_API_URL` includes a path, query string, or hash
- `VITE_API_URL` points at a Vercel frontend domain instead of the API project
- `VITE_WEBSITE_NAME` is missing

### Backend project

In the Vercel dashboard:

1. Import the same repository again
2. Set the Root Directory to `backend`
3. Add these environment variables:

```bash
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=production
COOKIE_SAME_SITE=none
CORS_ORIGINS=https://your-frontend-project.vercel.app
CORS_ORIGIN_PATTERNS=https://*.vercel.app
ENABLE_SWAGGER=false
```

Notes:

- `COOKIE_SAME_SITE=none` is important when frontend and backend are deployed on different Vercel domains and the app uses cookies with `credentials: "include"`.
- `CORS_ORIGIN_PATTERNS=https://*.vercel.app` allows preview deployments to work without editing CORS for every new preview URL.
- If you attach a custom frontend domain, add it to `CORS_ORIGINS`.
- The backend Vercel build now fails fast if required production env vars are missing or malformed.

## Demo Data

The project includes seeded demo accounts and sample data.

From the backend folder:

```bash
npm run seed:demo
```

This refreshes demo data for:

- admin
- donor
- hospital
- blood lab
- additional pending / rejected facility review scenarios
- seeded camps, requests, donations, and inventory

If you only want the standalone admin seed:

```bash
npm run seed:admin
```

Demo entry points:

- `/fast-test`
- `/login`
- donor registration page
- facility registration page

## API Documentation

Swagger UI is available when:

- `NODE_ENV !== production`, or
- `ENABLE_SWAGGER=true`

Available endpoints:

- Swagger UI: `http://localhost:5000/api/doc`
- OpenAPI JSON: `http://localhost:5000/api/doc.json`

Generate the OpenAPI artifact:

```bash
cd backend
npm run swagger:generate
```

Generated file:

```text
backend/openapi/openapi.generated.json
```

## Backend Tests

Run the backend smoke suite:

```bash
cd backend
npm test
```

What it verifies:

- public endpoints
- auth endpoints
- donor flows
- facility flows
- hospital flows
- blood-lab flows
- admin authorization and admin actions

## Security Notes

Recent hardening includes:

- admin routes now require admin roles explicitly
- donor routes reject disabled donor accounts
- facility routes reject disabled or unapproved facilities
- shared auth middleware now blocks disabled users
- security headers are applied globally in the backend

## Main API Areas

### Public

- `GET /api/public/landing-stats`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/demo-access`
- `GET /api/auth/profile`

### Donor

- `GET /api/donor/profile`
- `PUT /api/donor/profile`
- `GET /api/donor/camps`
- `POST /api/donor/camps/:campId/register`
- `DELETE /api/donor/camps/:campId/register`
- `GET /api/donor/history`
- `GET /api/donor/stats`

### Facility

- `GET /api/facility/dashboard`
- `GET /api/facility/profile`
- `PUT /api/facility/profile`
- `GET /api/facility/labs`

### Hospital

- `POST /api/hospital/blood/request`
- `GET /api/hospital/blood/requests`
- `GET /api/hospital/dashboard`
- `GET /api/hospital/blood/stock`
- `GET /api/hospital/history`
- `GET /api/hospital/donors`
- `POST /api/hospital/donors/:id/contact`

### Blood Lab

- `GET /api/blood-lab/dashboard`
- `GET /api/blood-lab/history`
- `POST /api/blood-lab/camps`
- `GET /api/blood-lab/camps`
- `PUT /api/blood-lab/camps/:id`
- `PATCH /api/blood-lab/camps/:id/status`
- `DELETE /api/blood-lab/camps/:id`
- `POST /api/blood-lab/blood/add`
- `POST /api/blood-lab/blood/remove`
- `GET /api/blood-lab/blood/stock`
- `GET /api/blood-lab/blood/requests`
- `PUT /api/blood-lab/blood/requests/:id`
- `GET /api/blood-lab/labs`
- `GET /api/blood-lab/donors/search`
- `POST /api/blood-lab/donors/donate/:id`
- `GET /api/blood-lab/donations/recent`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/facilities`
- `PUT /api/admin/facility/approve/:id`
- `PUT /api/admin/facility/reject/:id`
- `GET /api/admin/donors`
- `GET /api/admin/donations`
- `GET /api/admin/camps`
- `PATCH /api/admin/donors/:id/eligibility`
- `PATCH /api/admin/donors/:id/account-status`
- `PATCH /api/admin/facilities/:id/review-status`
- `PATCH /api/admin/facilities/:id/account-status`

## Notes

- `backend/routes/hospital.js` and `backend/routes/campRoutes.js` exist in the repository but are not part of the currently mounted live API surface.
- The active backend route surface is defined by `backend/app.js` and `backend/server.js`.

## Screens

The application includes:

- landing page with live public metrics
- recruiter/demo fast-test page
- donor dashboard
- hospital dashboard
- blood-lab dashboard
- admin dashboard

## License

This project currently does not declare a dedicated project license beyond the package metadata.
