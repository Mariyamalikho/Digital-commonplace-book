export const STORAGE_KEYS = {
  USERS: 'grimoire_users_db',
  CURRENT_USER: 'grimoire_current_user',
  BOOKS: 'grimoire_books_db',
  SHARE_LINKS: 'grimoire_share_links',
  VERSION_HISTORY: 'grimoire_version_history',
};

export const COLOR_THEMES = {
  'dark-academia': {
    bgDarkest: '#0c0a08',
    cardBg: '#171410',
    cardBorder: '#2a231b',
    accent: '#c49b45',
    accentHover: '#d8af56',
    textAccent: '#faefd8'
  },
  sand: {
    bgDarkest: '#0e0b08',
    cardBg: '#1b1611',
    cardBorder: '#2e251c',
    accent: '#c49b45',
    accentHover: '#d8af56',
    textAccent: '#faefd8'
  },
  midnight: {
    bgDarkest: '#080d14',
    cardBg: '#111a24',
    cardBorder: '#203042',
    accent: '#c8a355',
    accentHover: '#dcba70',
    textAccent: '#f5ecd7'
  },
  emerald: {
    bgDarkest: '#070e0a',
    cardBg: '#111f16',
    cardBorder: '#1f3728',
    accent: '#b5a669',
    accentHover: '#c9bb7f',
    textAccent: '#f2eed9'
  },
  royal: {
    bgDarkest: '#0e070a',
    cardBg: '#1d1016',
    cardBorder: '#331d27',
    accent: '#d4959b',
    accentHover: '#e2a8ae',
    textAccent: '#fcedef'
  },
  obsidian: {
    bgDarkest: '#0a0a0b',
    cardBg: '#171719',
    cardBorder: '#2b2b2f',
    accent: '#b5b5ba',
    accentHover: '#ceced3',
    textAccent: '#f4f4f6'
  }
};

export const THEME_ACCENTS = {
  'dark-academia': '#c49b45',
  sand:            '#c49b45',
  midnight:        '#c8a355',
  emerald:         '#b5a669',
  royal:           '#d4959b',
  obsidian:        '#b5b5ba',
};

export const COVER_THEMES = {
  'dark-academia': { accent: '#c49b45', glow: 'rgba(196,155,69,0.18)', text: '#faefd8', sub: '#b5934e', shine: 'rgba(196,155,69,0.08)' },
  sand:            { accent: '#c49b45', glow: 'rgba(196,155,69,0.18)', text: '#faefd8', sub: '#b5934e', shine: 'rgba(196,155,69,0.08)' },
  midnight:        { accent: '#c8a355', glow: 'rgba(200,163,85,0.18)', text: '#f5ecd7', sub: '#b0904d', shine: 'rgba(200,163,85,0.08)' },
  emerald:         { accent: '#b5a669', glow: 'rgba(181,166,105,0.16)', text: '#f2eed9', sub: '#a0925c', shine: 'rgba(181,166,105,0.07)' },
  royal:           { accent: '#d4959b', glow: 'rgba(212,149,155,0.18)', text: '#fcedef', sub: '#be8086', shine: 'rgba(212,149,155,0.08)' },
  obsidian:        { accent: '#b5b5ba', glow: 'rgba(181,181,186,0.14)', text: '#f4f4f6', sub: '#9c9ca1', shine: 'rgba(181,181,186,0.06)' },
};

export const DEFAULT_JOURNAL_TITLE = 'My Journal';
export const DEFAULT_JOURNAL_SUBTITLE = 'A Commonplace Journal';

export const AUTH_MODES = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  FORGOT: 'forgot',
  GUEST_WELCOME: 'guest_welcome',
};
