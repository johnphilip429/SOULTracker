# SoulTrack Aligned → Personal Scheduler Overhaul

## Status — READ FIRST
This is an overhaul of an EXISTING repo, not a fresh build:
https://github.com/johnphilip429/SOULTracker

The repo currently has only 1 commit. Before making any changes, inspect the actual
contents of `src/` and report back what is genuinely implemented vs. what is only
described in the README — the README's feature list may be aspirational/scaffolded
rather than fully working. Do not assume any feature listed below already works until
you've verified it in the code.

## Naming
The repo/app is currently called "SoulTrack Aligned." We are NOT renaming it now.
Renaming is the deliberate LAST step, done only once the overhaul is functionally
complete. Do not suggest or apply a new name mid-build.

## Existing tech stack (confirmed from README — verify in code before relying on it)
- React (Vite)
- Tailwind CSS
- Zustand — state management + persistence (this already gives offline-first local
  storage; do NOT introduce Firebase or any other backend — keep everything local)
- Framer Motion — animations
- Recharts — already present, intended for analytics; reuse this for the Tier 1
  suggestion-engine stats later instead of adding a new charting library
- Data currently lives in browser LocalStorage. No accounts, no backend, no tracking.
- Mobile-first design

## Existing features (per README — confirm real state in code first)
- Daily Anchors (Habits) with streaks
- Morning & Evening Check-ins
- Faith Mode — optional Bible verses / spiritual prompts
- Goals Tracking
- Analytics / alignment score visualization

## What this overhaul is actually for
John (the user) wants to repurpose this app into his personal daily scheduler —
managing time across four life domains using a recurring schedule + (eventually)
AI-assisted task timing. The existing "alignment/habits/faith" features are not being
thrown away — see Integration Notes below for how they should coexist with the new
scheduler features, unless inspection of the code shows a reason to simplify.

## Who this is for
John Philip — Senior Data Engineer (office work happens elsewhere, not tracked here
in detail), also runs a gaming YouTube channel, and is building a second YouTube
channel (alternating Bible-story / tech content — separate project, not part of this
app). This app is his personal daily scheduler across all of it.

## Categories (fixed set for the scheduler feature)
1. Office — Altrata work. Treated as an opaque "busy" block, no task-level detail needed.
2. Gaming Channel — existing channel (@mighty_serpent), semi-automated editing workflow.
3. Faith/Tech Channel — new YouTube channel being built (separate project), alternating
   Bible-story and tech content. Only the task category exists here — the actual
   channel pipeline is built elsewhere.
4. Life — fitness, spiritual time, personal. NOTE: this overlaps with the app's
   existing Faith Mode / Daily Anchors features — see Integration Notes.

## New data model (scheduler layer — additive to whatever already exists)

### RoutineBlock
- category: enum (Office, Gym, GamingChannel, FaithTechChannel, Life)
- days_of_week: array (e.g. [Mon, Tue, Wed, Thu, Fri])
- start_time, end_time
- label: string (e.g. "Office — Altrata")
- color: string (hex, tied to category)

### Exception
- date
- type: enum (Leave, Shifted, Cancelled)
- routine_block_id: nullable (null = applies to entire day, not just one block)
- note: optional string
- Use case: John has flexible leave. Marking a day as Leave creates an Exception for
  that specific date, freeing the Office RoutineBlock for that day WITHOUT editing the
  recurring template.

### Task
- title
- category: same enum as RoutineBlock
- priority: color-coded
- scheduled_date, scheduled_start, scheduled_end
- recurring: bool
- completed: bool
- actual_start, actual_end: nullable, filled in when actually done — this is the field
  set that feeds the suggestion engine later (see Roadmap Phase 5/6)

All of this stores via Zustand + LocalStorage, consistent with the existing pattern —
do not introduce a different persistence mechanism for the new data.

## Important constraint
**No Google Calendar / office calendar integration.** John cannot connect his office
calendar to Google. Office hours are represented purely as a RoutineBlock inside the
app, not synced from any external source. Personal Google Calendar sync for the Life
category only might be considered far later — do not build this in early phases.

## Integration notes (existing features vs. new scheduler)
Before writing new code, decide (and confirm with John if genuinely ambiguous) whether:
- "Faith Mode" / Daily Anchors should remain a separate section of the app, or
- the Life category's RoutineBlocks/Tasks should subsume habit tracking, or
- both coexist (e.g. Daily Anchors stays as-is, scheduler is a new tab/view)
Do not silently delete existing features to make room for the scheduler.

## Build roadmap (in order — do not skip ahead)
1. Inspect actual current code state, report findings.
2. Today view + Task CRUD (new scheduler feature) — core loop, usable within days.
3. RoutineBlock + Exception support — Today view auto-populates from recurring blocks;
   Leave marking is a one-tap action creating an Exception for that date.
4. Calendar view — week/list view showing RoutineBlocks + Tasks.
5. Recurring task support.
6. Suggestion engine (Tier 1) — simple stats from logged actual_start/actual_end vs.
   scheduled times, using Recharts (already in the project). No AI call needed yet.
7. Suggestion engine (Tier 2) — once 1-2+ weeks of Task history exists, feed a compact
   summary of {category, scheduled_time, actual_time, completed} into a Claude API call
   alongside a new task description, returning a suggested time slot. This is NOT model
   training — it's context fed fresh into a prompt each time. Do not fine-tune or train
   a custom model; there isn't remotely enough data for that, and prompting gets the
   same result for far less cost/complexity.
8. Offline polish — last, after the core scheduler loop is proven useful day to day.

## Style/response preferences (apply to all code in this repo)
- Complete, production-ready code with comments, not partial snippets
- Null-safe logic throughout, especially Exception handling — a Task or RoutineBlock
  should never crash the Today view generator if data is missing
- Maintain naming conventions and continuity with whatever already exists in this repo
  — do not silently rename existing fields/components
