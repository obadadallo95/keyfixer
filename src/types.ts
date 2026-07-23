/**
 * @file types.ts
 * @description Global type definitions for KeyFixer Web App, Chrome Extension, and i18n.
 */

export type UILanguage = 'en' | 'ar';
export type AppTheme = 'light' | 'dark' | 'system';
export type ActiveTab = 'app' | 'extension' | 'desktop' | 'architecture' | 'developer';

export interface DeveloperProfileInfo {
  name: string;
  arabicName: string;
  role: string;
  portfolio: string;
  linkedin: string;
  github: string;
  donation: string;
  githubSponsors: string;
  bio: string;
  location: string;
  avatarUrl: string;
}

export const DEVELOPER_PROFILE: DeveloperProfileInfo = {
  name: 'Obada Dallo',
  arabicName: 'عبادة دللو',
  role: 'AI-First Product Builder',
  portfolio: 'https://obadadallo.web.app/',
  linkedin: 'https://www.linkedin.com/in/obada-dallo-777a47a9/',
  github: 'https://github.com/obadadallo95',
  donation: 'https://buymeacoffee.com/obadadallo',
  githubSponsors: 'https://github.com/sponsors/obadadallo95',
  bio: 'Passionate software engineer and product builder crafting open-source tools, high-performance web applications, and system utilities.',
  location: 'Chemnitz, Saxony, Germany',
  avatarUrl: 'https://github.com/obadadallo95.png',
};
