# Migration Contract — <current-name> → <new-name>

**Template Version**: `zuraffa-migrate-1.0`
**Date**: <date> · **Source branch**: <branch> · **Target shape**: <package | federated plugin>

The migration is complete when every promise in this file holds. This document
is the single source of truth for the parity gates — nothing is "done" that is
not written here.

## 1. Public API census

| Symbol | Kind | Public members | Mapping decision | State after migration |
|---|---|---|---|---|
| <Symbol> | class | <members> | <re-export / facade / usecase / entity / port / broken> | <file path or "intentionally broken: reason"> |

Passthrough re-exports of dependencies: <list or none>.

## 2. Behavior census (tests are the contract)

**Baseline**: <N> passing tests across <M> files (recorded on <commit>).

| Test file | Behaviors pinned | Ports to |
|---|---|---|
| <test/...> | <behaviors> | <new path> |

### Unpinned behaviors (found during census)

| Behavior | Planned test |
|---|---|
| <behavior> | <test-list id> |

## 3. Native/platform census

| Hit | Kind (ffi/channel/asset/build-script) | Target (port + datasource / envelope + adapter) |
|---|---|---|
| <file:line> | <kind> | <target> |

## 4. Dependency census

| Dependency | Role | Zuraffa-native equivalent |
|---|---|---|
| <dep> | <role> | <equivalent or "keep"> |

## 5. Consumers

| Consumer repo | Symbols actually used | Facade promise |
|---|---|---|
| <repo> | <symbols> | <what we guarantee> |

## 6. Shape decision

**Decision**: <package | federated plugin> — because <census evidence>.

Scaffold command: <exact command> (or: in-place skeleton on branch
`zuraffa-rewrite`).

## 7. Mapping decisions

Every census symbol appears in §1 with a decision. Mapping rules applied
(service → port + usecases; streams → StreamUseCase; init/dispose → module
lifecycle; singletons → DI; errors → AppFailure; CLI → thin bin shell).

## 8. Open questions

| # | Question | Blocking | Resolution |
|---|---|---|---|
| <n> | <question> | <yes/no> | <decision + date, or empty> |

An unresolved blocking question freezes the plan phase.
