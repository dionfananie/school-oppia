import type { Route } from "./+types/home";
import { PicaGames } from "../pica/PicaGames";

export function meta() {
	return [
		{ title: "Pica Games · Belajar sambil bermain untuk anak 2–7 tahun" },
		{
			name: "description",
			content:
				"Pica Games: 17 permainan belajar untuk anak usia 2–7 tahun — kenali, cocokkan, hitung. Aman, tanpa iklan, dengan suara & animasi.",
		},
		{ name: "robots", content: "index, follow" },
		{ rel: "canonical", href: "https://pica.oppia.world" },
		{ property: "og:type", content: "website" },
		{ property: "og:site_name", content: "Pica Games" },
		{
			property: "og:title",
			content: "Pica Games · Belajar sambil bermain untuk anak 2–7 tahun",
		},
		{
			property: "og:description",
			content:
				"17 permainan belajar untuk anak 2–7 tahun — kenali, cocokkan, hitung, logika, huruf & kreatif. Aman dan tanpa iklan.",
		},
		{ property: "og:url", content: "https://pica.oppia.world" },
		{ property: "og:image", content: "https://pica.oppia.world/pica-star.svg" },
		{ name: "twitter:card", content: "summary" },
		{
			name: "twitter:title",
			content: "Pica Games · Belajar sambil bermain untuk anak 2–7 tahun",
		},
		{
			name: "twitter:description",
			content:
				"17 permainan belajar untuk anak 2–7 tahun — kenali, cocokkan, hitung, logika, huruf & kreatif. Aman dan tanpa iklan.",
		},
	];
}

export default function Home() {
	return <PicaGames />;
}
