export type SeriesStatus = "active" | "planned" | "support";

/** Display labels for status badges; narrow key type so a new status
 * cannot silently render an empty badge. */
export const SERIES_STATUS_LABEL: Record<SeriesStatus, string> = {
  active: "Active",
  planned: "Planned",
  support: "Support",
};

export interface SeriesInfo {
  /** URL slug, referenced by post frontmatter `series` field */
  slug: string;
  title: string;
  /** 1-2 sentences, used on hub pages and meta descriptions */
  description: string;
  status: SeriesStatus;
  /** The funnel question that opens the series */
  bigQuestion: string;
  /** Working titles not yet published, shown as "coming" on the hub page */
  plannedTitles?: string[];
}

/**
 * Pillar registry — single source of truth for series metadata.
 * Content strategy lives in docs/website-content-sdd.md; update order on
 * changes: SDD → this registry → src/content/pages/roadmap.md.
 */
export const SERIES: SeriesInfo[] = [
  {
    slug: "message-systems",
    title: "Message Systems",
    description:
      "How major messengers load, store, and sync messages — benchmarked against my own Message Cursor Engine, with the numbers published.",
    status: "active",
    bigQuestion:
      "How do Messenger and Telegram load thousands of messages almost instantly?",
    plannedTitles: [
      "How Do Messenger and Telegram Load Thousands of Messages Almost Instantly?",
      "Inside My Message Cursor Engine: How It Works",
      "Why My Chat Was Still Slow — Even With a Local Database",
      "Cursor Pagination for Chat: Offset vs Keyset vs Snapshot",
      "Benchmarking My Chat-Open Time Against Telegram: Method and Results",
      "What I Changed to Cut Chat-Open Time",
    ],
  },
  {
    slug: "mobile-architecture",
    title: "Mobile Architecture",
    description:
      "Architecture as a response to real problems: how mobile apps evolve from MVP to millions of users, and which layers earn their place.",
    status: "active",
    bigQuestion:
      "From MVP to millions of users: how does mobile architecture actually change?",
    plannedTitles: [
      "Dissecting My Own Chat Engine: Which Layers Paid Rent, Which Were Furniture",
      "Change-Cost A/B: The Same Change in a Layered and a Non-Layered Codebase",
    ],
  },
  {
    slug: "e2ee",
    title: "E2EE",
    description:
      "How WhatsApp, Signal, Messenger and Telegram actually encrypt messages — keys, multi-device sync, and what E2EE does to a message system's architecture.",
    status: "planned",
    bigQuestion:
      "WhatsApp, Signal, Messenger, Telegram: how do they really encrypt your messages?",
  },
  {
    slug: "mobile-performance",
    title: "Mobile Performance",
    description:
      "What actually determines a mobile app's time-to-interactive — measured, not assumed. Framework choice is only one line item.",
    status: "active",
    bigQuestion:
      "Flutter, React Native or Native: is the framework really why your app is slow?",
  },
  {
    slug: "realtime",
    title: "Realtime",
    description:
      "How events reach a mobile app — WebSocket, MQTT, SSE and push — and the delivery architecture (ordering, retries, gap recovery) that makes a realtime channel trustworthy.",
    status: "active",
    bigQuestion:
      "My app needs realtime: WebSocket, MQTT, SSE or push — which channel should I choose?",
  },
  {
    slug: "building-heydai",
    title: "Building HeyDai",
    description:
      "The meta-series: every technical choice behind this site, justified by what it needs — not by what's trendy.",
    status: "support",
    bigQuestion:
      "I didn't choose Astro because it's the best. I chose what HeyDai needs.",
  },
];

export const getSeries = (slug: string): SeriesInfo | undefined =>
  SERIES.find(s => s.slug === slug);
