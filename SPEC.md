# Buzz Reminders — Product Requirements Specification
**Version:** 2.0  
**Target Platform:** iOS + Android (React Native + Expo Go) + Web PWA (Vercel)  
**Cursor AI Project Name:** `buzz-reminders`

---

## 1. Project Overview

**Buzz Reminders** is a personal reminder and alert app focused on flexibility, priority management, and reliable multi-modal notifications (sound, vibration, visual). Built with **React Native + Expo**, it runs natively on iOS and Android via **Expo Go** during development, and ships a companion **web PWA** deployed on **Vercel** — all from a single shared codebase.

---

## 2. Core Features

### 2.1 Reminder Types

| Type | Description |
|---|---|
| **Task** | A to-do item with a deadline |
| **Event** | A calendar-style time-based reminder |
| **Habit** | A recurring routine (daily, weekly, custom) |
| **Medication** | Health-focused repeat reminder with strict timing |
| **Bill / Payment** | Financial due-date reminders |
| **Custom** | User-defined label and icon |

Each reminder type has a distinct icon and optional color tag.

---

### 2.2 Reminder Fields (Per Reminder)

| Field | Type | Required |
|---|---|---|
| Title | Text (max 80 chars) | Yes |
| Description / Notes | Text (max 500 chars) | No |
| Type | Enum (see 2.1) | Yes |
| Priority | Enum: Low / Medium / High / Critical | Yes |
| Date & Time | DateTime picker | Yes |
| Repeat / Recurrence | See 2.3 | No |
| Alert Mode | Sound / Vibrate / Both / Silent | Yes |
| Sound Selection | Preset library or custom audio file | No |
| Snooze Options | Duration: 5 / 10 / 15 / 30 / 60 min | No |
| Tags / Labels | Free-form multi-tag | No |
| Attachment | Image or file link | No |

---

### 2.3 Recurrence Options

- **One-time** — fires once at the set time
- **Daily** — every day at the set time
- **Weekdays only** — Mon–Fri
- **Weekends only** — Sat–Sun
- **Weekly** — pick specific day(s) of the week
- **Bi-weekly** — every 2 weeks on selected day
- **Monthly** — same date each month OR same weekday occurrence (e.g. 2nd Tuesday)
- **Yearly** — annual anniversary reminders
- **Custom interval** — every N days/weeks/months
- **End condition** — Never / After N occurrences / On date

---

### 2.4 Priority System

| Level | Color | Behavior |
|---|---|---|
| **Low** | Gray | Silent badge notification |
| **Medium** | Blue | Standard alert with sound |
| **High** | Orange | Loud alert, persistent banner |
| **Critical** | Red | Full-screen takeover alert, repeat buzz every 2 min until dismissed |

---

### 2.5 Alert & Notification System

**Delivery modes:**
- Push notification (background)
- In-app full-screen alert (foreground)
- Home screen banner
- Lock screen card
- Web browser notification (PWA, via Web Notifications API)

**Alert actions (on notification):**
- **Dismiss** — marks reminder as acknowledged, stops alerts
- **Snooze** — delays by selected duration
- **Done** — marks reminder as completed
- **View** — opens full detail screen

**Sound options:**
- Built-in preset library (10–15 sounds: chime, buzz, bell, ping, alarm, etc.)
- System default
- Upload custom audio file (MP3/WAV, max 1MB)
- Vibration patterns: short pulse / long pulse / double-tap / escalating

**Do Not Disturb integration:**
- Respect system DND unless reminder is marked **Critical**
- App-level quiet hours setting (e.g. 10 PM – 7 AM)

---

### 2.6 Dismissal & Completion Flow

- Single swipe right → **Complete** (green checkmark animation)
- Single swipe left → **Snooze** picker
- Long press → context menu (Edit / Delete / Duplicate / Share)
- Bulk select mode for mass complete / delete
- Completed reminders move to a **History** tab (searchable)
- Deleted reminders go to **Trash** (auto-purge after 30 days)

---

## 3. Additional Useful Features

### 3.1 Smart Suggestions
- AI-based suggestion: "You often set reminders on Sunday nights — want to create a weekly one?"
- Auto-detect common patterns from past reminders and offer templates

### 3.2 Quick Add (Natural Language Input)
- "Remind me to call mom tomorrow at 5pm, high priority" → auto-fills all fields
- Parse via OpenAI API (GPT-4o-mini); user confirms before saving

### 3.3 Reminder Templates
- Save any reminder as a reusable template
- Pre-built templates: Morning routine, Medication, Weekly review, Bill due
- Template library screen with quick-launch buttons

### 3.4 Widgets
- Home screen widget (iOS/Android): shows next 3 upcoming reminders
- Lock screen widget: countdown to next Critical or High priority item

### 3.5 Focus Modes / Profiles
- Create named profiles: Work, Home, Sleep, Travel
- Each profile has its own quiet hours, default alert mode, and visible categories

### 3.6 Location-Based Reminders
- Trigger reminder when arriving at or leaving a saved location (GPS geofence)
- "Remind me to grab milk when I'm near Whole Foods"

### 3.7 Shared / Collaborative Reminders
- Share a reminder with another Buzz user (invite by email or link)
- Both parties can mark complete; completion is synced in real time

### 3.8 Streak & Habit Tracking
- For Habit-type reminders: track completion streaks
- Visual calendar heatmap per habit
- Weekly summary notification: "You completed 5/7 days this week 🔥"

### 3.9 Search & Filter
- Full-text search across all reminders
- Filter by: Type / Priority / Date range / Tag / Completion status
- Sort by: Due date / Priority / Creation date / Alphabetical

### 3.10 Cloud Sync & Backup
- Real-time sync across devices via Supabase
- Manual export: JSON / CSV
- iCal / Google Calendar two-way sync (optional, Phase 2)

---

## 4. Screens & Navigation

```
Tab Bar (mobile) / Sidebar (web):
├── 📋 Today        — reminders due today, grouped by time
├── 📅 Upcoming     — next 7 days, scrollable list
├── ✅ Habits       — habit tracker with streak display
├── 🗂 All          — full list with search + filters
└── ⚙️ Settings     — profile, notifications, themes, sync
```

**Additional screens:**
- Reminder Detail / Edit
- Quick Add sheet (bottom sheet on mobile, modal on web)
- Notification / Alert overlay (full-screen for Critical)
- History & Trash
- Template Library
- Profile / Focus Mode manager
- Onboarding (3-step: permissions, quick-add demo, customize alerts)

---

## 5. Data Model (Simplified)

```typescript
interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: ReminderType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueAt: Date;
  recurrence?: RecurrenceRule;
  alertMode: 'sound' | 'vibrate' | 'both' | 'silent';
  soundId?: string;
  snoozeOptions: number[];        // minutes
  tags: string[];
  attachmentUrl?: string;
  location?: GeoFence;
  sharedWith?: string[];          // user IDs
  status: 'pending' | 'snoozed' | 'completed' | 'dismissed' | 'deleted';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  templateId?: string;
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | 'custom';
  interval?: number;
  daysOfWeek?: number[];
  endCondition: 'never' | 'after' | 'onDate';
  endAfterOccurrences?: number;
  endDate?: Date;
}
```

---

## 6. Tech Stack

### 6.1 Mobile (React Native + Expo Go)

| Layer | Package / Tool |
|---|---|
| **Framework** | React Native via **Expo SDK 51+** |
| **Dev Client** | **Expo Go** (scan QR, instant preview on device) |
| **Navigation** | **Expo Router** (file-based, works on web + native) |
| **State Management** | **Zustand** |
| **Local DB** | **AsyncStorage** (MVP) → **WatermelonDB** (scale) |
| **Notifications** | `expo-notifications` |
| **Background Tasks** | `expo-task-manager` |
| **Location** | `expo-location` |
| **Audio** | `expo-av` |
| **Animations** | **React Native Reanimated 3** |
| **Gestures** | `react-native-gesture-handler` |
| **Icons** | `@expo/vector-icons` (Ionicons) |
| **NLP / AI** | OpenAI API (GPT-4o-mini) |

> ⚠️ **Expo Go Constraints:** Expo Go does not support custom native modules. All packages must be available in the Expo Go SDK. If a custom native module is ever required (e.g. advanced background audio), you will need to switch to a **Development Build** (`expo-dev-client`). For MVP, everything listed above is Expo Go compatible.

---

### 6.2 Web / PWA (Vercel)

Expo Router supports **react-native-web** out of the box — the same codebase renders on web with no separate web project needed.

| Layer | Tool |
|---|---|
| **Web Renderer** | `react-native-web` (bundled via Expo) |
| **Web Build** | `npx expo export --platform web` |
| **Hosting** | **Vercel** |
| **Web Notifications** | Browser Notifications API (via `expo-notifications` web shim) |
| **PWA manifest** | `app.json` → `web.favicon`, `web.name`, `web.shortName` |
| **Service Worker** | Auto-generated by Expo for offline support |

---

### 6.3 Backend / Cloud

| Layer | Tool |
|---|---|
| **Auth** | **Supabase Auth** (email, Google, Apple sign-in) |
| **Database** | **Supabase PostgreSQL** (realtime subscriptions) |
| **File Storage** | **Supabase Storage** (attachments, custom sounds) |
| **API layer** | **Supabase Edge Functions** (Deno, for NLP proxy / push scheduling) |
| **Push Notifications** | **Expo Push Notification Service** (APNS + FCM via Expo) |

---

## 7. Project Folder Structure

```
buzz-reminders/
├── app/                        # Expo Router — screens (web + native)
│   ├── (tabs)/
│   │   ├── index.tsx           # Today tab
│   │   ├── upcoming.tsx        # Upcoming tab
│   │   ├── habits.tsx          # Habits tab
│   │   ├── all.tsx             # All reminders tab
│   │   └── settings.tsx        # Settings tab
│   ├── reminder/
│   │   ├── [id].tsx            # Reminder detail / edit
│   │   └── new.tsx             # New reminder form
│   ├── onboarding.tsx
│   └── _layout.tsx             # Root layout + tab navigator
│
├── components/                 # Shared UI components
│   ├── ReminderCard.tsx
│   ├── PriorityBadge.tsx
│   ├── QuickAddSheet.tsx
│   ├── AlertOverlay.tsx        # Full-screen Critical alert
│   └── SwipeableRow.tsx
│
├── store/                      # Zustand state slices
│   ├── reminders.ts
│   ├── settings.ts
│   └── habits.ts
│
├── hooks/                      # Custom hooks
│   ├── useNotifications.ts
│   ├── useReminders.ts
│   └── useHabits.ts
│
├── lib/                        # Utilities & services
│   ├── supabase.ts             # Supabase client
│   ├── notifications.ts        # Schedule / cancel helpers
│   ├── nlp.ts                  # OpenAI quick-add parser
│   └── recurrence.ts           # Recurrence date calculator
│
├── constants/
│   ├── colors.ts               # Priority colors, theme tokens
│   ├── sounds.ts               # Sound preset map
│   └── reminderTypes.ts        # Type definitions + icons
│
├── assets/
│   ├── sounds/                 # Bundled audio files
│   └── images/
│
├── public/                     # Static assets served by Vercel (web only)
│   └── favicon.ico
│
├── vercel.json                 # Vercel deployment config
├── app.json                    # Expo app config (including web PWA settings)
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## 8. Vercel Deployment Setup

### 8.1 How It Works

Expo Router uses **Metro** as the bundler for native and **webpack / Metro web** for web output. `expo export --platform web` generates a static site in the `dist/` folder that Vercel serves as a standard static deployment.

### 8.2 `vercel.json`

```json
{
  "buildCommand": "npx expo export --platform web",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ]
}
```

> The `rewrites` rule ensures Expo Router's client-side routing works correctly — all paths fall back to `index.html`.

### 8.3 `app.json` Web / PWA Section

Add this inside your existing `app.json` `expo` block:

```json
{
  "expo": {
    "name": "Buzz Reminders",
    "slug": "buzz-reminders",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "web": {
      "bundler": "metro",
      "favicon": "./assets/images/favicon.png",
      "name": "Buzz Reminders",
      "shortName": "Buzz",
      "description": "Smart reminders with priority alerts",
      "themeColor": "#1a1a2e",
      "backgroundColor": "#1a1a2e",
      "display": "standalone",
      "orientation": "portrait"
    }
  }
}
```

### 8.4 Environment Variables on Vercel

In the Vercel dashboard → **Settings → Environment Variables**, add:

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `EXPO_PUBLIC_OPENAI_KEY` | OpenAI API key (NLP quick-add) |

> Prefix all client-side env vars with `EXPO_PUBLIC_` — Expo automatically inlines these at build time.

### 8.5 Deployment Steps

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. In project root — first deploy (follow prompts)
vercel

# 4. After initial setup, production deploys are automatic on every git push to main
vercel --prod

# Or connect your GitHub repo in the Vercel dashboard for auto-deploy
```

### 8.6 Local Web Preview

```bash
# Run web in browser locally (hot reload)
npx expo start --web

# Build and preview production web output locally
npx expo export --platform web
npx serve dist
```

---

## 9. Expo Go Setup & Development Workflow

### 9.1 Prerequisites

```bash
# Node.js 18+ required
node -v

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Install project dependencies
cd buzz-reminders
npm install
```

### 9.2 Run on Expo Go

```bash
# Start Expo dev server
npx expo start

# Options:
# Press i → open iOS Simulator
# Press a → open Android Emulator
# Scan QR code with Expo Go app on your physical device
```

**On your phone:**
1. Install **Expo Go** from App Store or Google Play
2. Make sure your phone and computer are on the same Wi-Fi
3. Scan the QR code shown in the terminal
4. The app live-reloads on every save

### 9.3 Expo Go Compatibility Checklist

Before adding any new package, verify it's Expo Go compatible:

```bash
# Check if a package requires a custom native module
npx expo install <package-name>
# Expo will warn you if the package needs a dev build
```

| Package | Expo Go Compatible? |
|---|---|
| `expo-notifications` | ✅ Yes |
| `expo-av` | ✅ Yes |
| `expo-location` | ✅ Yes |
| `expo-task-manager` | ✅ Yes (limited background on Expo Go) |
| `react-native-reanimated` | ✅ Yes |
| `react-native-gesture-handler` | ✅ Yes |
| `expo-calendar` | ✅ Yes |
| WatermelonDB | ⚠️ Requires Dev Build (use AsyncStorage for MVP) |
| Custom native Bluetooth/NFC | ❌ Requires Dev Build |

---

## 10. Permissions Required

| Permission | Platform | Reason |
|---|---|---|
| Notifications | iOS + Android | Core alert delivery |
| Exact Alarm | Android 12+ | Precise scheduled notifications |
| Background App Refresh | iOS | Background task execution |
| Location (When in Use) | iOS + Android | Geo-triggered reminders |
| Microphone | Optional | Voice-to-reminder (future) |
| Contacts | Optional | Shared reminder invites |

---

## 11. Monetization Options (Optional)

| Tier | Features |
|---|---|
| **Free** | Up to 20 active reminders, basic types, 3 sounds, no sync |
| **Pro ($2.99/mo)** | Unlimited reminders, all types, custom sounds, cloud sync, widgets, location triggers |
| **Family ($4.99/mo)** | Pro + shared reminders for up to 5 users |

---

## 12. MVP Scope (Phase 1)

Focus Cursor AI on these first:

1. Project scaffold with Expo Router + Zustand + AsyncStorage
2. Create / Edit / Delete reminder (all core fields)
3. One-time and daily/weekly recurrence
4. Priority levels with visual color distinction
5. Push notification delivery via `expo-notifications` (sound + vibrate)
6. Dismiss / Snooze / Complete actions with swipe gestures
7. Today + Upcoming tabs
8. Vercel web deployment working from day one
9. Onboarding flow (permissions request)

**Defer to Phase 2:** location triggers, shared reminders, NLP quick-add, widgets, calendar sync, habit streaks, Supabase cloud sync, WatermelonDB migration.

---

## 13. Cursor AI Project Setup Prompt

Paste this as your **first prompt** in a new Cursor AI project:

```
Build a React Native app called "Buzz Reminders" using Expo SDK 51+ with Expo Go compatibility.

TECH STACK:
- Expo Router (file-based navigation, supports both mobile and web)
- Zustand for global state management
- AsyncStorage for local persistence (Expo Go compatible)
- expo-notifications for scheduling push/local notifications
- expo-av for audio playback
- react-native-reanimated 3 for animations
- react-native-gesture-handler for swipe gestures
- TypeScript throughout

DEPLOYMENT TARGETS:
- iOS + Android via Expo Go during development
- Web PWA deployed on Vercel (expo export --platform web)
- Include vercel.json configured for static Expo web export

PROJECT STRUCTURE:
Use the folder layout: app/(tabs)/ for tab screens, components/, store/, hooks/, lib/, constants/

MVP FEATURES TO BUILD:
1. Bottom tab navigation: Today, Upcoming, Habits, All, Settings
2. Reminder creation form with fields: title, type (Task/Event/Habit/Medication/Bill/Custom), priority (Low/Medium/High/Critical), date+time picker, recurrence selector, alert mode (Sound/Vibrate/Both/Silent)
3. Reminder list cards with priority color coding: Low=gray, Medium=blue, High=orange, Critical=red
4. Swipe right to Complete, swipe left to Snooze on list items
5. Schedule local notifications with expo-notifications on reminder save
6. Critical priority triggers: full-screen alert overlay + repeat notification every 2 minutes until dismissed
7. Persist all data to AsyncStorage via Zustand middleware
8. Onboarding screen requesting notification permissions
9. Works on web via react-native-web (Expo Router handles this automatically)

UI: Dark mode, clean and modern. Use Ionicons from @expo/vector-icons.

Generate the full folder structure, package.json, app.json (with web/PWA config), vercel.json, and all core screen and component files to get the project running.
```

---

*Spec version 2.0 — React Native + Expo Go + Vercel — Ready for Cursor AI*
