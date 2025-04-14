# Frontend Documentation

## Overview
This is the frontend application for the chat service, built with Next.js, React, and Tailwind CSS.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend service running

## Getting Started

### Installing Dependencies
Install the required packages:
```bash
npm install
```

### Running the Application

#### Development Mode
To run the application in development mode with hot-reloading:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

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

## Project Structure
```
frontend/
├── public/           # Static files
├── src/
│   ├── app/          # Next.js pages and layouts
│   ├── components/   # Reusable React components
│   ├── lib/          # Utility functions and helpers
│   ├── hooks/        # Custom React hooks
│   ├── services/     # API service modules
│   ├── styles/       # Global styles
│   └── types/        # TypeScript type definitions
```

## Features
- Real-time chat functionality with Socket.IO
- Light and dark mode support via next-themes
- Responsive design with Tailwind CSS
- Secure authentication system

## Configuration
The frontend connects to the backend API. Make sure the backend server is running before using the chat functionality.

### Environment Variables
You can customize the application by creating a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Component Overview

### Key Components
- **ChatInterface**: Main chat interface component
- **MessageList**: Displays chat messages
- **MessageInput**: Allows users to compose and send messages
- **AuthForms**: Login and registration forms
- **UserProfile**: Displays and allows editing of user information

## WebSocket Integration
The application uses Socket.IO client to establish real-time communication with the backend:

```javascript
// Example from a socket connection hook
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: userToken
  }
});

// Listen for incoming messages
socket.on('message', (data) => {
  // Handle new message
});

// Send a message
const sendMessage = (message) => {
  socket.emit('message', message);
};
```

## Building for Production
When building for production, the application is optimized for performance:

```bash
npm run build
```

This generates an optimized version of your application in the `.next` folder.

## Troubleshooting

### Common Issues
- **Connection issues with backend**: Ensure the backend server is running and the API URL is correctly configured
- **Socket connection problems**: Check if your token authentication is working correctly
- **UI rendering issues**: Make sure your browser supports all the features being used

## Browser Compatibility
The application is compatible with all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
