// Projects for the vibe-coded gallery, grouped by the Claude model that did most of the work.
// Model eras come from the Co-Authored-By trailers in each repo; see docs/vibe-gallery.md.

export interface VibeLink {
  label: string;
  href: string;
  // A caveat shown after the link, for live versions that may not work for everyone.
  note?: string;
}

export interface VibeProject {
  title: string;
  model: string;
  dates: string;
  // The story leads the card; projects without one yet show a placeholder.
  why?: string;
  what: string;
  // Most of these are experiments and default to "unfinished"; the rest say so, so nobody clicks
  // through expecting a polished game.
  status?: "finished" | "failed";
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
        model: "Claude, up to Opus 5.5",
        why: "When Claude Code first came out, I used it to let my kids make a bunch of games, mostly in pygame. This arcade memorializes them.",
        dates: "Feb 2025 – Oct 2026",
        what: "Ten small games Peter designed by talking to Claude: artillery, Flappy Bird for two, snake, a platformer, monster slicing, pirates, racing, Spacewar, Orcs Must Die and line infantry. Each one is ported to the browser and has its own arcade cabinet.",
        image: "/images/vibe/peters-arcade.webp",
        imageAlt: "Peter's Arcade: painted cabinets for Artillery, Flappy and Snake standing in a row",
        links: [
          { label: "Open the arcade", href: "/vibe/arcade/" },
          { label: "GitHub", href: "https://github.com/tcgarvin/peter-games" },
        ],
      },
      {
        title: "Generals",
        model: "Claude, then Opus 4.5 and Sonnet 4.6",
        dates: "Jun 2025 – Mar 2026",
        status: "failed",
        why: "I wanted to explore two things with AI: imperfect information, and hierarchical communication between AIs. The hex grid never really worked, with all sorts of weird bugs, and we had so much trouble getting the engine itself going that we barely got to the generals. It might be fun to hand this back to a future model and see what it can do.",
        what: "A WWII-style hex battle simulation meant for LLM generals: a major general and five commanders per side, each seeing only part of the field and passing orders down the chain. A Python engine writes battle logs and a Phaser app replays them.",
        image: "/images/vibe/generals.webp",
        imageAlt: "A plain green hex grid with a few red unit markers, a couple of woods and a road, and an empty Commander Log panel",
        links: [{ label: "GitHub", href: "https://github.com/tcgarvin/generals" }],
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
        model: "Opus 4.5, then Fable 5.1 + Jev",
        dates: "Jan 2026, then Sep 2026",
        why: "My son wanted a giant game, and a giant game needs a lot of NPCs. I wondered whether they could run themselves, like the LLM town simulations I'd seen, with the settlers talking to each other. It started as an experiment in how far Claude could get. When Jev came out in September 2026, this was the obvious place to try it. I never tuned it enough to work well, but Jev was fast, smart and cheap enough to run NPCs in real time, and that was pretty cool.",
        what: "Six LLM settlers and one wolf on a procedurally generated island. Each settler has a daily planner, a second planner that runs all day and handles speech, and Jev for moment-to-moment activity.",
        image: "/images/vibe/bobgame.webp",
        imageAlt: "Bob's World viewer with the settler Esme selected, showing her planner's thoughts and her plan for the day",
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
        why: "I worked as a data scientist from 2018 until ChatGPT came out, and reinforcement learning was something I never got to play with as much as I wanted. This was just to scratch that itch. Someday it'll probably end up as one of Peter's games.",
        what: "2v2 space dogfights in a batched NumPy sim. All four ships share one policy, trained by PPO self-play, and a pygame viewer replays the matches.",
        image: "/images/vibe/rl-fighter.webp",
        imageAlt: "The pygame match viewer: blue and red ships with health bars inside a circular arena, and each ship's loadout and hit points listed at the top",
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
        model: "Opus 4.8, then Fable 5",
        dates: "Jun – Jul 2026",
        why: "Civil War General, itself built on Panzer General, was one of my favorite games as a kid. I wanted to see whether Claude could do more than write a game like that: could it also make the art, in a disciplined way? It started with Opus 4.8 and PixelLab, an image generator that specializes in pixel art. Then Fable 5 came out, and this is the project where things Opus couldn't work out on its own, Fable started working out. It built a pipeline that paints terrain tiles to match the concept art, checks them automatically and has me pick the winners. It's definitely unfinished, and I don't know if I'll go back to it.",
        what: "A turn-based hex wargame where both sides plan their orders, then everything executes at once. Painted terrain tiles, a computer opponent and a replay of every turn.",
        image: "/images/vibe/hex-general.webp",
        imageAlt: "A Hex General board: painted grass, hills and woods, blue and red infantry and tanks facing off across a road, with fog of war dimming the hexes out of sight",
        links: [
          { label: "Try it", href: "https://hex-general.vercel.app/", note: "Google sign-in; may not let you in" },
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
        image: "/images/vibe/spacesim2.webp",
        imageAlt: "SpaceSim2 galaxy view with star lanes",
        links: [{ label: "GitHub", href: "https://github.com/tcgarvin/spacesim2" }],
      },
      {
        title: "18BBY",
        model: "Fable 5.1, then Opus 5.5",
        dates: "Sep – Oct 2026",
        why: "The curse of 18xx games is that there are so many versions, and playing one makes you want to make one. After a recent game I thought a Star Wars version would be cool, with hyperspace lanes instead of railroads, so we vibed it up quickly. Claude built the game and then playtested it with bots, though I'm not yet sure how well that worked. It's playable, but certainly not balanced, and probably not fun yet. I'd like to go back to it.",
        what: "An 18xx-style game of hyperspace commerce, set 18 years before the Battle of Yavin. Corporations chart a shared hyperspace network and earn revenue by pairing the planets they can reach. Hotseat play in the browser.",
        image: "/images/vibe/18bby.webp",
        imageAlt: "18BBY game board showing a hyperspace map",
        links: [
          { label: "Play", href: "https://18bby.tcgarvin.com/" },
          { label: "GitHub", href: "https://github.com/tcgarvin/18bby" },
        ],
      },
      {
        title: "Droid Voices",
        model: "Fable 5.1",
        dates: "Sep 2026",
        why: "I'm excited about the Microduck, a tiny two-legged robot from Pollen Robotics, and I'm expecting one on my doorstep in December or January. Customizing it is kind of the point, so I've started exploring how. This is the first experiment: a voice for it.",
        what: "Procedural space-opera droid speech. Describe the intent and emotion, or type a line and a small LLM picks them, and get chirps, whistles and trills with no samples. The same request always makes the same sound, with timing a robot can move to.",
        image: "/images/vibe/droid-voices.webp",
        imageAlt: "Lines like \"Look what I found!\" and \"Careful, I'm picking up something odd.\" with play buttons and colored timelines of the chirps and whistles each one became",
        links: [
          { label: "Listen", href: "/vibe/droid-voices/" },
          { label: "GitHub", href: "https://github.com/tcgarvin/q4ck" },
        ],
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
        why: "Opus 5.5 was doing so well that I started thinking about games I'd written off as too ambitious to vibe-code. One I've always wanted puts you on the throne, making one decision at a time and watching it ripple through the world. Reigns does that beautifully, but under its storytelling the simulation is just four sliders. Crew keeps Reigns' two-choice cards and puts a much deeper simulation underneath. Opus wrote the code, and a very small LLM narrates, making up the story as it goes. It doesn't work very well yet, but it's interesting to watch sometimes.",
        what: "You're the captain of a small freighter. The crew run themselves: systems break and get fixed, cargo moves between six ports, and off watch the crew play cards and hold grudges. People bring you decisions, and you answer each with one of two choices.",
        image: "/images/vibe/crew.webp",
        imageAlt: "A dispatcher offers a freight job on a decision card, with Take the job and Pass on it as the two choices, over a dimmed plan of the ship",
        links: [
          { label: "Play", href: "https://crew-neon-omega.vercel.app/" },
          { label: "GitHub", href: "https://github.com/tcgarvin/crew" },
        ],
      },
      {
        title: "Akron Marathon Replay",
        model: "Opus 5.5",
        status: "finished",
        dates: "Sep 2026",
        what: "Every runner in the 2026 Akron Marathon, half marathon and team relay, moving around the course on their chip split times. Scrub the race clock, watch the field spread out, and find a bib.",
        why: "During the relay we could see our place in our own group, but not where we sat in the whole pack. I wanted to see that bell curve, then watch it move through the race, and it turned out to be easy to put a map under it. I had the idea just before my leg, and it was done before our last runner crossed the line, about an hour and a half later.",
        image: "/images/vibe/akron-marathon.webp",
        imageAlt: "Akron Marathon replay at 10:30, with the field strung out along the course and our relay team highlighted",
        links: [
          { label: "Watch the race", href: "/vibe/akron-marathon/" },
          { label: "GitHub", href: "https://github.com/tcgarvin/akron-marathon" },
        ],
      },
    ],
  },
];
