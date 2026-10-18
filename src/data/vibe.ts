// Projects for the vibe-coded gallery, grouped by the Claude model that did most of the work.
// Model eras come from the Co-Authored-By trailers in each repo; see docs/vibe-gallery.md.

export interface VibeLink {
  label: string;
  href: string;
}

export interface VibeProject {
  title: string;
  model: string;
  dates: string;
  what: string;
  // Draft placeholders until Tim writes his own.
  why: string;
  image?: string;
  imageAlt?: string;
  links: VibeLink[];
}

export interface VibeEra {
  id: string;
  model: string;
  dates: string;
  note: string;
  projects: VibeProject[];
}

export const eras: VibeEra[] = [
  {
    id: "early-claude-code",
    model: "Early Claude Code",
    dates: "Feb – Nov 2025",
    note: 'Commits from this stretch just say "Claude".',
    projects: [
      {
        title: "Peter's Games",
        model: "Claude",
        dates: "Feb 2025 – Mar 2026",
        what: "Snake for three, Flappy Bird for three, Spacewar, Orcs Must Die 2D, pirates, artillery and a racing game. Peter designs them by talking to Claude.",
        why: "DRAFT",
        links: [
          { label: "Open the arcade", href: "#" },
          { label: "GitHub", href: "https://github.com/tcgarvin/peter-games" },
        ],
      },
      {
        title: "Project Status",
        model: "Claude",
        dates: "May 2025",
        what: "A voice-first project manager. Talk to it through OpenAI's Realtime API and it drafts timeline changes for you to approve.",
        why: "DRAFT",
        links: [{ label: "GitHub", href: "https://github.com/tcgarvin/project-status" }],
      },
      {
        title: "Generals",
        model: "Claude → Sonnet 4.6",
        dates: "Jun 2025 – Mar 2026",
        what: "A WWII-style hex wargame for studying AI command hierarchies, with generals, colonels and captains as agents and full battle replays.",
        why: "DRAFT",
        links: [{ label: "Watch a replay", href: "#" }],
      },
    ],
  },
  {
    id: "opus-4-5",
    model: "Opus 4.5",
    dates: "Dec 2025 – Jan 2026",
    note: "The first time model names show up in my commits.",
    projects: [
      {
        title: "Bob's World",
        model: "Opus 4.5 → Fable 5.1",
        dates: "Jan – Sep 2026",
        what: "Six LLM settlers and one wolf on a procedurally generated island. You can watch them go about their day.",
        why: "DRAFT",
        image: "/images/vibe/bobgame.webp",
        imageAlt: "Bob's World procedural island map",
        links: [
          { label: "Watch it live", href: "https://jev-npc.tcgarvin.com" },
          { label: "GitHub", href: "https://github.com/tcgarvin/bobgame" },
        ],
      },
    ],
  },
  {
    id: "opus-4-6",
    model: "Opus 4.6 & Sonnet 4.6",
    dates: "Feb – Jun 2026",
    note: "RL Fighter went from first commit to self-play training in one weekend.",
    projects: [
      {
        title: "RL Fighter",
        model: "Opus 4.6",
        dates: "Feb 2026",
        what: "2v2 space dogfights in a batched NumPy sim, with ships trained by PPO self-play.",
        why: "DRAFT",
        links: [{ label: "GitHub", href: "https://github.com/tcgarvin/rl-fighter" }],
      },
    ],
  },
  {
    id: "opus-4-8",
    model: "Opus 4.8 & Fable 5",
    dates: "Jun – Aug 2026",
    note: "Big enough to stand up a whole platform: Vercel, Cloud Run, Supabase, CI.",
    projects: [
      {
        title: "Hex General",
        model: "Opus 4.8 → Fable 5",
        dates: "Jun – Jul 2026",
        what: "A turn-based operational wargame where both sides plan their orders, then everything executes at once.",
        why: "DRAFT",
        image: "/images/vibe/hex-general.webp",
        imageAlt: "Hex General concept art of a hex battlefield",
        links: [
          { label: "Play", href: "#" },
          { label: "GitHub", href: "https://github.com/tcgarvin/hex-general" },
        ],
      },
    ],
  },
  {
    id: "fable-5-1",
    model: "Fable 5.1",
    dates: "Sep – Oct 2026",
    note: "SpaceSim2 and Bob's World picked back up; 18BBY and the droid voices started.",
    projects: [
      {
        title: "SpaceSim2",
        model: "Claude → Fable 5.1",
        dates: "Mar 2025 – Sep 2026",
        what: "An interplanetary trade economy: planets with local markets, actors who produce and consume, and ships hauling goods along star lanes.",
        why: "DRAFT",
        image: "/images/vibe/spacesim2.webp",
        imageAlt: "SpaceSim2 galaxy view with star lanes",
        links: [{ label: "GitHub", href: "https://github.com/tcgarvin/spacesim2" }],
      },
      {
        title: "18BBY",
        model: "Fable 5.1 / Opus 5.5",
        dates: "Sep – Oct 2026",
        what: "An 18xx-style game of hyperspace commerce, set 18 years before the Battle of Yavin. Rules engine, bot playtests and a browser UI.",
        why: "DRAFT",
        image: "/images/vibe/18bby.webp",
        imageAlt: "18BBY game board showing a hyperspace map",
        links: [{ label: "Play", href: "#" }],
      },
      {
        title: "Droid Voices",
        model: "Fable 5.1",
        dates: "Sep 2026",
        what: "Procedural space-opera droid speech. Describe the intent and emotion and get chirps, whistles and trills, with no samples.",
        why: "DRAFT",
        links: [{ label: "Listen", href: "#" }],
      },
    ],
  },
  {
    id: "opus-5-5",
    model: "Opus 5.5",
    dates: "Sep 2026 – now",
    note: "439 commits in two weeks.",
    projects: [
      {
        title: "Crew",
        model: "Opus 5.5",
        dates: "Sep – Oct 2026",
        what: "A small freighter with an autonomous crew. Systems break and get fixed, cargo runs between six ports, and off watch the crew play cards and hold grudges.",
        why: "DRAFT",
        links: [
          { label: "Play", href: "#" },
          { label: "GitHub", href: "https://github.com/tcgarvin/crew" },
        ],
      },
      {
        title: "Akron Marathon Replay",
        model: "Opus 5.5",
        dates: "Sep 2026",
        what: "Every runner in the 2026 Akron Marathon, half marathon and team relay, moving around the course on their chip split times. Scrub the race clock, watch the field spread out, and find a bib.",
        why: "During the relay we could see our place in our own group, but not where we sat in the whole pack. I wanted to see that bell curve, then watch it move through the race, and it turned out to be easy to put a map under it. I had the idea just before my leg, and it was done before our last runner crossed the line, about an hour and a half later.",
        image: "/images/vibe/akron-marathon.webp",
        imageAlt: "Akron Marathon replay at 10:30, with the field strung out along the course and our relay team highlighted",
        links: [{ label: "Watch the race", href: "/vibe/akron-marathon/" }],
      },
    ],
  },
];
