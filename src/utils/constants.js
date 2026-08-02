export const STORAGE_KEYS = {
  USERS: 'grimoire_users_db',
  CURRENT_USER: 'grimoire_current_user',
  BOOKS: 'grimoire_books_db',
  SHARE_LINKS: 'grimoire_share_links',
  VERSION_HISTORY: 'grimoire_version_history',
};

export const COLOR_THEMES = {
  midnight: {
    bgDarkest: '#07040d',
    cardBg: '#140b29',
    cardBorder: '#2b1b4d',
    accent: '#6c63ff',
    accentHover: '#5a52d5',
    textAccent: '#e8e6ff'
  },
  emerald: {
    bgDarkest: '#040d08',
    cardBg: '#0a1f18',
    cardBorder: '#173d27',
    accent: '#34d399',
    accentHover: '#25a876',
    textAccent: '#d1fae5'
  },
  sand: {
    bgDarkest: '#0d0603',
    cardBg: '#1f1508',
    cardBorder: '#3b2010',
    accent: '#c9a96e',
    accentHover: '#b89660',
    textAccent: '#faefd8'
  },
  'dark-academia': {
    bgDarkest: '#0d0603',
    cardBg: '#1f1508',
    cardBorder: '#3b2010',
    accent: '#c9a96e',
    accentHover: '#b89660',
    textAccent: '#faefd8'
  },
  royal: {
    bgDarkest: '#090207',
    cardBg: '#160a30',
    cardBorder: '#361654',
    accent: '#9f7aea',
    accentHover: '#7c5ec0',
    textAccent: '#ede9fe'
  },
  obsidian: {
    bgDarkest: '#090909',
    cardBg: '#141414',
    cardBorder: '#333333',
    accent: '#b0b0b0',
    accentHover: '#808080',
    textAccent: '#f4f4f4'
  }
};

export const THEME_ACCENTS = {
  midnight:        '#6c63ff',
  sand:            '#c9a96e',
  emerald:         '#34d399',
  obsidian:        '#a0a0a0',
  royal:           '#9f7aea',
  'dark-academia': '#c8a96e',
};

export const COVER_THEMES = {
  midnight:        { accent: '#6c63ff', glow: 'rgba(108,99,255,0.25)', text: '#e8e6ff',  sub: '#9d97e8', shine: 'rgba(108,99,255,0.12)' },
  sand:            { accent: '#c9a96e', glow: 'rgba(201,169,110,0.25)', text: '#faefd8', sub: '#b89660', shine: 'rgba(201,169,110,0.10)' },
  emerald:         { accent: '#34d399', glow: 'rgba(52,211,153,0.20)',  text: '#d1fae5', sub: '#25a876', shine: 'rgba(52,211,153,0.08)'  },
  obsidian:        { accent: '#b0b0b0', glow: 'rgba(176,176,176,0.15)', text: '#f4f4f4', sub: '#808080', shine: 'rgba(176,176,176,0.07)' },
  royal:           { accent: '#9f7aea', glow: 'rgba(159,122,234,0.25)', text: '#ede9fe', sub: '#7c5ec0', shine: 'rgba(159,122,234,0.12)' },
  'dark-academia': { accent: '#c8a96e', glow: 'rgba(200,169,110,0.25)', text: '#faefd8', sub: '#a88650', shine: 'rgba(200,169,110,0.10)' },
};

export const DEFAULT_JOURNAL_TITLE = "My Journal";
export const DEFAULT_JOURNAL_SUBTITLE = "A Commonplace Journal";

export const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot',
  GUEST_WELCOME: 'guest_welcome',
};
