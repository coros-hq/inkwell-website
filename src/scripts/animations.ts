import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const motion = document.documentElement.classList.contains('motion');

if (motion) {
	gsap.registerPlugin(ScrollTrigger);

	// Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
	const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
	(window as any).__lenis = lenis;
	lenis.on('scroll', ScrollTrigger.update);
	gsap.ticker.add((time) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);

	// Anchor links glide instead of jumping.
	document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
		const hash = a.getAttribute('href');
		if (!hash || hash === '#') return;
		a.addEventListener('click', (e) => {
			const target = document.querySelector(hash);
			if (!target) return;
			e.preventDefault();
			lenis.scrollTo(target as HTMLElement, { offset: -16, duration: 1.4 });
		});
	});

	// Hero entrance timeline.
	const hero = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });
	hero
		.fromTo('[data-hero="nav"]', { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.8 })
		.fromTo(
			'[data-hero="line"]',
			{ opacity: 1, yPercent: 110 },
			{ yPercent: 0, duration: 1, stagger: 0.12, ease: 'power4.out' },
			0.15,
		)
		.fromTo('[data-hero="lead"]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9 }, 0.6)
		.fromTo(
			'[data-hero="mockup"]',
			{ opacity: 0, y: 80, scale: 0.94 },
			{ opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power4.out' },
			0.75,
		);

	// Parallax on backgrounds.
	gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
		const amount = Number(el.dataset.parallax);
		gsap.fromTo(
			el,
			{ yPercent: -amount / 2 },
			{
				yPercent: amount / 2,
				ease: 'none',
				scrollTrigger: {
					trigger: el.parentElement,
					start: 'top bottom',
					end: 'bottom top',
					scrub: true,
				},
			},
		);
	});

	// Mockup drifts slightly slower than the page.
	gsap.to('[data-hero="mockup"] img', {
		yPercent: -6,
		ease: 'none',
		scrollTrigger: { trigger: '[data-hero="mockup"]', start: 'top 80%', end: 'bottom top', scrub: true },
	});

	// Fade-up reveals (scale variant for cards/illustrations).
	gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
		const scale = el.dataset.reveal === 'scale';
		gsap.fromTo(
			el,
			{ opacity: 0, y: 40, scale: scale ? 0.95 : 1 },
			{
				opacity: 1,
				y: 0,
				scale: 1,
				duration: 1,
				ease: 'power3.out',
				scrollTrigger: { trigger: el, start: 'top 88%', once: true },
			},
		);
	});

	// Staggered children (cards, list rows).
	gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
		gsap.fromTo(
			Array.from(group.children),
			{ opacity: 0, y: 48 },
			{
				opacity: 1,
				y: 0,
				duration: 0.9,
				ease: 'power3.out',
				stagger: 0.12,
				scrollTrigger: { trigger: group, start: 'top 85%', once: true },
			},
		);
	});

	const mm = gsap.matchMedia();

	// Desktop: subtle float on feature illustrations as they cross the viewport.
	mm.add('(min-width: 768px)', () => {
		gsap.utils.toArray<HTMLElement>('#features li img').forEach((img) => {
			gsap.fromTo(
				img,
				{ yPercent: 6 },
				{
					yPercent: -6,
					ease: 'none',
					scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true },
				},
			);
		});
	});

	// Mobile: sticky stacked cards. Each card scales down as the next ones slide over it.
	mm.add('(max-width: 767px)', () => {
		const stack = document.querySelector<HTMLElement>('[data-card-stack]');
		if (!stack) return;
		const cards = Array.from(stack.children) as HTMLElement[];
		const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

		cards.forEach((card, i) => {
			const targetScale = Math.max(0.7, 1 - (cards.length - i - 1) * 0.05);
			const stuckTop = rem + i * 1.25 * rem;
			gsap.to(card, {
				scale: targetScale,
				ease: 'none',
				scrollTrigger: {
					trigger: card,
					start: `top ${stuckTop}px`,
					endTrigger: stack,
					end: 'bottom bottom',
					scrub: true,
				},
			});
		});
	});

	window.addEventListener('load', () => ScrollTrigger.refresh());
}
