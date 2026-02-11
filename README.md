# 🃏 Vibe Check

**Fun questions, real connections**

Vibe Check is a multiplayer question-based card game that brings people together through engaging conversations. Create rooms, invite friends, and take turns answering thought-provoking questions from various themed packs.

## 🎮 About the Game

Vibe Check is a turn-based multiplayer game where players:

1. **Create or Join Rooms** - One player creates a room and shares the code or QR code with friends
2. **Choose Question Packs** - Select from themed categories like Friends, Family, Couples, Work Buddies, Party, or Deep Talks
3. **Add Custom Questions** - Hosts can add their own custom questions to personalize the experience
4. **Take Turns** - Players take turns drawing cards and answering questions honestly
5. **Connect** - Build deeper connections through meaningful conversations

### Question Packs

- **👯 Friends Pack** - Fun questions for your squad
- **👨‍👩‍👧‍👦 Family Pack** - Wholesome questions for family bonding
- **💕 Couples Pack** - Romantic questions for partners
- **💼 Work Buddies Pack** - Fun questions for colleagues
- **🎉 Party Pack** - Spicy questions for bold groups
- **🌙 Deep Talks Pack** - Meaningful questions for reflection

## ✨ Features

- 🎯 **Real-time Multiplayer** - Synchronized gameplay using WebSocket connections
- 📱 **QR Code Sharing** - Easy room sharing via QR codes
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🎴 **Multiple Question Packs** - Choose from 6 different themed packs
- ✏️ **Custom Questions** - Add your own questions to personalize the game
- 👥 **Player Management** - Host controls to manage players and kick if needed
- 📊 **Analytics** - Google Analytics integration for tracking game events
- 🐛 **Error Logging** - Sentry integration for client- and server-side error tracking
- 🔄 **Auto-reconnection** - Handles disconnections and reconnections gracefully
- 💓 **Heartbeat System** - Maintains connection health with periodic checks

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions
- **Radix UI** - Accessible component primitives (Dialog, Popover, Slot)
- **Lucide React** - Icon library

### Real-time Communication

- **Socket.io Client** - WebSocket client for real-time multiplayer functionality

### Additional Libraries

- **QR Code** - QR code generation and scanning (`qrcode.react`, `@yudiel/react-qr-scanner`)
- **Google Analytics** - Event tracking via `@next/third-parties`
- **Sentry** - Error monitoring and crash reporting (`@sentry/nextjs`)
- **Class Variance Authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vibe-check
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=your_socket_server_url
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_google_analytics_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn   # Optional - for error logging
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
vibe-check/
├── app/
│   ├── (pages)/              # Route groups
│   │   ├── game/[code]/     # Game page
│   │   └── lobby/[code]/    # Lobby page
│   ├── components/
│   │   ├── pages/           # Page-specific components
│   │   │   ├── game/        # Game components
│   │   │   ├── home-page/   # Home page components
│   │   │   └── lobby/       # Lobby components
│   │   └── ui/              # Reusable UI components
│   ├── context/             # React Context providers
│   │   ├── game-context.tsx # Main game state management
│   │   ├── toast-context.tsx # Toast notifications
│   │   └── utils/           # Context utilities
│   │       ├── analytics.ts # Google Analytics tracking
│   │       ├── game-operations.ts
│   │       ├── room-operations.ts
│   │       ├── player-operations.ts
│   │       ├── socket-handlers.ts
│   │       └── heartbeat.ts
│   ├── data/
│   │   └── packs.ts         # Question pack data
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── layout.tsx           # Root layout
├── public/                  # Static assets
└── package.json
```

## 🔧 Key Features Implementation

### Real-time Game State

The game uses Socket.io for real-time synchronization. All game state is managed through a centralized `GameContext` that handles:

- Room creation and joining
- Player management
- Game flow (start, turn management, completion)
- Custom question management

### Analytics Events

The app tracks the following events via Google Analytics:

- `room_created` - When a room is created
- `room_joined` - When a player joins a room
- `game_started` - When a game starts (includes pack and custom questions info)
- `pack_selected` - When a pack is selected (includes player count)
- `game_completed` - When a game finishes (includes player count, custom questions, total questions)
- `custom_question_added` - When a custom question is added

### Error Logging (Sentry)

Sentry is used for client- and server-side error tracking so issues can be triaged in one place. When a DSN is set, the app reports:

- **Unhandled errors** - Caught automatically by the Sentry SDK
- **Error boundary** - Errors that hit the root error boundary (`app/error.tsx`)
- **Socket layer** - Connection failures (`connect_error`) and server-emitted errors

Google Analytics is only loaded in production; Sentry `sendGAEvent` calls in dev just log a console warning and do not throw. See `docs/SENTRY.md` for full setup, env vars, and backend (vybe-check-api) integration.

### Connection Management

- **Heartbeat System** - Periodic checks to maintain connection health
- **Auto-reconnection** - Automatic reconnection with exponential backoff
- **Membership Verification** - Regular checks to ensure players are still in the room

## 🎯 Game Flow

1. **Home Page** → Create or join a room
2. **Lobby** → Wait for players, select pack, add custom questions (host only)
3. **Game** → Take turns answering questions
4. **Finished** → View completion screen

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Environment Variables

| Variable                          | Description                                        | Required |
| --------------------------------- | -------------------------------------------------- | -------- |
| `NEXT_PUBLIC_SOCKET_URL`          | WebSocket server URL for real-time communication   | Yes      |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID                    | No       |
| `NEXT_PUBLIC_SENTRY_DSN`          | Sentry DSN for client-side error logging           | No       |
| `SENTRY_DSN`                      | Sentry DSN for server-side (build/instrumentation) | No       |
| `SENTRY_ORG` / `SENTRY_PROJECT`   | Used by Sentry build plugin for source map uploads | No       |

## 🎨 Styling

The project uses:

- **Tailwind CSS 4** - For styling
- **Geist Font** - Custom font family from Vercel
- **CSS Variables** - For theming
- **Framer Motion** - For animations and transitions

## 📱 Browser Support

Modern browsers with WebSocket support:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is private and proprietary.

---

**Made with ❤️ for bringing people together through meaningful conversations**
