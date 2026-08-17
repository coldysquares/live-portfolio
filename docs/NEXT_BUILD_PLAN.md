# ChronosAudit Build Plan

## Current completed checkpoint: Phase 0 / public-demo foundation

- [x] Lock product canon and audience.
- [x] Build a synthetic golden corpus with multiple formats.
- [x] Preserve original fixture bytes and compute real SHA-256 hashes.
- [x] Define source, assertion, event, contradiction, anomaly, and processing-run records.
- [x] Build a real event-to-evidence public interaction.
- [x] Add Method and Security pages.
- [x] Add validation and browser smoke coverage.

## Next checkpoint: harden the public product site

- [ ] Move this static proof into the final public-site repository and route structure.
- [ ] Add a portable printable case report renderer.
- [ ] Add a source/evidence index view independent of the timeline.
- [ ] Add accessible keyboard movement between event, assertion, and source location.
- [ ] Add public-safe case registry support for future demonstrations.
- [ ] Add automated visual regression at desktop and mobile widths.

## Local application shell

- [ ] Establish Tauri + Vite + React + TypeScript workspace.
- [ ] Define SQLite schema from the public fixture contracts.
- [ ] Create/open portable `.chronos/` project directories.
- [ ] Import a folder without uploading it.
- [ ] Copy or reference immutable original bytes under stable source IDs.
- [ ] Record inventory, metadata, SHA-256, warnings, and processing runs.
- [ ] Add format adapters for PDF, TXT, HTML, and EML first.

## Temporal evidence engine

- [ ] Explicit-date extraction with exact locations.
- [ ] Email-header and embedded-metadata extraction.
- [ ] Relative-date representation and review state.
- [ ] Event clustering without destroying underlying assertions.
- [ ] Contradiction and sequence-anomaly rules.
- [ ] Append-only human review receipts.

## Acceptance gate for the first convincing local product

1. A local folder can be imported without upload.
2. Every original file has a stable inventory and SHA-256 hash.
3. Explicit, metadata, relative, inferred, and unresolved dates remain distinguishable.
4. Clicking an event opens the exact supporting passage.
5. Contradictions appear together rather than being silently reconciled.
6. Reprocessing creates a new run and preserves prior receipts.
7. A structured manifest and readable report can be exported.
8. The event-to-evidence path works on desktop and mobile.

## Change control

Before any meaningful build pass, reopen `PRODUCT_CANON.md`, this plan, and the source manifest. Any change to audience, product identity, privacy boundary, authority model, or primary workflow requires an explicit checkpoint before implementation.
