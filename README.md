# Customer Service Chat Module - Backend

This is the backend service for the Customer Service Chat Module, built with Express, TypeScript, PostgreSQL, Prisma, and Socket.IO.

## Features

- Real-time chat using Socket.IO
- User authentication and role-based authorization
- Conversation management between end users and merchants
- Role-based access control (admin, manager, staff)
- Live message updates with staff member attribution

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

## Setup and Installation

1. **Clone the repository**

2. **Install dependencies**
   ```
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root of the backend directory:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chat_service?schema=public"
   JWT_SECRET="your_secret_key_change_this_in_production"
   PORT=4000
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Generate Prisma client**
   ```
   npm run prisma:generate
   ```

5. **Push the database schema**
   ```
   npx prisma db push
   ```

6. **Seed the database with initial data**
   ```
   npm run prisma:seed
   ```

7. **Start the development server**
   ```
   npm run dev
   ```

The server will be running at http://localhost:4000

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
  - Body: `{ name, email, password, type, role?, merchantId? }`
  - Type can be 'end_user' or 'merchant_staff'
  - Role and merchantId required for merchant staff

- **POST /api/auth/login** - Login for any user
  - Body: `{ email, password }`
  - Returns JWT token for authentication

### Conversations

- **POST /api/conversations** - Start a new conversation (end users only)
  - Body: `{ merchantId }`
  - Returns: `{ conversationId }`

- **GET /api/conversations** - Get all conversations for the current user
  - End users: Their initiated conversations
  - Merchant staff: All conversations for their merchant

- **GET /api/conversations/:id** - Get conversation details with messages
  - Returns conversation details and all messages

- **POST /api/conversations/:id/messages** - Send a message
  - Body: `{ text }`
  - Merchant staff replies include their name

- **PUT /api/conversations/:id/assign** - Assign conversation to staff
  - Body: `{ staffId }`
  - Only for merchant admins and managers

## Socket.IO Events

### Client to Server

- **join_conversation** - Join a conversation room
  - Param: `conversationId`

- **leave_conversation** - Leave a conversation room
  - Param: `conversationId`

### Server to Client

- **message** - New message event
  - Data includes: `{ id, conversationId, senderName, senderId, text, sentAt, isMerchantStaff }`

- **conversation_assigned** - When a conversation gets assigned
  - Data includes: `{ conversationId, staffId, staffName }`

- **error** - Error messages

## Authentication

The system uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Test Users

After running the seed script, the following users will be available:

### End Users
- Email: john@example.com
- Password: password123

- Email: sarah@example.com
- Password: password123

### Merchant Staff (TechStore Inc.)
- Admin: admin@techstore.com / admin123
- Manager: manager@techstore.com / manager123
- Staff: staff1@techstore.com / staff123

### Merchant Staff (Fashion Outlet)
- Admin: admin@fashion.com / admin123
- Staff: staff@fashion.com / staff123

## Development Commands

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:seed` - Seed the database 