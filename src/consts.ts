import type { Site, Page, Links, Socials } from "@types"

// Global
export const SITE: Site = {
  TITLE: "Tanner Sims",
  DESCRIPTION:
    "Mathematician, computer scientist, machine learning engineer, musician, and occasional victim of a good problem. Explore my projects, writing and other work.",
  AUTHOR: "Tanner",
};

// Work Page
export const WORK: Page = {
  TITLE: "Work",
  DESCRIPTION:
    "Read about my work history, technical experience, and the kinds of problems I like solving.",
};

// Blog Page
export const BLOG: Page = {
  TITLE: "Blog",
  DESCRIPTION:
    "Read technical writing on machine learning, algorithms, mathematics, games, and whatever else has captured my attention.",
};

// Projects Page
export const PROJECTS: Page = {
  TITLE: "Projects",
  DESCRIPTION:
    "Explore recent projects in machine learning, algorithms, software tooling, games, and procedural art.",
};

// Search Page
export const SEARCH: Page = {
  TITLE: "Search",
  DESCRIPTION:
    "Search through blog posts and projects by keyword.",
};

// Links
export const LINKS: Links = [
  {
    TEXT: "Home",
    HREF: "/",
  },
  {
    TEXT: "Work",
    HREF: "/work",
  },
  {
    TEXT: "Blog",
    HREF: "/blog",
  },
  {
    TEXT: "Projects",
    HREF: "/projects",
  },
]

// Socials
export const SOCIALS: Socials = [
  {
    NAME: "Email",
    ICON: "email",
    TEXT: "tannersims@hesitantlyhuman.com",
    HREF: "mailto:tannersims@hesitantlyhuman.com",
  },
  {
    NAME: "Github",
    ICON: "github",
    TEXT: "HesitantlyHuman",
    HREF: "https://github.com/HesitantlyHuman"
  },
  {
    NAME: "LinkedIn",
    ICON: "linkedin",
    TEXT: "tanner-j-sims",
    HREF: "https://www.linkedin.com/in/tanner-j-sims/",
  },
]

