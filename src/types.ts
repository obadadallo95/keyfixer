/**
 * @file types.ts
 * @description Global type definitions for KeyFixer Web App, Chrome Extension, and i18n.
 */

export type UILanguage = 'en' | 'ar';
export type AppTheme = 'light' | 'dark' | 'system';
export type ActiveTab = 'app' | 'extension' | 'desktop' | 'architecture' | 'developer';
export type KeyboardPlatform = 'windows' | 'mac';

export interface DeveloperProfileInfo {
  name: string;
  arabicName: string;
  role: string;
  portfolio: string;
  linkedin: string;
  github: string;
  bio: string;
  location: string;
  avatarUrl: string;
}

export const DEVELOPER_PROFILE: DeveloperProfileInfo = {
  name: 'Obada Dallo',
  arabicName: 'عبادة دللو',
  role: 'Senior Full-Stack Developer, System Architect & Extension Engineer',
  portfolio: 'https://obadadallo.web.app/',
  linkedin: 'https://www.linkedin.com/in/obada-dallo-777a47a9/',
  github: 'https://github.com/obadadallo95',
  bio: 'Passionate software engineer crafting open-source developer tools, high-performance web applications, and system utilities.',
  location: 'Global / Remote',
  avatarUrl: 'https://github.com/obadadallo95.png',
};
