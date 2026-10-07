import type { APIRoute } from 'astro';
import { getDocs, docUrl, slugify } from '../../lib/docs';

/** Strips MDX/markdown syntax down to searchable plain text. */
const plain = (md: string) =>
	md
		.replace(/^import .*$/gm, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/```[\w-]*\n?/g, ' ')
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[`*_>|#]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export const GET: APIRoute = async () => {
	const docs = await getDocs();
	const sections: { id: number; title: string; heading: string; url: string; text: string }[] = [];
	for (const doc of docs) {
		const [intro, ...rest] = (doc.body ?? '').split(/^## /m);
		const push = (heading: string, body: string) =>
			sections.push({
				id: sections.length,
				title: doc.data.title,
				heading,
				url: heading ? `${docUrl(doc.id)}#${slugify(heading)}` : docUrl(doc.id),
				text: plain(body),
			});
		push('', `${doc.data.description} ${intro}`);
		for (const part of rest) {
			const [headingLine, ...body] = part.split('\n');
			push(headingLine.trim().replace(/[`*]/g, ''), body.join('\n'));
		}
	}
	return new Response(JSON.stringify(sections), { headers: { 'Content-Type': 'application/json' } });
};
