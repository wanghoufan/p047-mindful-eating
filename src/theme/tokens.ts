export type Scheme = 'light' | 'dark';

export type ColorTokens = {
  bg: string;
  panel: string;
  panel2: string;
  fg: string;
  muted: string;
  stroke: string;
  accent: string;
  accent2: string;
  glow: string;
  onAccent: string;
  danger: string;
};

// C「慢食刻 / BiteTempo」：深灰 / 墨绿 / 薄荷绿。深色为设计基准，浅色为同视觉适配。
export const C_DARK: ColorTokens = {
  bg: '#0b1014',
  panel: '#172127',
  panel2: '#1b2a32',
  fg: '#ecfbf6',
  muted: '#9db0ad',
  stroke: 'rgba(113,150,158,0.23)',
  accent: '#94e8cf',
  accent2: '#72b4a3',
  glow: 'rgba(76,245,191,0.20)',
  onAccent: '#0a2827',
  danger: '#ff8f7a',
};

export const C_LIGHT: ColorTokens = {
  bg: '#f2f7f5',
  panel: '#ffffff',
  panel2: '#e8f1ee',
  fg: '#0a1a16',
  muted: '#5b6b67',
  stroke: 'rgba(20,60,52,0.14)',
  accent: '#1f9d84',
  accent2: '#17816c',
  glow: 'rgba(31,157,132,0.16)',
  onAccent: '#ffffff',
  danger: '#c0432f',
};

export function tokensFor(scheme: Scheme): ColorTokens {
  return scheme === 'dark' ? C_DARK : C_LIGHT;
}

export const Radius = {
  card: 9,
  control: 7,
  pill: 7,
  sheet: 16,
} as const;

export const FontSize = {
  timer: 63,
  heading: 24,
  title: 20,
  body: 14,
  small: 12,
  tiny: 11,
} as const;

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
