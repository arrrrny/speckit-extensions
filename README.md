# speckit-extensions

A monorepo of [Spec Kit](https://github.com/github/spec-kit) extensions. Each
extension is published as its own versioned GitHub release so it can be
installed independently through the Spec Kit extension catalog format.

## Layout

Each extension lives in its own top-level directory named after its `id`:

```
speckit-extensions/
├── gh-triage/              # extension id: gh-triage
│   ├── extension.yml
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── config-template.yml
│   ├── commands/
│   └── scripts/bash/
├── catalog.json            # this repo's own extension catalog
├── LICENSE
└── .github/workflows/release.yml
```

## Extensions

| Extension | Purpose | Docs |
| --- | --- | --- |
| [`gh-triage`](./gh-triage) | Batch-fetch open GitHub issues, classify as bug/feature, label, and route to the right workflow | [README](./gh-triage/README.md) |

## Install an extension

**From this catalog** — register `catalog.json` as a custom catalog source in
your project's `.specify/bundle-catalogs.yml`:

```yaml
schema_version: "1.0"
catalogs:
  - id: arrrrny-extensions
    url: https://raw.githubusercontent.com/arrrrny/speckit-extensions/main/catalog.json
    priority: 20
    install_policy: install-allowed
```

Then install by id:

```bash
specify extension install gh-triage
```

**From a checked-out copy (dev)** — useful while developing:

```bash
specify extension add --dev gh-triage
```

The `bug` extension must also be installed for `gh-triage` to work
(`gh-triage` requires `speckit.bug.*`).

## Publishing a release

Each extension is released independently. Push a tag of the form
`<extension>-v<version>` (e.g. `gh-triage-v1.0.0`); the `release.yml` workflow
builds `<extension>.zip` (containing the extension folder) and attaches it to a
GitHub release. Point the extension's `download_url` in `catalog.json` at:

```
https://github.com/arrrrny/speckit-extensions/releases/download/<extension>-v<version>/<extension>.zip
```

## Adding a new extension

1. Create a new top-level directory named after the extension `id`.
2. Add `extension.yml`, `README.md`, `CHANGELOG.md`, and the command/script
   files (see `gh-triage/` for a complete example).
3. Add a corresponding entry to `catalog.json`.
4. Tag `<id>-v<version>` to publish.

## License

MIT — see [LICENSE](./LICENSE).
