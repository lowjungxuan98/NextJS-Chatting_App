# Backend Documentation

## Overview
This is a real-time chat application backend built with Express.js, Socket.IO, and Prisma ORM. The system supports conversations between end users and merchant staff members, with authentication, real-time messaging, and conversation management capabilities.

## Technologies
- **Node.js/Express**: Web server framework
- **Socket.IO**: Real-time bidirectional communication
- **Prisma**: ORM for database access
- **JWT**: Authentication and authorization
- **Helmet**: Security middleware for Express
- **dotenv**: Environment variable management

## Prerequisites
- Node.js and npm installed
- PostgreSQL or another database supported by Prisma
- Environment variables configured (.env file)

## Installation

```bash
# Install dependencies
npm install

# Set up database with Prisma
npx prisma migrate dev
```

## Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:3000"
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes definition
│   ├── middlewares/      # Middleware functions
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   ├── index.ts          # Main entry point
│   └── socket.ts         # Socket.IO configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Conversations
- `POST /api/conversations` - Start a new conversation
- `GET /api/conversations` - Get list of user's conversations
- `GET /api/conversations/:id` - Get conversation details with messages
- `POST /api/conversations/:id/messages` - Send a message
- `POST /api/conversations/:id/assign` - Assign a staff member to conversation

### Merchants
- `GET /api/merchants` - Get merchant information

### Staff
- `GET /api/staff` - Get staff information
- Additional staff management endpoints

## Socket.IO Events

### Client Events
- `join_conversation` - Join a conversation room
- `leave_conversation` - Leave a conversation room

### Server Events
- `new_message` - Notify about new messages
- `error` - Error notifications

## Authentication

The system uses JWT for authentication:
- Token is returned on successful login/registration
- Token must be included in the Authorization header for API requests
- Socket.IO connections require the token in handshake auth

## User Types
- `end_user`: Regular users who initiate conversations
- `merchant_staff`: Staff users who respond to conversations (with roles: admin, manager, staff)

## Development

```bash
# Start development server
npm run dev
```

## Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Health Check
- `GET /health` - Server health status endpoint
