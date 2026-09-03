# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`
**Created**: [DATE]
**Status**: Draft
**Input**: User description: "$ARGUMENTS"
**Template Version**: `zuraffa-1.0`

---

## Product Context *(mandatory)*

### Product Type *(mandatory)*

[Exactly one of: `mobile-app` | `cross-platform-app` | `flutter-package` | `dart-package` | `dart-cli`]

### Platforms

[Only if `mobile-app` or `cross-platform-app`: list the target platforms — e.g., iOS, Android, macOS, web]

### Architecture Boundaries

[Which zuraffa layers this feature touches. Check all that apply:

- [ ] **Domain** — new entities, use cases, repository interfaces
- [ ] **Data** — data sources (real adapters), repository implementations, mappers
- [ ] **Presentation** — views, presenters, controllers, state

A feature that touches Data or Presentation almost always touches Domain first.]

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [Brief Title] (Priority: P1)

As a [actor], I [action] so that [value].

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: Can be fully tested by [specific action] and delivers [specific value].

**Acceptance Scenarios**:

1. **Given** [precondition], **When** [trigger], **Then** [observable outcome].
2. **Given** [precondition], **When** [trigger], **Then** [observable outcome].

### User Story 2 - [Brief Title] (Priority: P2)

[Same structure]

### Edge Cases

- [What happens when input is invalid?]
- [What happens when the network is unavailable?]
- [What happens when the adapter fails?]

---

## Architecture *(mandatory)*

### Key Entities

[List every Zorphy entity this feature introduces or modifies. Entity names are
PascalCase; fields are camelCase with Dart types. These drive phase-0 entity
orchestration — `zfa entity create` runs before any behavior is driven.]

| Entity | Fields | Purpose |
|--------|--------|---------|
| [EntityName] | `id: String`, `name: String`, `createdAt: DateTime` | [What this entity represents] |

### External Dependencies & Contracts

[List every external service, API, platform channel, or adapter this feature
needs. These drive the mock-first make path — `zfa mock create` generates
contract-conforming mocks for each declared dependency before any real
implementation exists. Each dependency MUST declare its contract shape.]

| Dependency | Type | Contract | Mock Priority |
|-----------|------|----------|---------------|
| [e.g., FirebaseAuth] | service | `signIn() -> UserSession`, `signOut() -> void` | P1 |
| [e.g., VendureAPI] | api | `getProduct(id) -> Product`, `search(q) -> List<Product>` | P1 |
| [e.g., Hive] | storage | `read(key) -> T?`, `write(key, value) -> void` | P2 |
| [e.g., Camera] | platform-channel | `scanBarcode() -> String` | P3 |

**No undeclared dependencies**: if the feature needs it, it is listed here; if it
is listed here, it gets a mock before any real implementation is attempted.

### Layer Contracts

[For each layer boundary this feature crosses, declare the interface. This is
what the TDD suite tests against — mocks conform to these contracts, real
adapters must satisfy the same shape or the suite fails.]

**Domain**:

- [Interface name and method signatures, if new domain contracts are introduced]

**Data**:

- [Datasource interfaces — what the repository layer calls, what mocks implement]

**Presentation**:

- [View contracts, presenter interfaces — only if new UI patterns are introduced]

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: [System/entity] MUST [testable behavior] — [trace: which user story / acceptance scenario]
- **FR-002**: [System/entity] MUST [testable behavior] — [trace]
- **FR-003**: [System/entity] SHOULD [testable behavior] — [trace]

[Every FR must be testable. "MUST" = the TDD suite proves it. "SHOULD" = the
suite proves it unless the architecture makes it structurally impossible (rare;
document why if so).]

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Quantitative or qualitative outcome, verifiable without implementation details]
- **SC-002**: [Outcome]

---

## Non-Negotiables *(auto-injected from constitution — VISION-aligned)*

These are inherited from the zuraffa VISION and enforced by the constitution.
They are listed here so the spec author sees them; the full text lives in
`.specify/memory/constitution.md`.

1. **Intent is the source code** (§1) — this spec is the single truth; generated code is regenerable dust
2. **The framework is the referee** (§2) — failing tests first, implementation refused until RED verified, green only on proof
3. **The manifest is a treaty** (§3) — contract drift fails the build
4. **Errors are an API** (§4) — exit protocol + `--> fix:` lines; UseCases return `Result<T, AppFailure>`
5. **Token economics** (§5) — `--json` verdicts, diff-summaries, never log walls
6. **The repo is long-term memory** (§6) — evidence committed; recovery via system commands, never hand-edits
7. **Humans review diffs of intent** (§7) — spec changes reviewed, not generated implementations
8. **Self-healing codebase** (§8) — doctor + regenerate; the diff shows only intent changes
9. **Simulation worlds first** (§9) — framework-certified mocks before real adapters; never grade your own homework
10. **Clean Architecture is physics** — domain has zero outward imports; entities are Zorphy; zfa generates all architecture

---

## Assumptions

- [Assumption about the environment, data, or user behavior]
- [Assumption]

---

## Notes

[Anything else the implementer needs to know — related features, migration
concerns, platform quirks that surfaced during specification.]
