# Vibe-coded gallery

A new page on tcgarvin.com for projects where Claude was clearly the primary tool. The story it
tells: I keep trying new things as new models come out, so cards are grouped and ordered by the
model that did most of the work.

## Decisions

- **Counts as vibe-coded:** Claude was clearly the primary tool.
- **Main layout:** vertical "model eras" timeline, a sticky model label per era, cards within it.
- **Peter's Games:** presented as an arcade shelf (its own section or page), since they're all
  arcade games.
- **Design:** stay close to the existing site (breadcrumb header, Montserrat, dark palette), built
  with Layout.astro. Subtle scroll-linked card animation (CSS `animation-timeline: view()`), never
  scroll-jacking. Page: `src/pages/vibe.astro`, data: `src/data/vibe.ts`.
  Preview: https://claude.ai/artifact/LmTgMMw1ZTSuaGr37VPFwJ
- **Each card:** what it is, why I made it, primary model, screenshots, GitHub link, and a live
  link wherever possible (Netlify under tcgarvin.com, Claude artifact, Vercel, etc.).
- **Finished, unfinished or failed:** every card is tagged, so nobody clicks through expecting a
  polished game. Unfinished is the default; set `status: "finished"` (so far: Akron) or
  `status: "failed"` (so far: Generals).

## Model timeline (from `Co-Authored-By` trailers)

| Model | First → last seen | Projects |
|---|---|---|
| Claude (unversioned) | 2025-02 → 2025-11 | peter-games, project-status, generals, spacesim2 |
| Opus 4.5 / Sonnet 4.5 | 2025-12 → 2026-01 | spacesim2, bobgame, generals |
| Opus 4.6 | 2026-02 | rl-fighter |
| Sonnet 4.6 | 2026-03 → 2026-06 | generals, peter-games, spacesim2, hex-general |
| Opus 4.8 | 2026-06 → 2026-07 | hex-general, spacesim2 |
| Fable 5 | 2026-06 → 2026-09 | hex-general, spacesim2 |
| Fable 5.1 | 2026-09 → 2026-10 | spacesim2, bobgame, 18bby, crew, q4ck/synth |
| Opus 5.5 | 2026-09 → now | crew, 18bby |

## Projects

Legend: `[ ]` todo. Per project: blurb, motivation (from Tim), model, screenshots, repo, live link.

| Project | Model era | Repo | Live? | Blurb | Motivation | Screens | Live link | On page |
|---|---|---|---|---|---|---|---|---|
| peter-games (arcade shelf) | Claude → Sonnet 4.6 | tcgarvin/peter-games | web ones: spacewar-web, dreadnoughts, superbuild | [ ] | [ ] | [ ] | [ ] | [ ] |
| project-status | Claude | tcgarvin/project-status | skipped (Tim: didn't go far; off the page) | - | - | - | - | - |
| generals | Claude → Opus 4.5 / Sonnet 4.6 | tcgarvin/generals | none (failed; repo link only) | [x] | [x] | [x] | [x] | [x] |
| game_nov_29 (QB sim) | Claude | local only | moves to Peter's Arcade (guest game) | - | - | - | - | - |
| grid | ? | local only | skipped (Tim, 2026-10-18) | - | - | - | - | - |
| bobgame | Opus 4.5 → Fable 5.1 | tcgarvin/bobgame | jev-npc.tcgarvin.com | [x] | [x] | [x] | [x] | [x] |
| rl-fighter | Opus 4.6 | tcgarvin/rl-fighter | none for now; later as one of Peter's games | [x] | [x] | [x] | [x] | [x] |
| hex-general | Opus 4.8 → Fable 5 | tcgarvin/hex-general | hex-general.vercel.app (Google sign-in) | [x] | [x] | [x] | [x] | [x] |
| spacesim2 | Claude → Fable 5.1 | tcgarvin/spacesim2 | ? | [ ] | [ ] | [ ] | [ ] | [ ] |
| akron-marathon | Opus 5.5 | tcgarvin/akron-marathon (results kept out of git) | /vibe/akron-marathon/ (names and ages removed) | [x] | [x] | [x] | [x] | [x] |
| 18bby | Fable 5.1 → Opus 5.5 | tcgarvin/18bby | 18bby.tcgarvin.com | [x] | [x] | [x] | [x] | [x] |
| crew | Opus 5.5 | tcgarvin/crew | crew-neon-omega.vercel.app | [x] | [x] | [x] | [x] | [x] |
| q4ck (synth droid voices) | Fable 5.1 | tcgarvin/q4ck (synth/; Pollen's microduck clone untracked) | /vibe/droid-voices/ (audition sheet) | [x] | [x] | [x] | [x] | [x] |

Later: fascar.

Notes:
- akron-marathon: the public copy is built with `python tools/build_runners.py --public <path>`
  in the akron-marathon repo, then copied with index.html and courses.json to
  `public/vibe/akron-marathon/`. Runners' names and ages are removed; relay team names stay.
- droid voices: `uv run --all-extras python scripts/build_audition.py OUT.html` in q4ck/synth (makes
  a few OpenRouter calls), then `scripts/split_audition.py OUT.html DIR` turns its inline WAVs into
  `clips/NNN.mp3` (15 MB → 2.5 MB); copy DIR to `public/vibe/droid-voices/`.
- peter-games arcade: ~/code/peter-games is the source of truth; `public/vibe/arcade/` is a deployed
  copy. After changing the arcade there, run `npm run sync-arcade` here, then commit and push.

## Prototypes (private artifacts)

- A, eras, light notebook: https://claude.ai/artifact/J3857jo3gUGToNfwahaK75
- B, eras, dark split-screen: https://claude.ai/artifact/J8iK2xwgTz3famdbEiqjQj
- C, Peter's Arcade: https://claude.ai/artifact/1gFQjUAac5woNrqbdKnxCe

## Plan

The page ships at /vibe with no links to it and a `noindex` tag. Each step below gets deployed as
it's done. Launch is adding the link.

### Phase 1: Foundation
- [x] Prototype designs; Tim picked "close to the existing site" + subtle scroll animation.
- [x] Build `src/pages/vibe.astro` with data in `src/data/vibe.ts`.
- [x] Ship unlinked and noindexed.

### Phase 2: One project at a time
For each project, in order:
1. Claude drafts "what it is" from the code and confirms the model from git history.
2. Tim answers a question or two about motivation; Claude turns that into the "why" line.
3. Screenshots: Claude runs the project and captures them (or Tim supplies them).
4. Live link: pick hosting (static on tcgarvin.com under `/vibe/<slug>/`, an existing Vercel
   deploy, a Claude artifact, or none), and get it working.
5. Repo: push to GitHub if it's local-only and Tim wants it public, or show no repo link.
6. Update `src/data/vibe.ts`, deploy, tick the row in the table above.

Suggested order (quick wins with live demos first):
1. [x] Akron Marathon (static page, host on tcgarvin.com)
2. [x] Bob's World (already live)
3. [x] Crew, 18BBY, Hex General (check their Vercel deploys)
4. [x] Droid Voices (audition sheet at /vibe/droid-voices/)
5. [ ] SpaceSim2 (deferred by Tim, 2026-10-18; come back later)
6. [x] Generals (marked failed; repo link only)
7. [x] RL Fighter (screenshot is random actions: local checkpoints predate the current obs size
   and the training box was unreachable; swap in a trained match later)
8. [x] Project Status (skipped by Tim, 2026-10-18; removed from the page)
9. [x] Grid (skipped by Tim, 2026-10-18; never on the page)
10. [x] Quarterback Simulator (folded into Peter's Arcade, see Phase 3)

### Phase 3: Peter's Arcade
- [x] Decide the look: full arcade style, with a painted cabinet per game.
- [x] Commit the six uncommitted games and push (2026-10-19, with arcade/; node_modules now ignored).
- [x] Host the arcade at /vibe/arcade/ (copy of peter-games/arcade without tests/, tools/, art src/ and docs).
- [x] Back up arcade/art/*/src/ as release art-originals-2026-10-19 on tcgarvin/peter-games.
- [ ] Decide on dreadnoughts, superbuild and spacewar-web (web-native, not in the arcade).
- [x] Screenshot (the lobby) on the card.
- [ ] Add Quarterback Simulator (`~/code/game_nov_29`, Nov 2025) as a guest game: a kid who had
  never used AI before made it with Tim in about one prompt.
- [x] Build the page and link it from the Peter's Games card.

### Phase 4: Launch
- [ ] Final pass on the intro copy and era notes.
- [ ] Remove `noindex`, link from the home page and/or the code page, deploy.
