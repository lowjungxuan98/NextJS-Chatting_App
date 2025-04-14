# Real-time Chat Application

## Project Overview
This is a full-stack real-time chat application with a backend built using Express.js, Socket.IO, and Prisma ORM, and a frontend built with Next.js, React, and Tailwind CSS.

## Documentation
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose

### Step 1: Start the Database
The application uses PostgreSQL running in Docker:

```bash
docker-compose up -d
```

This starts a PostgreSQL instance at `localhost:5432` with:
- Username: postgres
- Password: postgres
- Database: chat_service

### Step 2: Initialize the Database
Navigate to the backend directory and run:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: seed with initial data
```

### Step 3: Start the Backend
In the backend directory:

```bash
npm run dev
```

The API server will start at http://localhost:3001.

### Step 4: Start the Frontend
Open a new terminal, navigate to the frontend directory and run:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Project Structure
```
chat-application/
├── backend/               # Express.js backend
│   ├── prisma/            # Prisma ORM schema and migrations
│   ├── src/               # Backend source code
│   └── README.md          # Backend documentation
├── frontend/              # Next.js frontend
│   ├── src/               # Frontend source code
│   └── README.md          # Frontend documentation
├── docker-compose.yml     # Docker configuration for database
└── README.md              # This file
```

## Key Features
- Real-time messaging with Socket.IO
- User authentication and authorization
- PostgreSQL database with Prisma ORM
- Modern UI with Tailwind CSS
- TypeScript throughout the stack

## Development Workflow

### Running in Development Mode
For active development, run both the backend and frontend in development mode:

1. Backend: `cd backend && npm run dev`
2. Frontend: `cd frontend && npm run dev`

### Building for Production
To build for production:

1. Backend: `cd backend && npm run build`
2. Frontend: `cd frontend && npm run build`

Then start the services:
1. Backend: `cd backend && npm start`
2. Frontend: `cd frontend && npm start`

## Database Management
- View database migrations: `cd backend && npx prisma migrate dev`
- Reset database: `cd backend && npx prisma migrate reset`
- Open Prisma Studio: `cd backend && npx prisma studio`

## Troubleshooting
- If you encounter connection issues with the database, ensure Docker is running and the PostgreSQL container is active
- For backend issues, check the logs in the backend terminal
- For frontend issues, check the browser console for errors

## License
This project is licensed under the MIT License.
