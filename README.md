# Customer Service Chat Module - Backend

This is the backend service for the Customer Service Chat Module, built with Express, TypeScript, PostgreSQL, Prisma, and Socket.IO.

## Features

- Real-time chat using Socket.IO
- User authentication and role-based authorization
- Conversation management
- Support for merchants and end users

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Setup and Installation

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Start the PostgreSQL database with Docker**
   ```
   npm run docker:up
   ```

4. **Create the database schema**
   ```
   npm run db:migrate
   ```

5. **Seed the database with initial data**
   ```
   npm run db:seed
   ```

6. **Start the development server**
   ```
   npm run dev
   ```

The server will be running at http://localhost:4000

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new end user
- **POST /api/auth/login** - Login for all users
- **POST /api/auth/staff** - Register a new merchant staff (admin only)

### Conversations

- **POST /api/conversations** - Start a new conversation
- **GET /api/conversations** - Get all conversations for the current user
- **GET /api/conversations/:id** - Get conversation details
- **PUT /api/conversations/:id/assign** - Assign conversation to staff

## Socket.IO Events

### Client to Server

- **join_conversation** - Join a conversation room
- **leave_conversation** - Leave a conversation room
- **send_message** - Send a message in a conversation

### Server to Client

- **message** - Receive a message
- **joined_conversation** - Confirmation of joining a conversation
- **error** - Error messages

## Test Users

After running the seed script, the following users will be available:

### End Users
- Email: david@example.com
- Password: user123

- Email: emma@example.com
- Password: user123

### Merchant Staff (Acme Corporation)
- Admin: admin1@acme.com / admin123
- Manager: bob@acme.com / staff123
- Staff: alice@acme.com / staff123

### Merchant Staff (Globex Industries)
- Admin: admin@globex.com / admin123
- Staff: charlie@globex.com / staff123

## License

ISC 