# Data Export Feature — Design Spec
**Date:** 2026-06-20  
**Status:** Approved → Implementation

---

## Goal

Allow the user to download a complete snapshot of all SoulTracker localStorage data
as a single JSON file. Primary use: manual backup + Phase 5 suggestion-engine seed data.

---

## Scope

Export-only. No import, no date filtering, no selective stores. Purely additive — zero
changes to existing stores or persistence logic.

---

## Storage Keys Exported

All five Zustand persist keys, always:

| Store key | Zustand slice |
|---|---|
| `soultrack-user-storage` | name, faithMode setting |
| `soultrack-scheduler-storage` | tasks, recurringTasks, routineBlocks, exceptions |
| `soultrack-habit-storage` | habits + completedDates |
| `soultrack-log-storage` | morning/evening check-in logs |
| `soultrack-goal-storage` | goals |

---

## Output Shape

```json
{
  "exportedAt": "2026-06-20T14:30:00.000Z",
  "appVersion": "0.1",
  "stores": {
    "user":      { /* raw Zustand persisted state */ },
    "scheduler": { /* tasks, recurringTasks, routineBlocks, exceptions */ },
    "habits":    { /* habits array */ },
    "logs":      { /* check-in logs */ },
    "goals":     { /* goals array */ }
  }
}
```

Null/malformed keys: that store key is set to `null` in the output; a `console.warn`
is emitted so real breakage is visible. Missing data is not an error (user may not
have used that feature yet).

---

## Filename

`soultracker-export-YYYY-MM-DD.json` using the date at export time.

---

## Download Strategy

1. Build `File` object from JSON blob
2. If `navigator.canShare({ files: [file] })` → `navigator.share(...)` (iOS/Android
   native share sheet). On `AbortError` (user cancelled), do nothing. On any other
   error, fall back to step 3.
3. Blob URL + synthetic `<a download>` click (desktop fallback). Revoke URL after
   10 s to avoid memory leak.

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/exportData.js` | New — `exportAllData()` utility |
| `src/pages/Settings.jsx` | Add "Data" section with Export button |

---

## UI Placement

Settings page, new "Data" section between "Experience" and the danger zone
("Reset Data"). Uses `<Button variant="primary">` (neutral, not red). Includes
a brief helper line: "Download a backup of all your tasks, habits, and logs."
