# Campus Matrix

Campus Matrix is a student-centered campus networking platform built to help learners connect, grow, and succeed together.

This web app brings campus communities to life by connecting students with mentors, enabling secure conversations, tracking personal goals, and sharing resources that matter. It is ideal for college students, first-year learners, and campus organizations who want a digital space for mentorship, peer support, and academic collaboration.

## What the Website Is About

Campus Matrix helps students:

- discover mentors and mentees based on major, interests, and language preferences
- build a strong campus profile with skills, interests, and academic goals
- communicate instantly using real-time chat and messaging
- stay accountable by creating and tracking goals
- follow other students and view campus activity
- explore resources, events, and campus support information

The platform is designed to make campus life more approachable, supportive, and social.

## Features

- **Mentor-Mentee Matching:** Connect students through shared interests, academic focus, and communication preferences.
- **Real-Time Chat:** Send messages instantly with Socket.IO-powered chat and live updates.
- **Goal Tracking:** Set academic or personal milestones, mark progress, and stay motivated.
- **Profile Management:** Create a complete profile with biography, stream, skills, and campus interests.
- **Connections & Following:** Follow peers, view public profiles, and build a network.
- **Campus Resources:** Access event listings, campus guides, FAQs, and useful student links.

## Screenshots

Screenshots will be added soon.

## Project Structure

```
campus-matrix/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── client/         # Production build output for frontend
│   ├── server.js       # Express server
│   └── package.json
├── frontend/
│   ├── src/            # React source code
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB

### Setup

#### 1. Clone the repository

```sh
git clone https://github.com/yourusername/campus-matrix.git
cd campus-matrix
```

#### 2. Backend Setup

```sh
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend server:

```sh
npm run dev
```

#### 3. Frontend Setup

```sh
cd ../frontend
npm install
```

Start the frontend development server:

```sh
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) and proxy API requests to the backend.

## Build & Deployment

To build the frontend for production:

```sh
npm run build
```

Copy the build output (`dist/`) into `backend/client/` for serving via Express.

## API Endpoints

See the backend `routes/` folder for REST API endpoints:

- `/api/auth` - Authentication (signup, login, logout, check-auth)
- `/api/profile` - Profile creation and retrieval
- `/api/goals` - Goal CRUD operations
- `/api/chat` - Chat creation and listing
- `/api/messages` - Messaging within chats

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Router, Axios, Socket.IO Client
- **Backend:** Express, MongoDB, Mongoose, Socket.IO, JWT, bcryptjs

---

Made with ❤️ for the FluxWave Hackathon.