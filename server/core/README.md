# Core Layer

## Purpose
Merkezi core layer'lar - shared infrastructure ve utilities.

## Structure

### `/ai`
AI-related services ve utilities'in merkezi erişimi.

**Usage:**
```typescript
// Instead of multiple imports:
import { AIProviderService } from '../../services/ai-provider.service.js';
import { AICostTracker } from '../../services/ai-cost-tracker.service.js';
import { AIErrorHandlerService } from '../../services/ai-error-handler.service.js';

// Use:
import { AIProviderService, AICostTracker, AIErrorHandlerService } from '../../core/ai/index.js';

// Or use convenience API:
import { AICore } from '../../core/ai/index.js';
const provider = AICore.getProvider();
const costs = AICore.getCostTracker();
```

### AI Services Included
- **AIProviderService** - Provider management (OpenAI, Gemini, Ollama)
- **AICacheService** - Response caching
- **AICostTracker** - Usage cost tracking
- **AIErrorHandlerService** - Centralized error handling
- **AIContextRouter** - Task-based model selection
- **AIHealthMonitor** - Provider health monitoring
- **AIProfileAnalyzerService** - Student profile analysis
- **AISessionAnalyzerService** - Session analysis
- **CounselorPrompts** - Centralized prompt templates

## Adding New AI Services

1. Create service in `server/services/`
2. Export from `server/core/ai/index.ts`
3. Use via centralized imports

## Migration

Services are being gradually moved to this centralized export pattern. Old direct imports still work but new code should use `server/core/ai/index.ts`.
