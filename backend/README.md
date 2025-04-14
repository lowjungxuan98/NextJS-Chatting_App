# Backend Documentation

## Overview
This is the backend service for the chat application built with Express.js, TypeScript, and Prisma ORM with a PostgreSQL database.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose

## Getting Started

### Setting Up the Database
The backend uses PostgreSQL which runs in Docker:

1. Start the database container:
   ```bash
   docker-compose up -d
   ```
   This will start a PostgreSQL instance at `localhost:5432` with the following credentials:
   - Username: postgres
   - Password: postgres
   - Database: chat_service

### Database Initialization
After the database container is running, you need to set up the database schema:

1. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

2. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

3. (Optional) Seed the database with initial data:
   ```bash
   npm run prisma:seed
   ```

### Installing Dependencies
Install required packages:
```bash
npm install
```

### Running the Application

#### Development Mode
To run the application in development mode with hot-reloading:
```bash
npm run dev
```
The server will start at http://localhost:3001 (or the port specified in your .env file).

#### Production Mode
To run the application in production mode:
1. Build the application:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Environment Variables
Create a `.env` file in the root of the backend directory with the following variables:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chat_service"
JWT_SECRET="your-secret-key"
PORT=3001
```

## API Endpoints

The backend exposes the following main endpoints:

- **Authentication**
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration

- **Chats**
  - `GET /api/chats` - Get all chats
  - `GET /api/chats/:id` - Get a specific chat
  - `POST /api/chats` - Create a new chat

- **Messages**
  - `GET /api/chats/:chatId/messages` - Get messages for a chat
  - `POST /api/chats/:chatId/messages` - Send a message

## Websocket Communication

The backend uses Socket.IO for real-time communication:

- Events emitted:
  - `message` - When a new message is sent
  - `typing` - When a user is typing

- Events listened for:
  - `message` - When a client sends a message
  - `typing` - When a client is typing

## Troubleshooting

If you encounter issues with the database connection:
1. Ensure the Docker container is running: `docker ps`
2. Check database logs: `docker logs <postgres-container-id>`
3. Verify your DATABASE_URL in the .env file is correct

For issues with Prisma:
- Run `npx prisma migrate reset` to reset the database and run all migrations
- Check if the database schema matches the Prisma schema
