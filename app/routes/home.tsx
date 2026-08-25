import type { Route } from "./+types/home";
import { PicaGames } from "../pica/PicaGames";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Pica Games · Belajar sambil bermain untuk anak 2–7 tahun" },
		{
			name: "description",
			content:
				"Pica Games: 17 permainan belajar untuk anak usia 2–7 tahun — kenali, cocokkan, hitung. Aman, tanpa iklan, dengan suara & animasi.",
		},
	];
}

export default function Home() {
	return <PicaGames />;
}
