import { getCollection, type CollectionEntry } from 'astro:content';

export const docGroups = ['Start', 'Write', 'Organise', 'Share', 'Customise', 'Reference'] as const;
export type DocGroup = (typeof docGroups)[number];
export type DocEntry = CollectionEntry<'docs'>;

export async function getDocs(): Promise<DocEntry[]> {
	const all = await getCollection('docs');
	return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getDocsNav() {
	const docs = await getDocs();
	return docGroups
		.map((group) => ({ group, items: docs.filter((d) => d.data.group === group) }))
		.filter((g) => g.items.length);
}

export const docUrl = (id: string) => `/docs/${id}/`;

export const slugify = (text: string) =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s/g, '-');
