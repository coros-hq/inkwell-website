import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docGroups } from './lib/docs';

const docs = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
	schema: z.object({
		title: z.string(),
		/** One sentence; also used as the meta description. */
		description: z.string(),
		group: z.enum(docGroups),
		/** Global order of the page in the sidebar and prev/next. */
		order: z.number(),
		/** Slugs of related pages. */
		related: z.array(z.string()).default([]),
	}),
});

export const collections = { docs };
