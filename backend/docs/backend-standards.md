# Backend Standards

## 1. Architecture
- Keep strict layering:
  - `controller`: transport only (HTTP parsing, auth context extraction, DTO validation).
  - `service`: business rules, transactions, orchestration.
  - `repository`: data access only (queries + persistence).
- Do not place business logic in repositories.
- Keep repository outputs stable and typed; avoid leaking ORM internals (`dataValues`) outside mapping boundaries.

## 2. Contracts and Types
- Define request/response DTOs before implementation.
- Use explicit return types on public service/controller methods.
- Avoid `Promise<unknown>` in controllers; return concrete DTO arrays/objects.
- Maintain one canonical property/alias name per concept across models and queries.

## 3. Data Access
- Avoid N+1 queries; prefer selective eager-loading with explicit associations.
- Query only required columns via `attributes`.
- Use stable aliases (`as`) that match model associations exactly.
- Keep date/status filtering in SQL, not post-processing.
- For complex joins, add targeted tests validating join conditions.

## 4. Error Handling and Logging
- Never swallow exceptions.
- Replace `console.log` with `Logger` and context-rich messages.
- Throw domain/HTTP exceptions with consistent payload shape.
- Repository methods may rethrow raw errors; service layer translates to business-facing exceptions when needed.

## 5. Transactions
- Open/commit/rollback transactions in service layer only.
- Keep transaction scope minimal.
- Ensure all writes in a workflow share the same transaction object.

## 6. Validation and Security
- Validate all external inputs with DTO decorators.
- Never trust request headers/body types without conversion and validation.
- Avoid returning internal error stack traces to clients.

## 7. Testing
- Unit tests for pure domain logic/mappers.
- Integration tests for repositories and critical query joins.
- Regression tests for hierarchy traversal and report aggregation.
- Every bug fix should add at least one test that fails before and passes after.

## 8. Performance Baseline
- Add indexes for frequent filter/join keys (e.g. `unit_id`, `related_unit_id`, `date`, `report_id`, `material_id`).
- Monitor slow queries and compare plans after query changes.
- Prefer deterministic sorting and bounded result sets where possible.

## 9. Module Hardening Checklist
- No `console.log` in production paths.
- No swallowed `catch` blocks.
- No alias drift between model association names and include usage.
- Public methods have explicit return types.
- Mapper logic is deterministic and tested.

## 10. Feature Repository Rules
- Create a feature repository when:
  - A use case requires multi-table joins or query composition specific to one feature flow.
  - Read-model shaping is complex (aggregation, deduping, latest-per-group, hierarchy traversal).
  - Query performance tuning/index usage is feature-specific and should be isolated.
  - You need a stable persistence contract for one feature without leaking ORM internals.
- Do not create a feature repository when:
  - The query is a simple CRUD operation already covered by an entity repository.
  - Logic is business-only and can stay in service layer orchestration.
- Repository boundary rule:
  - Repositories return typed data contracts (DTO-like shapes) or domain-safe objects, not framework response objects.

## 11. Avoiding Service Dependencies
- Prefer orchestration in one service over service-to-service chains.
- A service should depend on:
  - repositories
  - pure utility/domain functions
  - infrastructure adapters (queue, cache, http client)
- A service should not directly depend on many peer feature services.
- If shared behavior is needed:
  - Extract pure domain logic into a shared utility/domain module.
  - Extract shared data access into a repository/helper, not another service.
  - Use events/messages for cross-feature side effects instead of direct calls.
- Dependency direction:
  - `controller -> service -> repository`
  - avoid `service -> service -> service` call graphs.
- Cycle prevention checklist:
  - No circular Nest module imports.
  - No bidirectional service injection.
  - Keep feature modules cohesive around one business capability.
