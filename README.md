# Incidents Dashboard

A modern, real-time incident management dashboard built with React, TypeScript, and Redux Toolkit.  
The application allows authenticated users to view, filter, and manage security incidents with live updates from the server.

---

## Features

- 🔐 Authentication with login/logout flow
- 📊 Interactive incidents table with severity, category, source, timestamp, and status
- 🔎 Advanced filtering and sorting with URL synchronization (shareable/bookmarkable URLs)
- ⚡ Real-time updates using Socket.IO
- 🚀 Optimistic UI updates for incident status changes
- 🎨 Modern UI built with HeroUI and Tailwind CSS
- ✨ Lottie animations for visual alerts and UI feedback (e.g., critical open incidents)
- 🌗 Dark/Light theme support with persistence
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔄 Error states with retry options
- 📈 Dashboard cards with visualizations (severity breakdown, status summary, incident trends)

---

## Technologies Used

- [Vite](https://vitejs.dev/) – Fast development and build tooling
- [React](https://react.dev/) – UI library
- [TypeScript](https://www.typescriptlang.org) – Static typing
- [Redux Toolkit](https://redux-toolkit.js.org/) – State management with normalized entities
- [Socket.IO](https://socket.io/) – Real-time communication
- [HeroUI](https://heroui.com) – UI component library
- [Tailwind CSS](https://tailwindcss.com) – Utility-first styling
- [Recharts](https://recharts.org/) – Charting library for data visualization
- [lottie-react](https://github.com/Gamote/lottie-react) – Rendering Lottie JSON animations in React
- [LottieFiles (Free Animations)](https://lottiefiles.com/free-animations/) – Animation catalog used to source Lottie JSON files
- [React Router](https://reactrouter.com/) – Client-side routing
- [Axios](https://axios-http.com/) – HTTP client with interceptors for token management

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (or yarn / pnpm / bun)

### Installation

1. Clone the repository:

   ```bash
   git clone <your-repo-url>
   cd incidents-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser at:
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## State Management & Redux Design Decisions

The application uses Redux Toolkit as the single source of truth for global state management. The store is divided into clear, domain-based slices to keep the codebase scalable and maintain a clean separation of concerns.

### Store Structure

#### `auth`

- Manages authentication state, user information, and access tokens
- Controls access to protected parts of the application (unauthenticated users see the Login page)
- Handles token refresh logic through Axios interceptors

#### `incidents`

- Stores the list of incidents using **normalized state** with `createEntityAdapter` for O(1) lookups and updates
- Maintains a map of incident statuses keyed by incident ID (`{ [id]: status }`) for efficient status updates
- Persists local status changes to `localStorage` to maintain state across page refreshes
- Receives real-time events (Socket.IO) and merges them into the Redux store
- Handles optimistic updates for better UX when changing incident status

#### `filters`

- Holds the current filtering and sorting options
- Filter state is synchronized with URL query parameters, enabling shareable and bookmarkable views
- Supports filtering by severity, status, category, IP address, and time range

#### `connection`

- Tracks the real-time connection status (connected, reconnecting, disconnected) to reflect Socket.IO connectivity in the UI
- Maintains last update timestamp for display in the header

### Normalization & Performance

The incidents slice uses Redux Toolkit's `createEntityAdapter` for normalized state management:

- **O(1) updates**: Direct access to incidents by ID instead of O(n) array searches
- **Efficient selectors**: Built-in selectors for common operations (`selectAll`, `selectById`, etc.)
- **Sorted state**: Automatic sorting by timestamp (most recent first)

---

## Project Structure

```
src/
├── components/          # Reusable UI components (ThemeSwitch, ErrorBanner)
├── pages/              # Page components (Dashboard, DashboardTable, FilterBar, Header, Login)
├── store/              # Redux store configuration
│   ├── slices/         # Redux slices (auth, incidents, filters, connection)
│   ├── hooks.ts        # Typed Redux hooks (useAppDispatch, useAppSelector)
│   └── store.ts        # Store configuration
├── services/           # API and WebSocket services
│   ├── api.ts          # Axios instance with interceptors
│   ├── authService.ts  # Authentication API calls
│   ├── incidentsService.ts  # Incidents API calls
│   └── websocketService.ts  # Socket.IO client service
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── dateUtils.ts    # Date formatting utilities
│   ├── filterUtils.ts  # Filtering and sorting logic
│   ├── incidentUtils.ts  # Incident-related utilities (counting, trends)
│   ├── themeHelpers.ts # Theme and styling utilities
│   └── urlUtils.ts     # URL parameter parsing and updating
├── styles/             # Global styles (globals.css)
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── provider.tsx        # App providers (HeroUIProvider, Router)
```

---

## Key Features Explained

### Real-time Updates

- Uses Socket.IO for bidirectional real-time communication
- Automatically reconnects with new tokens after refresh
- Displays connection status in the header

### Optimistic Updates

- Status changes are applied immediately in the UI
- Server updates are sent asynchronously in the background
- If the server update fails, the error is shown with retry options

### URL Synchronization

- All filter and sort options are reflected in the URL query parameters
- Users can bookmark or share specific filtered views
- Browser back/forward buttons work correctly with filter changes

### Error Handling

- Comprehensive error states with user-friendly messages
- Retry functionality for failed API calls
- Automatic token refresh on 401 errors with seamless retry

### Responsive Design

- Mobile-first approach with breakpoints for tablet and desktop
- Cards stack vertically on mobile, arrange in columns on larger screens
- Table scrolls horizontally on small screens while maintaining functionality

---

## License

Licensed under the [MIT license](LICENSE).
