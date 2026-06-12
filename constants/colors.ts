/** Wireframe design tokens — mirrors global.css :root */
export const TOKENS = {
  ink: '#2c2a26',
  inkSoft: '#7a746b',
  paper: '#f6f2e9',
  card: '#fffdf8',
  line: '#d9d2c4',
  accentCoral: '#ff7a4d',
  accentGreen: '#1b4332',
  cardRadius: 24,
  success: '#1b4332',
  snooze: '#f0a73a',
} as const;

export const PRIORITY_COLORS = {
  low: '#4f9be0',
  medium: '#f0a73a',
  high: '#e8543a',
  critical: '#d6336c',
} as const;

/** @deprecated Use TOKENS — kept for gradual migration */
export const THEME = {
  background: TOKENS.paper,
  surface: TOKENS.card,
  surfaceElevated: TOKENS.card,
  border: TOKENS.line,
  textPrimary: TOKENS.ink,
  textSecondary: TOKENS.inkSoft,
  accent: TOKENS.accentGreen,
  success: TOKENS.success,
  snooze: TOKENS.snooze,
} as const;

export const PRIORITY_UI_LABELS = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
  critical: '!!',
} as const;

export const PRIORITY_FORM_LABELS = {
  low: 'Chill',
  medium: 'Normal',
  high: 'Soon',
  critical: 'Now!',
} as const;
