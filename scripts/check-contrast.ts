// Run: node scripts/check-contrast.ts
import { themes, buildTokens, contrast, hslToHex, type Tokens } from '../src/lib/themes.ts';

const sets: [string, Tokens][] = [
	...themes.map((t) => [t.id, buildTokens(t)] as [string, Tokens]),
];

// [foreground token, background token, minimum]
const pairs: [string, string, number][] = [
	['foreground', 'background', 4.5],
	['foreground', 'surface', 4.5],
	['foreground', 'sidebar', 4.5],
	['card-foreground', 'card', 4.5],
	['muted-foreground', 'background', 4.5],
	['muted-foreground', 'sidebar', 4.5],
	['muted-foreground', 'surface', 4.5],
	['accent-foreground', 'accent', 4.5],
	['tag-text', 'tag-bg', 4.5],
	['tag-text', 'background', 4.5],
	['destructive', 'background', 4.5],
];

let failures = 0;
for (const [name, tokens] of sets) {
	const bad = pairs
		.map(([fg, bg, min]) => ({ fg, bg, min, ratio: contrast(hslToHex(tokens[fg]), hslToHex(tokens[bg])) }))
		.filter((p) => p.ratio < p.min);
	failures += bad.length;
	const worst = Math.min(...pairs.map(([fg, bg]) => contrast(hslToHex(tokens[fg]), hslToHex(tokens[bg]))));
	console.log(`${bad.length ? 'FAIL' : 'ok  '} ${name.padEnd(14)} lowest ratio ${worst.toFixed(2)}`);
	for (const b of bad) console.log(`       ${b.fg} on ${b.bg}: ${b.ratio.toFixed(2)} (< ${b.min})`);
}
process.exit(failures ? 1 : 0);
