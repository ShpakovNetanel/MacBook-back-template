# Module Hardening Plan

## Scope
- `report`
- `unit-hierarchy`

## Report Module
- [x] Align `fetchReportsData` and `buildReportsResponse` contract.
- [x] Remove swallowed errors from repository fetch path.
- [ ] Add integration tests for comment join (`date/material/type/unit/recipient`).
- [ ] Add integration tests for latest `report_items` selection by `modified_at`.
- [ ] Add typed repository result DTO (non-ORM return shape) for read endpoints.

## Unit-Hierarchy Module
- [x] Standardize status association access (`unitStatus`).
- [x] Compute `isEmergencyUnit` transitively for full hierarchy descendants.
- [x] Remove history-style status join and use direct date-filtered status include.
- [ ] Add integration tests for emergency propagation across multi-level trees.
- [ ] Add integration tests for status resolution on both `unit` and `relatedUnit`.

## Cross-Cutting
- [x] Introduce backend standards doc (`docs/backend-standards.md`).
- [x] Remove all `console.log` from production paths in these modules.
- [x] Ensure controller methods return concrete DTO types only.
