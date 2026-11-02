// Everything that changes per wedding lives here. Swap these values to reuse the site.

export interface WeddingEvent {
  id: string
  time: string
  title: string
  venue: string
  address: string
  mapQuery: string
  note?: string
}

export const wedding = {
  couple: {
    first: 'Abigail',
    second: 'Praise',
    firstFull: 'Abigail Yakubu',
    secondFull: 'Praise Olamide Adeleke',
    monogram: 'A&P',
  },
  hosts: {
    familyA: ['Late Mr. Yakubu Ganai', '& Mrs. Yakubu'],
    familyB: ['Pastor & Pastor Mrs. Adeleke'],
  },
  invitationLine: 'Cordially invite you to the joining of their children',

  // Nigeria is UTC+1 all year, so the countdown targets 10:00 AM local time.
  dateISO: '2026-12-05T10:00:00+01:00',
  dateLabel: 'Saturday, 5th December 2026',
  dateNumeric: '05 · 12 · 26',
  timeLabel: '10:00 AM Prompt',

  events: [
    {
      id: 'ceremony',
      time: '10:00 AM',
      title: 'The Joining',
      venue: 'House of Vessels',
      address: 'Opp. Mathis Plaza, off Yakowa Rd, Beside Triple A Homes, Janruwa',
      mapQuery: 'House of Vessels, Yakowa Road, Janruwa, Kaduna, Nigeria',
      note: '10:00 AM prompt',
    },
    {
      id: 'reception',
      time: '2:00 PM',
      title: 'Reception',
      venue: 'Kadwell School Barnawa',
      address: '16/17 Uganda Road, Barnawa, Kaduna South, Kaduna, Nigeria',
      mapQuery: 'Kadwell School Barnawa, 16/17 Uganda Road, Kaduna, Nigeria',
      note: 'By 2:00 PM prompt',
    },
  ] satisfies WeddingEvent[],

  colours: [
    { name: 'White', hex: '#ffffff' },
    { name: 'Gold', hex: '#c9a24a' },
    { name: 'Navy Blue', hex: '#1f2f7a' },
    { name: 'Purple', hex: '#4b1d63' },
  ],

  rsvp: {
    maxGuests: 5,
    phones: ['08037040833', '07066605294', '07032313798', '08027887113'],
  },

  music: '/audio/everything-is-perfect.mp3',
}

export type Wedding = typeof wedding

/** Backend URL (Google Apps Script web app). Empty = local demo mode, stored in this browser. */
export const API_URL: string = import.meta.env.VITE_API_URL ?? ''
