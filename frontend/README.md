# Customer Service Chat - Frontend

A modern, real-time customer service chat application built with Next.js, TypeScript, and Socket.IO. This application allows end users to chat with merchant staff and provides a comprehensive dashboard for merchants to manage conversations.

## Features

- **Real-time Chat:** Instant messaging with Socket.IO integration
- **Role-based Access Control:** Different interfaces for end users, staff, managers, and admins
- **Responsive Design:** Works on all device sizes
- **Modern UI:** Built with TailwindCSS for a clean, modern interface

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- Backend API running (default: http://localhost:4000)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

This application is built using:

- **Next.js 15+**: For server-side rendering and routing
- **TypeScript**: For type safety
- **TailwindCSS**: For styling
- **Socket.IO Client**: For real-time communication
- **Context API**: For state management

## Folder Structure

```
frontend/
├── src/                   # Source code
│   ├── app/               # Next.js app directory (routes)
│   │   ├── (dashboard)/   # Protected routes for authenticated users
│   │   ├── auth/          # Authentication-related pages
│   │   └── unauthorized/  # Access denied page
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts for state management
│   └── services/          # Services for API and Socket communication
├── public/                # Static assets
└── README.md              # Project documentation
```

## Pages

### Public Pages
- **Login (`/auth/login`)**: Authentication for all users
- **Register (`/auth/register`)**: Registration for end users
- **Unauthorized (`/unauthorized`)**: Shown when access is denied

### End User Pages
- **Merchant List (`/merchants`)**: Displays available merchants to chat with
- **Conversations (`/conversations`)**: Lists user's conversations
- **Chat (`/conversations/[id]`)**: Real-time chat interface

### Merchant Staff Pages
- **Dashboard (`/merchant/dashboard`)**: Shows statistics and conversations
- **Conversations (`/conversations`)**: Lists all conversations for the merchant
- **Chat (`/conversations/[id]`)**: Same chat interface with staff features
- **Staff Management (`/merchant/staff`)**: For admin/managers to manage staff

## Authentication & Authorization

The application uses JWT tokens for authentication, stored in `localStorage`. User roles determine access to different areas:

### User Types
- **End User**: Can chat with merchants
- **Merchant Staff**: Different abilities based on role

### Staff Roles
- **Staff**: Can view and reply to assigned conversations
- **Manager**: Can assign conversations and manage staff
- **Admin**: Full access to all features, including staff management

## Components

### Main Components
- **Message**: Displays individual messages in the chat
- **MessageInput**: Input field for sending messages
- **ConversationListItem**: Shows conversation summary in lists
- **MerchantCard**: Displays merchant information with option to start chat
- **StaffSelector**: Interface for assigning staff to conversations
- **Navbar**: Navigation bar with role-based links
- **ProtectedRoute**: Access control component

## Services

### API Service
Located at `src/services/api.ts`, handles all API requests for:
- Authentication (login, register)
- Conversations management
- Messaging
- Staff management

### Socket Service
Located at `src/services/socket.ts`, handles real-time updates:
- New messages
- Conversation assignments
- Socket connection management

## Building for Production

To build the application for production:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Testing Users

After setting up and connecting to the backend, you can use these test accounts:

### End Users
- john@example.com / password123
- sarah@example.com / password123

### Merchant Staff (TechStore)
- admin@techstore.com / admin123
- manager@techstore.com / manager123
- staff1@techstore.com / staff123
