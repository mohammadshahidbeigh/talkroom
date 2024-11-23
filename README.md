## TalkRoom - Real-Time Chat Application

A modern and secure real-time chat application built with React, TypeScript, Node.js, and WebSocket technology.

## Features

- Secure real-time messaging with WebSocket Backend (Node.js + Express):

  - REST API with JWT authentication and rate limiting
  - WebSocket integration using Socket.IO with origin validation
  - PostgreSQL connection using Prisma ORM with parameterized queries
  - Redis integration for secure session management
  - WebRTC signaling server with encryption

- Frontend Security (React):

  - Material UI with XSS protection
  - Socket.IO client with secure connection
  - WebRTC with encrypted peer connections
  - Protected routing and secure authentication flow

- Advanced Security Features:

  - Brute force protection with rate limiting
  - XSS prevention with content security policy
  - CSRF token validation
  - SQL injection protection via Prisma ORM
  - DoS protection with rate limiting
  - Secure file upload with validation
  - Session security with HTTP-only cookies
  - Parameter pollution prevention
  - Environment variable validation

- User authentication with password policies
- Encrypted chat history
- Secure Redis session management
- PostgreSQL with encrypted data storage
- Modern and responsive UI with sanitized inputs
- Encrypted video/audio calls using WebRTC
- Secure file sharing with validation
- User presence with rate limiting
- Encrypted message receipts
- Rate-limited typing indicators

## Tech Stack

### Frontend

- React 18 with TypeScript and security best practices
- Vite with security configurations
- Socket.IO client with secure WebSocket
- Material UI v5 with XSS protection
- React Router v6 with protected routes
- Redux Toolkit with secure state management
- WebRTC with encryption

### Backend

- Node.js 18+ with TypeScript and security headers
- Express.js with security middleware
- Socket.IO with connection validation
- Redis with encrypted sessions
- PostgreSQL 14+ with encrypted data
- Prisma ORM with query protection
- JWT with secure configurations
- Jest for security testing

## Getting Started

1. Clone the repository
2. Install dependencies:
