# Rehber360 - AI-Powered Guidance System

## Overview
Rehber360 is an AI-powered comprehensive guidance system designed for school counselors in Turkey. Its primary purpose is to assist with student tracking, analysis, risk prediction, intervention planning, and parent communication. The project aims to revolutionize guidance counseling by providing intelligent tools to support educators in fostering student well-being and academic success.

## User Preferences
I prefer simple language and clear explanations. I want iterative development, with frequent updates and visible progress. Please ask for my approval before making any major architectural changes or refactoring large portions of the codebase. I value code quality, strict typing, and well-organized modules.

## System Architecture

### UI/UX Decisions
The frontend is built with React 18, utilizing Radix UI and Tailwind CSS for a modern, responsive, and accessible user interface. State management is handled by React Query and Zustand, with form validation powered by React Hook Form and Zod. The design emphasizes clear navigation, intuitive workflows, and a consistent visual language.

### Technical Implementations
The backend is a Node.js Express application written in TypeScript, following a feature-based modular organization. It includes dedicated modules for AI assistance, counseling sessions, deep analysis, surveys, and student management. The system integrates a modern notification system with real-time updates, enhanced toast notifications, and a dedicated notifications page featuring animated statistics and filtering capabilities.

### Feature Specifications
- **AI-Powered Analysis**: Consolidates multiple AI analysis services into a unified `deep-analysis` module, providing comprehensive student profiling, risk assessment, psychological analysis, predictive timelines, and comparative class insights.
- **Centralized Prompt Management**: All AI prompts are managed centrally for easy updates and reuse, including prompts for text polishing, parent meeting preparation, intervention plans, and meeting summaries.
- **Modern Notification System**: Features a `NotificationCenter` dropdown with real-time unread counts, enhanced toast notifications for various alert types, and a dedicated notifications page with filtering and status-based tabs.
- **Robust AI Integration**: Employs an adapter pattern for AI providers (OpenAI, Gemini, Ollama), supporting various AI task types like chat, analysis, summarization, and structured output.
- **Secure Authentication**: Utilizes JWT and bcrypt for user authentication.

### System Design Choices
- **Modular Architecture**: A feature-based modular organization ensures clear separation of concerns for both frontend and backend.
- **Database**: PostgreSQL (Neon) is used as the primary database, with automatic schema migrations and rollback support.
- **AI Philosophy**: The system follows an assistant-based approach where AI generates insights and recommendations, but human counselors make final decisions.
- **Code Quality**: Emphasizes TypeScript strict mode, Zod validation for data integrity, and centralized error handling across the application.
- **Deployment**: The application is designed for deployment on Replit, supporting both development and production environments with autoscale capabilities.

## External Dependencies

- **Database**: PostgreSQL (specifically Neon for cloud hosting)
- **AI Providers**: OpenAI, Google Gemini, Ollama (local) - selectable via adapter pattern
- **Real-time Communication**: Socket.io
- **Frontend Libraries**: React, Vite, Radix UI, Tailwind CSS, React Query, Zustand, React Hook Form, Zod
- **Backend Libraries**: Express.js, Node.js, TypeScript, bcrypt