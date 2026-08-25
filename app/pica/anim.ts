/**
 * Small Web Animations API helpers.
 * Every helper no-ops under `prefers-reduced-motion` (CSS handles the rest).
 */

export function reducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export function animate(
	el: Element | null | undefined,
	keyframes: Keyframe[],
	options?: KeyframeAnimationOptions,
): Animation | null {
	if (!el || reducedMotion()) return null;
	try {
		return el.animate(keyframes, options);
	} catch {
		return null;
	}
}

/** Quick squash on tap. */
export const press = (el: Element | null | undefined) =>
	animate(
		el,
		[
			{ transform: "scale(1)" },
			{ transform: "scale(.92)" },
			{ transform: "scale(1)" },
		],
		{ duration: 140, easing: "ease-out" },
	);

/** Wiggle for a wrong answer. */
export const shake = (el: Element | null | undefined) =>
	animate(
		el,
		[
			{ transform: "translateX(0)" },
			{ transform: "translateX(-7px)" },
			{ transform: "translateX(7px)" },
			{ transform: "translateX(-5px)" },
			{ transform: "translateX(5px)" },
			{ transform: "translateX(0)" },
		],
		{ duration: 420 },
	);

/** Bounce on a right answer. */
export const pop = (el: Element | null | undefined) =>
	animate(
		el,
		[
			{ transform: "scale(1)" },
			{ transform: "scale(1.12)" },
			{ transform: "scale(1)" },
		],
		{ duration: 380, easing: "cubic-bezier(.34,1.56,.64,1)" },
	);

/** Pop for the star counter when a point is scored. */
export const popStars = (el: Element | null | undefined) =>
	animate(
		el,
		[
			{ transform: "scale(1)" },
			{ transform: "scale(1.35)" },
			{ transform: "scale(1)" },
		],
		{ duration: 300, easing: "cubic-bezier(.34,1.56,.64,1)" },
	);
