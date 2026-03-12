import type { QueryResponse } from '../types'

export const DEMO_RESULT: QueryResponse = {
  query: "What are the biggest complaints about Notion's onboarding?",
  product: 'notion',
  overall_sentiment_positive_pct: 28,
  total_posts_analyzed: 15,
  time_range_days: 90,
  top_complaints: [
    {
      topic: 'Blank canvas / no guided onboarding',
      mention_count: 5,
      percentage: 33,
      sentiment_score: -0.7,
      example_quote:
        'I spent 2 hours watching YouTube tutorials just to build a basic task list.',
    },
    {
      topic: 'Steep learning curve vs alternatives',
      mention_count: 5,
      percentage: 33,
      sentiment_score: -0.6,
      example_quote:
        'Notion took me three weeks to get comfortable with. Most of my team went back to Trello.',
    },
    {
      topic: 'Template gallery decision paralysis',
      mention_count: 3,
      percentage: 20,
      sentiment_score: -0.5,
      example_quote:
        'I end up spending more time looking at templates than actually working.',
    },
    {
      topic: 'Mobile UX / poor offline support',
      mention_count: 3,
      percentage: 20,
      sentiment_score: -0.65,
      example_quote:
        'The mobile app is a disaster — slow, clunky, and half the desktop features are missing.',
    },
  ],
  key_findings: [
    {
      finding:
        "The #1 drop-off reason is Notion's blank canvas — new users are dropped into an empty page with no tutorial or quick win, causing abandonment within the first session.",
      supporting_sources: [
        'https://reddit.com/r/Notion/comments/seed001',
        'https://reddit.com/r/Notion/comments/seed004',
      ],
      source_label: 'r/Notion · 217 mentions',
    },
    {
      finding:
        "Template gallery causes decision paralysis — users open it and close without choosing anything, frustrated by 1000+ options with no curated 'start here' path.",
      supporting_sources: ['https://reddit.com/r/productivity/comments/seed002'],
      source_label: 'App Store · 89 reviews',
    },
    {
      finding:
        'No "quick win" in first session leads to early churn vs simpler tools like Trello or Todoist — the flexibility that power users love is a liability for new ones.',
      supporting_sources: [
        'https://reddit.com/r/productivity/comments/seed008',
        'https://news.ycombinator.com/item?id=seed005',
      ],
      source_label: 'r/productivity · 134 posts',
    },
  ],
  sources: [
    { source: 'reddit', post_count: 1100, icon: 'reddit' },
    { source: 'appstore', post_count: 312, icon: 'appstore' },
    { source: 'hackernews', post_count: 87, icon: 'hackernews' },
  ],
  generated_at: new Date().toISOString(),
}

export const DEMO_QUERIES = [
  "What are the biggest complaints about Notion's onboarding?",
  'What features are users requesting most?',
  'How does sentiment compare to Trello?',
]
