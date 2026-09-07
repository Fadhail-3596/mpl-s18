import { Team, TeamId } from '../types';

export const TEAMS: Record<TeamId, Team> = {
  ae: {
    id: 'ae',
    name: 'ALTER EGO ESPORTS',
    shortName: 'AE',
    primaryColor: '#ef4444', // Red / Crimson
    secondaryColor: '#1e1b1e',
    accentColor: '#f87171',
    logo: '/teams/ae.svg',
    rating: 1500
  },
  btr: {
    id: 'btr',
    name: 'BIGETRON BY VIT',
    shortName: 'BTR',
    primaryColor: '#e11d48', // Vibrant Red
    secondaryColor: '#ffffff',
    accentColor: '#fb7185',
    logo: '/teams/btr.svg',
    rating: 1500
  },
  dewa: {
    id: 'dewa',
    name: 'DEWA UNITED',
    shortName: 'DEWA',
    primaryColor: '#eab308', // Gold / Amber
    secondaryColor: '#000000',
    accentColor: '#fde047',
    logo: '/teams/dewa.svg',
    rating: 1500
  },
  evos: {
    id: 'evos',
    name: 'EVOS',
    shortName: 'EVOS',
    primaryColor: '#0ea5e9', // Sky Blue / Cyan
    secondaryColor: '#0369a1',
    accentColor: '#38bdf8',
    logo: '/teams/evos.svg',
    rating: 1500
  },
  geek: {
    id: 'geek',
    name: 'GEEK FAM',
    shortName: 'GEEK',
    primaryColor: '#dc2626', // Deep Red / Charcoal
    secondaryColor: '#171717',
    accentColor: '#fca5a5',
    logo: '/teams/geek.svg',
    rating: 1500
  },
  navi: {
    id: 'navi',
    name: 'NAVI',
    shortName: 'NAVI',
    primaryColor: '#facc15', // Bright Yellow
    secondaryColor: '#18181b',
    accentColor: '#fef08a',
    logo: '/teams/navi.svg',
    rating: 1500
  },
  onic: {
    id: 'onic',
    name: 'ONIC',
    shortName: 'ONIC',
    primaryColor: '#eab308', // Sonic Yellow / Gold
    secondaryColor: '#0f172a',
    accentColor: '#facc15',
    logo: '/teams/onic.svg',
    rating: 1500
  },
  rrq: {
    id: 'rrq',
    name: 'RRQ HOSHI',
    shortName: 'RRQ',
    primaryColor: '#f97316', // King Orange / Gold
    secondaryColor: '#7c2d12',
    accentColor: '#fb923c',
    logo: '/teams/rrq.svg',
    rating: 1500
  },
  tlid: {
    id: 'tlid',
    name: 'TEAM LIQUID ID',
    shortName: 'TLID',
    primaryColor: '#3b82f6', // Liquid Royal Blue
    secondaryColor: '#0284c7',
    accentColor: '#60a5fa',
    logo: '/teams/tlid.svg',
    rating: 1500
  }
};

export const TEAMS_LIST: Team[] = Object.values(TEAMS);

export function getTeam(id: TeamId | string): Team {
  return TEAMS[id as TeamId] || {
    id: id as TeamId,
    name: id.toUpperCase(),
    shortName: id.toUpperCase(),
    primaryColor: '#64748b',
    secondaryColor: '#334155',
    accentColor: '#94a3b8',
    logo: ''
  };
}
