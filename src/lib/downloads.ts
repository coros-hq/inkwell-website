/**
 * Release downloads. Update `version` and the file names/sizes on each release
 * (https://github.com/coros-hq/inkwell/releases). Asset names include the
 * version, so there's no version-free "latest" URL for them.
 */
export const version = '1.0.0';
export const repo = 'https://github.com/coros-hq/inkwell';
export const releasesUrl = `${repo}/releases`;
export const releaseUrl = `${repo}/releases/tag/v${version}`;

const asset = (file: string) => `${repo}/releases/download/v${version}/${file}`;

export type PlatformId = 'mac' | 'windows' | 'linux';

export interface Download {
	label: string;
	file: string;
	url: string;
	size: string;
}

export interface Platform {
	id: PlatformId;
	name: string;
	note: string;
	icon: 'mac' | 'windows' | 'linux';
	primary: Download;
	others: Download[];
}

const dl = (label: string, file: string, size: string): Download => ({ label, file, url: asset(file), size });

export const platforms: Platform[] = [
	{
		id: 'mac',
		name: 'macOS',
		note: 'Universal: Apple silicon & Intel',
		icon: 'mac',
		primary: dl('.dmg', `inkwell_${version}_universal.dmg`, '15.8 MB'),
		others: [],
	},
	{
		id: 'windows',
		name: 'Windows',
		note: '64-bit (x64)',
		icon: 'windows',
		primary: dl('.exe installer', `inkwell_${version}_x64-setup.exe`, '6.0 MB'),
		others: [dl('.msi', `inkwell_${version}_x64_en-US.msi`, '7.7 MB')],
	},
	{
		id: 'linux',
		name: 'Linux',
		note: 'x86_64',
		icon: 'linux',
		primary: dl('.AppImage', `inkwell_${version}_amd64.AppImage`, '87.3 MB'),
		others: [
			dl('.deb', `inkwell_${version}_amd64.deb`, '9.5 MB'),
			dl('.rpm', `inkwell-${version}-1.x86_64.rpm`, '9.5 MB'),
		],
	},
];
