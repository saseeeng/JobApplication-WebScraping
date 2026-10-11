export const siteConfig = {
  name: "Job Market Tracker",
  description:
    "Explore job market trends: listings, in-demand skills, locations and hiring companies.",
  nav: [
    { href: "/", label: "Dashboard" },
    { href: "/jobs", label: "Jobs" },
    { href: "/analytics", label: "Analytics" },
  ],
  jobsPageSize: 10,
} as const;
