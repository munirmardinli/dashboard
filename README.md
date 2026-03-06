# Dashboard Management System

A modern, full-stack dashboard management system built with Next.js 16, React 19, TypeScript, and a clean monorepo architecture. Features a beautiful UI with glassmorphism design and powerful state management with Zustand.

## ✨ Features

- **📋 Menu Management**: Create, edit, and manage restaurant menus with categories
- **🎨 Modern UI**: Beautiful glassmorphism design with responsive layouts
- **⚡ Fast Performance**: Built with Next.js 16 and optimized webpack configuration
- **State Management**: Powered by Zustand for efficient state handling
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Multi-language Support**: Ready for internationalization
- **🚀 Monorepo Architecture**: Clean separation of concerns with workspace structure
- **API Server**: Dedicated Node.js API server with iCal generation support

## 🏗️ Architecture

This project uses a monorepo structure with separate workspaces:

```
dashboard/
├── apps/
│   ├── ui/          # Next.js 16 frontend application
│   └── api/         # Node.js HTTP API server
├── .github/         # GitHub workflows and CI/CD
├── .devcontainer/  # Development container configuration
└── turbo.json      # Turborepo configuration
```

## 🚀 Technology Stack

### Frontend (UI)

- **Framework**: Next.js 16.0.3 with webpack
- **React**: 19.2.0
- **TypeScript**: v5
- **State Management**: Zustand v5
- **Icons**: Lucide React
- **Build Tool**: Webpack (custom configuration)

### Backend (API)

- **Runtime**: Node.js with TypeScript
- **Package Type**: ESM modules
- **Tools**: tsx for development
- **Libraries**: iCal Generator for calendar integration

### Development Tools

- **Monorepo**: Turborepo 2.6.1
- **Package Manager**: npm 11.6.3
- **Node Version**: >=18.0.0

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/munirmardinli/dashboard.git
   cd dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. **Start development servers**:
   ```bash
   npm run dev
   ```

   This will start:
   - UI: `http://localhost:3000`
      - UI Environment: `apps/ui/.env.local`
   - API: Check API configuration in `apps/api/.env`

## 🛠️ Available Scripts

### Root Level (Turborepo)

```bash
# Start all development servers
npm run dev

# Build all applications
npm run build

# Start all production servers
npm start

# Run type checking across all workspaces
npm run type-check
```

### UI Application (`apps/ui`)

```bash
# Development server with webpack
cd apps/ui
npm run dev

# Production build
npm run build

# Start production server (serves static export)
npm start

# Type checking
npm run type-check
```

### API Server (`apps/api`)

```bash
# Development server with tsx watch
cd apps/api
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 📁 Project Structure

### UI Application (`apps/ui`)

```
apps/ui/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks (e.g., useFetch)
│   ├── stores/           # Zustand state stores
│   └── types/            # TypeScript type definitions
├── public/
│   └── data/             # Static data (e.g., db.json)
├── .env.local            # Environment variables
└── next.config.ts        # Next.js configuration
```

### API Server (`apps/api`)

```
apps/api/
├── src/
│   ├── index.ts          # Main entry point
│   └── routes/           # API routes
├── dist/                 # Compiled JavaScript output
├── .env
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

#### UI Application (`.env.local`)

```bash
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4012
NEXT_PUBLIC_DEFAULT_LANGUAGE=de
NEXT_PUBLIC_DEFAULT_THEME_MODE=dark
NEXT_PUBLIC_ACTIVE_SOUND=true
TZ=Europe/Berlin
```

#### API Server (`.env`)

```bash
# Server configuration
PORT=4012
NODE_ENV=development
TZ=Europe/Berlin
NEXT_PUBLIC_DEFAULT_LANGUAGE=de
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=
```

### Turborepo Configuration

The project uses Turborepo for efficient task orchestration across workspaces. See `turbo.json` for pipeline configuration.

## 🚀 Deployment

### Docker Deployment

The project includes a Docker Compose configuration:

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Vercel (UI)

The UI application is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/ui
vercel
```

### Manual Deployment

#### UI Application

```bash
cd apps/ui
npm run build
npm start
```

#### API Server

```bash
cd apps/api
npm run build
npm start
```

## 🐳 Docker Configuration

The project includes Docker Compose configuration with:

- Resource limits
- Health monitoring
- Automatic container recreation (Watchtower)

See `compose.yml` for complete configuration.

## Key Features Explained

### Menu Management System

The application provides a comprehensive menu management interface with:

- Category-based organization (appetizers, mains, drinks, etc.)
- Item-level details (title, description, price, allergens)
- Dynamic data fetching with type-safe hooks

### Type-Safe Data Fetching

Custom `useFetch` hook with:

- Full TypeScript type safety
- Automatic error handling
- Loading states
- Integration with Zustand stores

### State Management

Centralized state management using Zustand:

- Menu data store
- Loading states
- UI interaction states

## 🔒 Security

- Environment variables for sensitive configuration
- Type-safe API contracts
- Modern security headers (configured in Next.js)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code structure and patterns
- Write meaningful commit messages
- Update documentation for significant changes
- Test across different screen sizes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Munir Mardinli**

- GitHub: [@munirmardinli](https://github.com/munirmardinli)
- Project: [Dashboard Management System](https://github.com/munirmardinli/dashboard)

## 🆘 Support

For questions or issues:

- Open an issue in the [GitHub repository](https://github.com/munirmardinli/dashboard/issues)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review the [React Documentation](https://react.dev/)

## 🔄 Changelog

### v0.1.0

- Initial release with monorepo structure
- Next.js 16 UI application
- Node.js API server
- Zustand state management
- TypeScript throughout
- Docker Compose configuration
- Menu management system
- Type-safe data fetching

---

**Built with ❤️ using Next.js, React, and TypeScript**
