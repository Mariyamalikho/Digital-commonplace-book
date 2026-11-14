// Default journal structure for new user accounts

import { DEFAULT_JOURNAL_TITLE, DEFAULT_JOURNAL_SUBTITLE } from '../utils/constants';

// Initial Default Journal Data
export const DEFAULT_INITIAL_BOOK = {
  id: 'book-default-001',
  ownerId: 'user-guest-001',
  ownerName: 'Scholar',
  title: DEFAULT_JOURNAL_TITLE,
  subtitle: DEFAULT_JOURNAL_SUBTITLE,
  dedication: 'Dedicated to the curious minds, the late-night readers, and the seekers of ancient wisdom.',
  createdAt: new Date().toISOString(),
  cover: {
    texture: 'leather', // 'leather' | 'wood' | 'velvet' | 'canvas' | 'marbled'
    color: '#1c140e',
    pattern: 'noise',
    titleColor: '#c59b27',
    foilAccent: '#d4af37',
  },
  spreads: [
    // Spread 0: Cover & Dedication (Spread 0 is special)
    // Spread 1: Pages 1 & 2
    {
      id: 'spread-1',
      leftPage: {
        id: 'page-1',
        pageNumber: 1,
        date: '2026-07-21',
        title: 'On the Art of Commonplacing',
        content: `Commonplacing is an ancient habit of keeping a notebook into which one enters extracts, observations, quotes, and reflections.\n\n"We should hunt out the helpful pieces of teaching, and the spirited and noble sayings which are capable of immediate practical application." [Seneca, Epistulae Morales]\n\nWrite down your favorite quotes, record voice notes, upload vintage sketches, or draw freehand thoughts on these parchment pages.`,
        drawing: null, // Canvas dataURL
        media: [],
        voiceNotes: [
          {
            id: 'v-1',
            date: '2026-07-21 21:00',
            duration: 12,
            url: '' // Audio data url or sample
          }
        ],
        notes: [
          {
            id: 'note-1',
            authorId: 'editor-001',
            authorName: 'Master Editor',
            text: 'Seneca\'s Letters to Lucilius are an extraordinary source of stoic wisdom.',
            createdAt: '2026-07-21 21:05'
          }
        ]
      },
      rightPage: {
        id: 'page-2',
        pageNumber: 2,
        date: '2026-07-21',
        title: 'Reflections & Sketches',
        content: `Ideas recorded in isolation gain depth when woven together side-by-side.\n\nUse the freehand pen on the toolbar to sketch margin diagrams, or record spoken audio thoughts directly onto the parchment.\n\nYou can tear out unwanted spreads, customize your leather cover design, and invite fellow scholars to review your journal!`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      }
    },
    // Spread 2: Pages 3 & 4
    {
      id: 'spread-2',
      leftPage: {
        id: 'page-3',
        pageNumber: 3,
        date: '2026-07-22',
        title: 'Aphorisms & Quotes',
        content: `1. "The mind is not a vessel to be filled, but a fire to be kindled." [Plutarch]\n\n2. "What is written without effort is in general read without pleasure." [Samuel Johnson]\n\n3. "Books serve to show a man that those original thoughts of his aren't very new after all." [Abraham Lincoln]`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      },
      rightPage: {
        id: 'page-4',
        pageNumber: 4,
        date: '2026-07-22',
        title: 'Notes & Margins',
        content: `Add your own personal observations here. Click anywhere to begin typing on the vintage lined parchment.`,
        drawing: null,
        media: [],
        voiceNotes: [],
        notes: []
      }
    }
  ],
  members: [
    { userId: 'user-guest-001', name: 'Scholar (You)', role: 'owner', email: 'scholar@commonplace.app' }
  ]
};
