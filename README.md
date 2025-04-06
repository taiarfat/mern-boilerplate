# MERN Boilerplate

A modern full-stack application boilerplate built with MongoDB, Express, React, and Node.js (MERN stack), using TypeScript for both frontend and backend.

## Project Structure

This project is organized as a monorepo with two main directories:

- `frontend/`: React application built with Vite and TypeScript
- `backend/`: Express API server built with TypeScript

## Quick Start

### Prerequisites

- Node.js (v18.x or higher recommended)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Setup and Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-boilerplate
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your MongoDB connection string and other settings
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Edit .env file with your MongoDB connection string and other settings
   npm run dev
   ```

4. **Access the application**
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5173

## Features

- **TypeScript** throughout the entire stack
- **Authentication** with JWT and refresh tokens
- **MongoDB** integration with Mongoose
- **React** with modern hooks and patterns
- **Material UI** for responsive design
- **React Query** for data fetching and state management
- **Form validation** with React Hook Form and Zod
- **API rate limiting** for security
- **PM2** for production process management

## Documentation

For detailed documentation on each part of the application:

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## License

This project is licensed under the ISC License.
