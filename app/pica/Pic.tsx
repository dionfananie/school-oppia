import type { Item } from "./types";

/**
 * The pictograms are hand-drawn flat SVG markup stored as strings in `data.ts`
 * (same source as the original single-file prototype). They are static, trusted
 * content, so we inject them via `dangerouslySetInnerHTML` instead of carrying
 * sixty-odd JSX trees.
 */
export function svgMarkup(item: Item, color?: string): string {
	return item.draw ? item.draw(color ?? item.c ?? "#000") : item.svg ?? "";
}

/** A pictogram inside its circular badge. */
export function Pic({ item, color, className }: { item: Item; color?: string; className?: string }) {
	const cls = className ? `pic ${className}` : "pic";
	return <span className={cls} dangerouslySetInnerHTML={{ __html: svgMarkup(item, color) }} />;
}

/** The "what am I looking for" card: colour block or large pictogram + name. */
export function Target({ item }: { item: Item }) {
	if (item.hex) {
		return (
			<>
				<span className="color-block target-block" style={{ background: item.hex }} />
				<span className="t-name">{item.name}</span>
			</>
		);
	}
	return (
		<>
			<Pic item={item} className="pic-lg" />
			<span className="t-name">{item.name}</span>
		</>
	);
}
