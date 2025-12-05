# Rehber360 - AI-Powered Guidance System

## Overview
Rehber360 is an AI-powered comprehensive guidance system designed for school counselors in Turkey. Its primary purpose is to assist with student tracking, analysis, risk prediction, intervention planning, and parent communication. The project aims to revolutionize guidance counseling by providing intelligent tools to support educators in fostering student well-being and academic success.

## User Preferences
I prefer simple language and clear explanations. I want iterative development, with frequent updates and visible progress. Please ask for my approval before making any major architectural changes or refactoring large portions of the codebase. I value code quality, strict typing, and well-organized modules.

## Recent Changes (December 2024)

### Module Consolidation (2024-12-05)
Consolidated redundant modules for cleaner architecture:
- `exams` + `exam-management` → **exam-management** (unified exam handling)
- `standardized-profile` + `holistic-profile` → **student-profile** (complete student profiling)
- `ai-assistant` + `ai-suggestions` + `deep-analysis` → **ai-services** (unified AI capabilities)
- `enhanced-risk` + `early-warning` → **risk-management** (consolidated risk assessment)
- `analytics` + `advanced-analytics` → **analytics** (with /advanced subroutes)
- `reports` + `advanced-reports` → **reports** (with /advanced subroutes)

All API endpoints maintain backward compatibility through route aliasing in `features/index.ts`.

## System Architecture

### Backend Module Structure (Consolidated)
```
server/features/
├── Core Domain
│   └── students/              # Student management, CRUD
├── Academic Domain
│   ├── subjects/              # Subjects and topics
│   ├── progress/              # Progress tracking
│   ├── attendance/            # Attendance records
│   ├── exam-management/       # Unified exam handling (legacy + advanced)
│   ├── coaching/              # Academic goals, SMART goals
│   ├── sessions/              # Study sessions
│   └── study/                 # Study assignments
├── Student Support Domain
│   ├── special-education/     # IEP/BEP records
│   ├── behavior/              # Behavior incidents
│   ├── counseling-sessions/   # Counseling sessions
│   ├── student-profile/       # Consolidated profiles (standardized + holistic)
│   └── risk-management/       # Risk assessment + early warning
├── Communication Domain
│   ├── surveys/               # Survey management
│   ├── meeting-notes/         # Meeting notes
│   ├── documents/             # Student documents
│   └── parent-communication/  # Parent engagement
├── System Domain
│   ├── settings/              # App settings
│   ├── users/                 # User management
│   ├── schools/               # School management
│   └── backup/                # Backup functionality
├── AI Services Domain
│   └── ai-services/           # Unified AI (assistant + suggestions + analysis)
└── Analytics & Reporting
    ├── analytics/             # Basic + advanced analytics
    └── reports/               # Auto + advanced reports
```

### UI/UX Decisions
The frontend is built with React 18, utilizing Radix UI and Tailwind CSS for a modern, responsive, and accessible user interface. State management is handled by React Query and Zustand, with form validation powered by React Hook Form and Zod. The design emphasizes clear navigation, intuitive workflows, and a consistent visual language.

### Technical Implementations
The backend is a Node.js Express application written in TypeScript, following a feature-based modular organization. The system integrates a modern notification system with real-time updates, enhanced toast notifications, and a dedicated notifications page featuring animated statistics and filtering capabilities.

### Feature Specifications
- **AI-Powered Analysis**: Consolidated AI services provide comprehensive student profiling, risk assessment, psychological analysis, predictive timelines, and comparative class insights.
- **Centralized Prompt Management**: All AI prompts are managed centrally for easy updates and reuse.
- **Modern Notification System**: Features a `NotificationCenter` dropdown with real-time unread counts.
- **Robust AI Integration**: Employs an adapter pattern for AI providers (OpenAI, Gemini, Ollama).
- **Secure Authentication**: Utilizes JWT and bcrypt for user authentication.

### System Design Choices
- **Modular Architecture**: Feature-based organization with consolidated modules for reduced redundancy.
- **Database**: SQLite (better-sqlite3) for development, PostgreSQL (Neon) for production.
- **AI Philosophy**: Assistant-based approach where AI generates insights, humans make decisions.
- **Code Quality**: TypeScript strict mode, Zod validation, centralized error handling.
- **Backward Compatibility**: All legacy API endpoints maintained through route aliasing.

## External Dependencies

- **Database**: SQLite (dev), PostgreSQL/Neon (prod)
- **AI Providers**: OpenAI, Google Gemini, Ollama (local) - selectable via adapter pattern
- **Real-time Communication**: Socket.io
- **Frontend Libraries**: React, Vite, Radix UI, Tailwind CSS, React Query, Zustand, React Hook Form, Zod
- **Backend Libraries**: Express.js, Node.js, TypeScript, bcrypt, better-sqlite3