---
description: "Verify the project is zuraffa-conformant: template, constitution, zfa binary, and TDD wiring"
---

# Zuraffa Conformance Check

Verify this project is a zuraffa-conformant machine. Run each check, report
pass/fail, and name the fix for any failure. This command never modifies
anything — it only checks and reports.

## Checks

### 1. Template resolution

```bash
specify preset resolve spec-template
```

PASS: resolves from `.specify/extensions/zuraffa/templates/spec-template.md`.
FAIL: resolves from core or elsewhere → fix: `specify extension add --dev <path-to-speckit-extensions>/zuraffa`

### 2. Template version pin

Read the resolved template. PASS: contains `**Template Version**: \`zuraffa-`
FAIL: no version marker → the template was overridden by a higher-priority
layer; find and remove the override.

### 3. Constitution principles

```bash
grep -c "Zuraffa Framework Principles" .specify/memory/constitution.md
```

PASS: 1 or more. FAIL: 0 → fix: run `/skill:speckit-zuraffa-constitution`

### 4. zfa binary

```bash
zfa --version
```

PASS: prints a version. FAIL: not on PATH → fix: `dart pub global activate --source path <zuraffa-source>`

### 5. Project wiring

PASS: `.zfa.json` exists in the project root.
FAIL: absent → fix: `zfa setup` was not run; this project is not zuraffa-bootstrapped.

### 6. TDD profile is zfa-wired

Read `.specify/memory/tdd-profile.md`. PASS: references `zfa tdd` commands
(e.g., `zfa tdd run`, `zfa tdd verify-red`). FAIL: references raw
dart/flutter commands only → fix: re-run TDD setup with the zuraffa extension
installed so the profile records zfa as the engine.

### 7. Spec conformance (if a spec exists)

Read `specs/<latest>/spec.md`. PASS: contains `**Template Version**:
\`zuraffa-` in the header and the Architecture section with Key Entities and
External Dependencies tables. FAIL: authored from a different template →
re-author via `/skill:speckit-specify`.

## Report

Output a table: check number, name, PASS/FAIL, fix (if fail). End with the
overall verdict: `zuraffa-conformant` or `n issues found` with the numbered
fix list.
