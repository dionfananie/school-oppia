import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (p: IconProps) => ({
	className: "i",
	viewBox: "0 0 24 24",
	"aria-hidden": true,
	...p,
});

export function IconBack(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path
				d="M15 4 7 12l8 8"
				stroke="currentColor"
				strokeWidth={3}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function IconSound(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor" />
			<path
				d="M16 8.5a5 5 0 0 1 0 7"
				stroke="currentColor"
				strokeWidth={2}
				fill="none"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IconMute(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor" />
			<path d="m17 10 5 5m0-5-5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
		</svg>
	);
}

export function IconSpeak(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor" />
			<path
				d="M15 8.5a5 5 0 0 1 0 7"
				stroke="currentColor"
				strokeWidth={2}
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M18.5 5.5a9 9 0 0 1 0 13"
				stroke="currentColor"
				strokeWidth={2}
				fill="none"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IconStar(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path
				d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function IconKenali(p: IconProps) {
	return (
		<svg {...base(p)}>
			<circle cx="7" cy="12" r="4" fill="#fff" />
			<circle cx="17" cy="6" r="4" fill="#fff" opacity=".85" />
			<circle cx="17" cy="18" r="4" fill="#fff" opacity=".85" />
		</svg>
	);
}

export function IconCocok(p: IconProps) {
	return (
		<svg {...base(p)}>
			<circle cx="8" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2.4" />
			<circle cx="16" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2.4" />
		</svg>
	);
}

export function IconHitung(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M5 18V6h2v12Z M11 18v-8h2v8Z M17 18v-6h2v6Z" fill="#fff" />
		</svg>
	);
}

export function IconHome(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z" fill="currentColor" />
		</svg>
	);
}

export function IconUser(p: IconProps) {
	return (
		<svg {...base(p)}>
			<circle cx="12" cy="8" r="4" fill="currentColor" />
			<path d="M4 21a8 8 0 0 1 16 0Z" fill="currentColor" />
		</svg>
	);
}

export function IconTrophy(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path d="M6 3h12v4a6 6 0 0 1-12 0Z" fill="currentColor" />
			<path
				d="M6 4H3v2a4 4 0 0 0 4 4M18 4h3v2a4 4 0 0 1-4 4"
				stroke="currentColor"
				strokeWidth={1.8}
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M12 13v4m-3 4h6"
				stroke="currentColor"
				strokeWidth={2.2}
				fill="none"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function IconLock(p: IconProps) {
	return (
		<svg {...base(p)}>
			<rect x="5" y="10" width="14" height="10" rx="3" fill="currentColor" />
			<path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth={2} />
		</svg>
	);
}

export function IconMcard(p: IconProps) {
	return (
		<svg {...base(p)}>
			<path
				d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function IconCatLogic(p: IconProps) {
	return (
		<svg {...base(p)}>
			<rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke="#fff" strokeWidth={2.4} />
			<path d="M12 9v6M9 12h6" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" />
		</svg>
	);
}

export function IconCatHuruf(p: IconProps) {
	return (
		<svg {...base(p)}>
			<text x="12" y="17" textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff" fontFamily="Avenir, sans-serif">
				Aa
			</text>
		</svg>
	);
}

export function IconCatKreatif(p: IconProps) {
	return (
		<svg {...base(p)}>
			<circle cx="8" cy="9" r="4" fill="#fff" />
			<rect x="14" y="5" width="6" height="8" rx="2" fill="#fff" opacity=".85" />
			<path d="m6 16 3 3 3-6-3 3Z" fill="#fff" opacity=".85" />
		</svg>
	);
}
