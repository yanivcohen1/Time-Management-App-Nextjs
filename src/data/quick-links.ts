export const QUICK_LINKS = {
  "1": {
    title: "Sprint kickoff checklist",
    description: "Prep stories, confirm owners, and align sprint goals.",
  },
  "2": {
    title: "Handoff summary",
    description: "Gather context, blockers, and deliverables before handoff.",
  },
  "3": {
    title: "Retrospective notes",
    description: "Capture wins, pain points, and experiments for the next cycle.",
  },
} as const;

export type QuickLinkId = keyof typeof QUICK_LINKS;

export function getQuickLink(id: string) {
  return QUICK_LINKS[id as QuickLinkId] ?? null;
}
