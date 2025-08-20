# SJK Sign-Out Application

A inventory and loan management system built with Remix, TypeScript, and Mantine UI. This application provides a solution for tracking items, managing loans, and monitoring inventory across different locations and users.

## Features

### Core Functionality

- **Item Management**: Create, edit, and track inventory items with detailed information
- **Loan Management**: Full loan lifecycle from creation to return with timeline tracking
- **People Management**: User profiles with role-based access and loan history
- **Location Tracking**: Multi-location inventory management
- **Tag System**: Flexible tagging and categorization system
- **QR Code Integration**: Quick item identification and tracking

### Advanced Features

- **Timeline Views**: Visual history of item loans and returns
- **Bulk Operations**: Mass operations for efficiency
- **Search & Filtering**: Advanced filtering across all entity types
- **Responsive Design**: Mobile-first design with desktop optimization
- **Real-time Updates**: Live status tracking and notifications
- **Analytics Dashboard**: Comprehensive reporting and statistics

## Technology Stack

### Frontend

- **[Remix](https://remix.run/)** - Full-stack React framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Mantine](https://mantine.dev/)** - Modern React components library
- **[Mantine React Table](https://www.mantine-react-table.com/)** - Advanced data tables
- **[Tabler Icons](https://tabler-icons.io/)** - Beautiful SVG icons
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Backend & Database

- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[MariaDB](https://mariadb.org/)** - Relational database management system
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Development Tools

- **[Vite](https://vitejs.dev/)** - Fast build tool
- **[Docker](https://www.docker.com/)** - Containerization
- **ESLint & Prettier** - Code quality and formatting
- **TypeScript** - Static type checking

## Prerequisites

- Node.js (v20.0.0 or higher)
- npm or yarn
- MariaDB server (v11.2 or higher)
- Docker (optional, for containerized deployment)

## Quick Start

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd signout-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   ```bash
   # Create MariaDB database (replace with your credentials)
   mysql -u root -p -e "CREATE DATABASE signout_app;"

   # Generate Prisma client and push schema
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## Docker Setup

The application provides three Docker configurations for different use cases:

- **`docker-compose.dev.yml`** - Development with hot reloading
- **`docker-compose.prod.yml`** - Production testing and validation
- **`docker-compose.yml`** - Production deployment

### Environment Setup

First, create a `.env` file in the root directory with the following variables:

```bash
# Database credentials
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_PASSWORD=your-app-password

# User permissions (get with: id -u && id -g)
UID=1000
GID=1000

# Application URLs
PROFILE_URL=profile-url
REPORT_URL=report-url

# Local database connection (for Prisma commands)
DATABASE_URL=mysql://signout-app:your-app-password@127.0.0.1:3306/signout_app_dev
```

## Development Environment

Perfect for local development with hot reloading and debugging capabilities.

### Quick Start

```bash
# 1. Start development environment
docker compose -f docker-compose.dev.yml up

# 2. Apply database migrations (new terminal)
npx prisma migrate dev

# 3. Seed database (optional)
npx prisma db seed
```

### Configuration Details

**MariaDB Service:**

- **Image**: `mariadb:11.2`
- **Port**: `127.0.0.1:3306:3306`
- **Database**: `signout_app_dev`
- **Timezone**: America/Toronto

**App Service:**

- **Image**: `node:20.12.2-bullseye-slim`
- **Ports**: `3000` (app), `5173` (Vite HMR)
- **Features**: Hot reloading, volume mounting, auto-install dependencies

### Environment Variables

```bash
# Container variables (automatic)
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
DATABASE_URL=mysql://signout-app:${MYSQL_PASSWORD}@mariadb:3306/signout_app_dev
PROFILE_URL=${PROFILE_URL}
REPORT_URL=${REPORT_URL}
CHOKIDAR_USEPOLLING=true
```

## Production Testing

Test production builds locally before deployment.

### Quick Start

```bash
# 1. Build and start
docker compose -f docker-compose.prod.yml up --build

# 2. Access application
# http://localhost:3100
```

### Configuration Details

**MariaDB Service:**

- **Database**: `signout_app`
- **Port**: `127.0.0.1:3306:3306`

**App Service:**

- **Build**: Local Dockerfile
- **Port**: `127.0.0.1:3100:3000`
- **Features**: Production build, health checks, auto-migrations

### Environment Variables

```bash
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_PASSWORD=your-secure-app-password
UID=1000  # Your user ID
GID=1000  # Your group ID
```

## Production Deployment

Production-ready configuration.

### Quick Start

```bash
# 1. Deploy
docker compose up -d

# 2. Access application
# http://localhost:3000
```

### Configuration Details

**MariaDB Service:**

- **Container**: `mariadb:11.2`
- **Database**: `app`
- **Security**: Random root password, dedicated app user

**App Service:**

- **Image**: Built from image (`signout-app:latest`)
- **Port**: `127.0.0.1:3000:3000`
- **Features**: Health checks, auto-migrations, restart policies

### Environment Variables

```bash
MYSQL_PASSWORD=your-production-password
UID=1000  # Optional: User ID for file permissions
GID=1000  # Optional: Group ID for file permissions
```

## Common Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up -d     # Start in background
docker compose -f docker-compose.dev.yml logs -f   # View logs
docker compose -f docker-compose.dev.yml down      # Stop and remove

# Production Testing
docker compose -f docker-compose.prod.yml up --build
docker compose -f docker-compose.prod.yml down -v  # Remove volumes too

# Production Deployment
docker compose up -d                                # Deploy
docker compose ps                                   # Check status
docker compose restart app                         # Restart app only
```

## Troubleshooting

**Permission Issues:**

- Ensure `UID` and `GID` match your user: `id -u` and `id -g`

**Database Connection:**

- Development: Database available at `127.0.0.1:3306`
- Check health: `docker compose logs mariadb`

**Port Conflicts:**

- Development: `3000`, `3306`, `5173`
- Production Testing: `3100`, `3306`
- Production: `3000`, `3306`

## Project Structure

```text
signout-app/
├── app/                          # Remix application code
│   ├── components/              # Reusable UI components
│   │   ├── base/               # Base components (ListView, InfoView, etc.)
│   │   ├── forms/              # Form components
│   │   ├── items/              # Item-specific components
│   │   ├── loans/              # Loan-specific components
│   │   ├── people/             # People-specific components
│   │   ├── qrCode/             # QR code components
│   │   ├── tables/             # Data table components
│   │   └── tags/               # Tag-related components
│   ├── lib/                    # Business logic and utilities
│   │   ├── *.server.ts         # Server-side functions
│   │   ├── hooks.ts            # Custom React hooks
│   │   ├── schemas.ts          # Zod validation schemas
│   │   └── prisma.server.ts    # Database connection
│   ├── routes/                 # Remix routes (file-based routing)
│   │   ├── _index.tsx          # Home dashboard
│   │   ├── items/              # Item management routes
│   │   ├── loans/              # Loan management routes
│   │   ├── people/             # People management routes
│   │   ├── locations/          # Location management routes
│   │   └── tags/               # Tag management routes
│   ├── utils/                  # Utility functions and constants
│   └── styles/                 # Global styles and CSS
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── seed.ts                 # Database seeding
│   └── migrations/             # Database migrations
├── public/                     # Static assets
```

## Scripts

Available npm scripts:

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Utilities
npm run typecheck        # Run TypeScript checks
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
