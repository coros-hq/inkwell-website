/**
 * Single source of truth for Inkwell's colour system.
 * Tokens are HSL channels ("H S% L%") consumed as hsl(var(--token)).
 * Named themes are derived from 5 hex values; contrast is enforced here
 * and verified by scripts/check-contrast.ts.
 */

export type ThemeMode = 'light' | 'dark';

export interface Theme {
	id: string;
	label: string;
	description: string;
	mode: ThemeMode;
	bg: string;
	sidebar: string;
	accent: string;
	text: string;
	border: string;
}

export const themes: Theme[] = [
	{ id: 'midnight', label: 'Midnight', description: 'Warm dark with amber glow', mode: 'dark', bg: '#1a1714', sidebar: '#161412', accent: '#c07840', text: '#f5f4f2', border: '#2e2a26' },
	{ id: 'parchment', label: 'Parchment', description: 'Warm cream with golden ink', mode: 'light', bg: '#f8f5f0', sidebar: '#ede9e0', accent: '#b86e2a', text: '#1e1b17', border: '#e0d8cc' },
	{ id: 'ink', label: 'Ink', description: 'Deep dark with steel blue', mode: 'dark', bg: '#0e1117', sidebar: '#0b0e14', accent: '#4da3e8', text: '#e6ecf5', border: '#1c2333' },
	{ id: 'dusk', label: 'Dusk', description: 'Indigo night with soft violet', mode: 'dark', bg: '#12101e', sidebar: '#100e1a', accent: '#9b72f0', text: '#eeebfa', border: '#201d32' },
	{ id: 'forest', label: 'Forest', description: 'Deep green with sage light', mode: 'dark', bg: '#0c1410', sidebar: '#0a1110', accent: '#4db87a', text: '#e8f3ec', border: '#172519' },
	{ id: 'gruvbox', label: 'Gruvbox', description: 'Retro groove with warm earth tones', mode: 'dark', bg: '#282828', sidebar: '#1d2021', accent: '#d79921', text: '#ebdbb2', border: '#504945' },
	{ id: 'sepia', label: 'Sepia', description: 'Aged paper with terracotta', mode: 'light', bg: '#f4ebda', sidebar: '#ede2cf', accent: '#c04a1a', text: '#2a1e14', border: '#ddd1bb' },
	{ id: 'fog', label: 'Fog', description: 'Cool silver with slate blue', mode: 'light', bg: '#f4f6f9', sidebar: '#eaedf2', accent: '#2563eb', text: '#1a2030', border: '#dde2ea' },
	{ id: 'graphite', label: 'Graphite', description: 'Grayscale black & white, Notion-style', mode: 'light', bg: '#ffffff', sidebar: '#f7f7f7', accent: '#171717', text: '#171717', border: '#e6e6e6' },
	{ id: 'onyx', label: 'Onyx', description: 'Grayscale dark, Notion-style', mode: 'dark', bg: '#1a1a1a', sidebar: '#202020', accent: '#d9d9d9', text: '#e6e6e6', border: '#2e2e2e' },
];

export type Tokens = Record<string, string>;

/* ---------- colour maths ---------- */

type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => {
	const h = hex.replace('#', '');
	return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
};

const rgbToHex = ([r, g, b]: RGB) =>
	'#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

export const mix = (a: string, b: string, amount: number) => {
	const [ar, ag, ab] = hexToRgb(a);
	const [br, bg, bb] = hexToRgb(b);
	return rgbToHex([ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount]);
};

export const luminance = (hex: string) => {
	const [r, g, b] = hexToRgb(hex).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrast = (a: string, b: string) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

export const hexToHsl = (hex: string) => {
	const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	let h = 0;
	let s = 0;
	if (d) {
		s = d / (1 - Math.abs(2 * l - 1));
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const hslToHex = (hsl: string) => {
	const [h, s, l] = hsl.split(' ').map((v) => parseFloat(v));
	const sat = s / 100;
	const lig = l / 100;
	const k = (n: number) => (n + h / 30) % 12;
	const a = sat * Math.min(lig, 1 - lig);
	const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
};

/** Nudge `color` toward `target` until it reaches `min` contrast against every colour in `against`. */
const ensure = (color: string, against: string[], min: number, target: string) => {
	let out = color;
	for (let i = 0; i < 40 && against.some((bg) => contrast(out, bg) < min); i++) {
		out = mix(out, target, 0.05);
	}
	return out;
};

/* ---------- token derivation ---------- */

const toTokens = (hex: Record<string, string>, extra: Tokens = {}): Tokens => ({
	...Object.fromEntries(Object.entries(hex).map(([k, v]) => [k, hexToHsl(v)])),
	...extra,
});

export function buildTokens(t: Theme): Tokens {
	const dark = t.mode === 'dark';
	const { bg, sidebar, accent, text, border } = t;

	const surface = mix(bg, text, 0.07);
	const muted = mix(bg, text, 0.05);
	const mutedForeground = ensure(mix(bg, text, 0.55), [bg, sidebar, surface, muted], 4.8, text);
	const tagBg = mix(bg, accent, dark ? 0.2 : 0.12);
	const tagText = ensure(accent, [bg, sidebar, tagBg], 4.8, text);
	const accentForeground = [bg, text, '#ffffff', '#000000'].find((c) => contrast(c, accent) >= 4.8) ?? '#ffffff';
	const destructive = ensure(dark ? '#e66767' : '#c93a2f', [bg, sidebar], 4.8, text);

	return toTokens({
		background: bg,
		foreground: text,
		card: bg,
		'card-foreground': text,
		sidebar,
		panel: bg,
		surface,
		active: mix(bg, accent, dark ? 0.22 : 0.15),
		border,
		'border-strong': mix(border, text, 0.2),
		input: border,
		accent,
		'accent-foreground': accentForeground,
		muted,
		'muted-foreground': mutedForeground,
		tertiary: mix(bg, text, 0.4),
		'code-bg': mix(bg, text, 0.06),
		'tag-bg': tagBg,
		'tag-text': tagText,
		destructive,
	});
}

/** Chart/series colours. Not used on the marketing site yet; exposed for the app demo. */
const chartLight = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];

const decl = (tokens: Tokens) =>
	Object.entries(tokens)
		.map(([k, v]) => `--${k}:${v};`)
		.join('');

const charts = (list: string[]) => list.map((c, i) => `--chart-${i + 1}:${c};`).join('');

export const DEFAULT_THEME_ID = 'graphite';

/** All theme CSS: the default theme on :root, then every named theme via [data-theme]. */
export function themeCss(): string {
	const named = themes
		.map((t) => `[data-theme="${t.id}"]{color-scheme:${t.mode};${decl(buildTokens(t))}}`)
		.join('');
	const base = themes.find((t) => t.id === DEFAULT_THEME_ID)!;
	return `:root{color-scheme:${base.mode};--radius:0.5rem;${decl(buildTokens(base))}${charts(chartLight)}}` + named;
}
