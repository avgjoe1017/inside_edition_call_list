/**
 * API Contract Versioning Strategy
 * 
 * This document outlines the approach for versioning shared contracts
 * between frontend and backend to prevent contract drift as the app grows.
 */

## Current Approach (v1)

Currently, contracts are defined in `shared/contracts.ts` using Zod schemas.
Both frontend and backend import from this single source of truth.

**Strengths:**
- Single source of truth prevents drift
- Type safety across frontend/backend boundary
- Automatic validation via `zValidator` middleware

**Limitations:**
- No explicit versioning
- Breaking changes could affect all clients simultaneously
- No mechanism for gradual rollout of API changes

---

## Recommended Versioning Strategy

### 1. Version Headers

Add API version to HTTP headers:

```typescript
// Frontend (src/lib/api.ts)
headers: {
  "X-API-Version": "1.0.0",
  "Content-Type": "application/json"
}

// Backend (middleware)
app.use(async (c, next) => {
  const clientVersion = c.req.header("X-API-Version") || "1.0.0";
  const supportedVersions = ["1.0.0", "1.1.0"];
  
  if (!supportedVersions.includes(clientVersion)) {
    return c.json({ error: "Unsupported API version" }, 400);
  }
  
  c.set("apiVersion", clientVersion);
  await next();
});
```

### 2. Versioned Contract Files

Organize contracts by major version:

```
shared/
  contracts/
    v1/
      market.ts
      alert.ts
      auth.ts
      index.ts
    v2/
      market.ts  (with breaking changes)
      alert.ts
      auth.ts
      index.ts
    index.ts  (exports current version)
```

### 3. Semantic Versioning

Follow semantic versioning for contract changes:

- **MAJOR (1.0.0 → 2.0.0)**: Breaking changes
  - Removing fields
  - Changing field types
  - Changing validation rules (stricter)
  - Renaming endpoints
  
- **MINOR (1.0.0 → 1.1.0)**: Backward-compatible additions
  - Adding optional fields
  - Adding new endpoints
  - Relaxing validation rules
  
- **PATCH (1.0.0 → 1.0.1)**: Bug fixes
  - Documentation updates
  - Internal refactoring (no API changes)

### 4. Deprecation Strategy

For breaking changes:

1. **Add new version** alongside old version
2. **Deprecate old version** with warnings in logs
3. **Set sunset date** (e.g., 90 days)
4. **Communicate to clients** via response headers
5. **Remove old version** after sunset date

```typescript
// Example: Deprecated endpoint response
{
  data: { ... },
  _meta: {
    deprecated: true,
    sunset: "2025-06-01",
    message: "Use /api/v2/markets instead",
    migration: "https://docs.example.com/migration-v2"
  }
}
```

### 5. Version Negotiation

Support multiple versions simultaneously:

```typescript
// Backend route structure
backend/src/routes/
  v1/
    market.ts
    alert.ts
  v2/
    market.ts  (breaking changes)
    alert.ts

// index.ts
app.route("/api/v1", v1Routes);
app.route("/api/v2", v2Routes);
```

### 6. Contract Testing

Add contract tests to catch breaking changes:

```typescript
// shared/contracts/__tests__/compatibility.test.ts
describe("API Contract Compatibility", () => {
  it("should maintain backward compatibility", () => {
    const v1Data = { ... };
    const v2Schema = marketSchemaV2;
    
    // v2 should accept v1 data
    expect(() => v2Schema.parse(v1Data)).not.toThrow();
  });
});
```

---

## Implementation Checklist

When contracts need versioning (not yet necessary for current scale):

- [ ] Add version header to API client
- [ ] Create versioned contract folders
- [ ] Implement version middleware
- [ ] Update documentation with versioning policy
- [ ] Set up contract compatibility tests
- [ ] Create migration guides
- [ ] Monitor API version usage in logs

---

## Current Decision (2025)

**For now, maintain the single-file approach** (`shared/contracts.ts`).

**Why:**
- App is in active development
- Single client (mobile app) with forced updates
- Breaking changes can be coordinated
- No external API consumers yet
- Simpler maintenance

**When to revisit:**
- Multiple client applications
- Public API with external consumers
- Need for gradual rollouts
- Breaking change causing pain
- Team size grows beyond tight coordination

---

## Version Tracking

Track version in package.json and expose via API:

```typescript
// Backend: GET /api/version
{
  version: "1.0.0",
  contracts: "1.0.0",
  build: "2025-01-15T10:00:00Z"
}
```

This allows clients to check compatibility before making requests.
