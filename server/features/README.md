# Backend Features Architecture

This directory contains the modularized feature structure for the backend application.

## Feature Structure

Each feature module follows a standard structure to ensure consistency and maintainability:

```
server/features/<feature-name>/
├── routes/          # Express route handlers and endpoint definitions
├── services/        # Business logic and application services
├── repository/      # Data access layer and database operations
├── types/           # TypeScript type definitions and interfaces
└── index.ts         # Feature router export (aggregates all routes for the feature)
```

### Directory Responsibilities

- **routes/**: Contains Express route handler functions. Each file typically handles a related group of endpoints.
- **services/**: Contains business logic, data validation, and orchestration between multiple repositories.
- **repository/**: Contains direct database access code. All SQL queries should live here.
- **types/**: Contains TypeScript interfaces, types, and DTOs specific to this feature.
- **index.ts**: Aggregates all route handlers and exports a single Express Router for the feature.

## Migration Strategy

This is a phased migration to avoid breaking existing functionality.

### Stage 0: Scaffolding ✅ (Current)
- Create feature registry infrastructure
- Define standard structure
- Set up import paths in server/index.ts
- **No code migration yet** - all existing code remains in place

### Stage 1: Core Domain Migration
- Move core domains in this exact order:
  1. **students** - Foundation for all student-related features
  2. **surveys** - Independent survey system
  3. **progress** - Student progress tracking
- Keep backward compatibility during migration
- Test thoroughly after each feature migration

### Stage 2: Adjacent Domain Migration
- Move adjacent domains: attendance, study, meeting-notes, documents, settings, subjects
- Continue testing after each migration
- Maintain API compatibility

### Stage 3: Peripheral Router Reorganization
- Reorganize peripheral routers (already Express.Router): coaching, health, special-education, etc.
- Move to feature structure with minimal code changes
- Focus on type consolidation and shared utilities

### Stage 4: Cleanup
- Remove all legacy import structure from server/index.ts
- Delete old route files
- Reduce db-service.ts to thin compatibility layer or remove completely
- Full modularization complete

## Adding a New Feature

Follow these steps to add a new feature to the registry:

### 1. Create the feature directory structure

```bash
mkdir -p server/features/my-feature/{routes,services,repository,types}
```

### 2. Create the repository layer

```typescript
// server/features/my-feature/repository/my-feature.repository.ts
import { db } from '../../../lib/database';

export function getMyFeatures() {
  return db.prepare('SELECT * FROM my_features').all();
}

export function createMyFeature(data: any) {
  return db.prepare('INSERT INTO my_features (name) VALUES (?)').run(data.name);
}
```

### 3. Create the service layer

```typescript
// server/features/my-feature/services/my-feature.service.ts
import * as myFeatureRepo from '../repository/my-feature.repository';

export function getAllFeatures() {
  return myFeatureRepo.getMyFeatures();
}

export function createFeature(data: any) {
  // Business logic and validation here
  if (!data.name) {
    throw new Error('Name is required');
  }
  return myFeatureRepo.createMyFeature(data);
}
```

### 4. Create route handlers

```typescript
// server/features/my-feature/routes/my-feature.routes.ts
import { Request, Response } from 'express';
import * as myFeatureService from '../services/my-feature.service';

export function getMyFeaturesHandler(req: Request, res: Response) {
  try {
    const features = myFeatureService.getAllFeatures();
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get features' });
  }
}

export function createMyFeatureHandler(req: Request, res: Response) {
  try {
    const result = myFeatureService.createFeature(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### 5. Create the feature index (router)

```typescript
// server/features/my-feature/index.ts
import { Router } from 'express';
import { getMyFeaturesHandler, createMyFeatureHandler } from './routes/my-feature.routes';
import { simpleRateLimit } from '../../middleware/validation';

const myFeatureRouter = Router();

myFeatureRouter.get('/', simpleRateLimit(200, 15 * 60 * 1000), getMyFeaturesHandler);
myFeatureRouter.post('/', simpleRateLimit(50, 15 * 60 * 1000), createMyFeatureHandler);

export default myFeatureRouter;
```

### 6. Register in the feature registry

```typescript
// server/features/index.ts
import myFeatureRouter from './my-feature';

featureRegistry.use('/my-feature', myFeatureRouter);
```

## Benefits of This Structure

- **Separation of Concerns**: Clear separation between routes, business logic, and data access
- **Modularity**: Each feature is self-contained and independent
- **Maintainability**: Easier to locate and modify feature-specific code
- **Testability**: Isolated features are easier to unit test
- **Scalability**: New features can be added without affecting existing code
- **Consistency**: Standard structure across all features reduces cognitive load

## Migration Checklist

When migrating an existing feature:

- [ ] Create feature directory structure
- [ ] Move database queries to repository/
- [ ] Move business logic to services/
- [ ] Move route handlers to routes/
- [ ] Create feature-specific types in types/
- [ ] Create feature index.ts with router
- [ ] Register in feature registry
- [ ] Update tests
- [ ] Remove old route file
- [ ] Remove old import from server/index.ts
- [ ] Test thoroughly

## Current Features Status

### Migration Priority Order (Canonical Sequence)

**Phase 1 - Core Domains (Start Here):**
- [ ] **students** - Student management and academics (MIGRATE FIRST)
- [ ] **surveys** - Survey templates, distributions, and analytics (MIGRATE SECOND)
- [ ] **progress** - Student progress tracking and academic goals (MIGRATE THIRD)

**Phase 2 - Adjacent Domains:**
- [ ] **attendance** - Attendance tracking
- [ ] **study** - Study assignments and weekly slots
- [ ] **meeting-notes** - Meeting notes and parent communications
- [ ] **documents** - Student document management
- [ ] **settings** - Application settings
- [ ] **subjects** - Subjects and topics management

**Phase 3 - Peripheral Routers (Already Express.Router):**
- [ ] **coaching** - Student coaching and guidance
- [ ] **health** - Student health information
- [ ] **special-education** - Special education (BEP) plans
- [ ] **risk-assessment** - Risk evaluation and tracking
- [ ] **behavior** - Behavior tracking and incidents
- [ ] **exams** - Exam results and analysis
- [ ] **counseling-sessions** - Counseling session management
- [ ] **auth** - Authentication and session management
- [ ] **sessions** - Study session tracking


## Questions or Issues?

If you encounter any issues during migration or have questions about the architecture, please refer to this documentation or consult the team lead.
