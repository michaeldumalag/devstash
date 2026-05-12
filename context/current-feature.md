# Current Feature

## Status

Not Started

## Goals

## Notes

## History

- **Add Pro Badge to Sidebar** — Added a subtle PRO badge (ShadCN `Badge`, `outline` variant) next to the files and images item types in the sidebar. Conditional on `type.name === 'file' || 'image'`, hidden when sidebar is collapsed.
- **Audit Quick Wins** — Added userId scoping to all DB query functions with a getFirstUserId() placeholder; added DATABASE_URL runtime guard; removed 'use client' from CollectionCard; switched getItemTypesWithCounts to select with user-scoped counts; extracted ICON_MAP to src/lib/icon-map.ts; moved formatDate to utils; removed bcrypt hash console.log from seed.
