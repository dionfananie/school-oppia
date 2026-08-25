import { load, save } from "./storage";
import type { Category, GameDef, Item } from "./types";

export const NQ = 8;

const ic = (s: string) =>
	`<svg class="ic" viewBox="0 0 64 64" aria-hidden="true">${s}</svg>`;


/* ─── ikon UI (bukan emoji) ──────────────────────────────────────────── */
const ICON_BACK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_SOUND = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_MUTE = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor"/><path d="m17 10 5 5m0-5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_SPEAK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l6 5V4L8 9Z" fill="currentColor"/><path d="M15 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M18.5 5.5a9 9 0 0 1 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICON_STAR = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z" fill="currentColor"/></svg>';
const ICON_KENALI = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="12" r="4" fill="#fff"/><circle cx="17" cy="6" r="4" fill="#fff" opacity=".85"/><circle cx="17" cy="18" r="4" fill="#fff" opacity=".85"/></svg>';
const ICON_COCOK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="16" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2.4"/></svg>';
const ICON_HITUNG = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18V6h2v12Z M11 18v-8h2v8Z M17 18v-6h2v6Z" fill="#fff"/></svg>';

/* ─── data gambar (piktogram flat — konten permainan) ───────────────── */
export const SETS: Record<string, Item[]> = {
	warna: [
		{ id: 'merah', name: 'Merah', hex: '#EF4444', near: ['#DC2626', '#F87171'] },
		{ id: 'biru', name: 'Biru', hex: '#3B82F6', near: ['#2563EB', '#60A5FA'] },
		{ id: 'kuning', name: 'Kuning', hex: '#FACC15', near: ['#EAB308', '#FDE047'] },
		{ id: 'hijau', name: 'Hijau', hex: '#22C55E', near: ['#16A34A', '#4ADE80'] },
		{ id: 'oranye', name: 'Oranye', hex: '#F97316', near: ['#EA580C', '#FB923C'] },
		{ id: 'ungu', name: 'Ungu', hex: '#8B5CF6', near: ['#7C3AED', '#A78BFA'] },
		{ id: 'pink', name: 'Pink', hex: '#EC4899', near: ['#DB2777', '#F472B6'] },
		{ id: 'coklat', name: 'Coklat', hex: '#B45309', near: ['#92400E', '#C56B1B'] },
		{ id: 'abu-abu', name: 'Abu-abu', hex: '#9CA3AF', near: ['#6B7280', '#B7BEC9'] },
		{ id: 'toska', name: 'Toska', hex: '#0D9488', near: ['#0F766E', '#14B8A6'] },
		{ id: 'hitam', name: 'Hitam', hex: '#1F2937', near: ['#111827', '#374151'] }
	],
	bentuk: [
		{ id: 'lingkaran', name: 'Lingkaran', c: '#F97316', draw: c => ic('<circle cx="32" cy="32" r="21" fill="' + c + '"/>') },
		{ id: 'kotak', name: 'Kotak', c: '#3B82F6', draw: c => ic('<rect x="13" y="13" width="38" height="38" rx="7" fill="' + c + '"/>') },
		{ id: 'segitiga', name: 'Segitiga', c: '#22C55E', draw: c => ic('<path d="M32 10 L55 52 L9 52 Z" fill="' + c + '"/>') },
		{ id: 'persegi-panjang', name: 'Persegi Panjang', c: '#8B5CF6', draw: c => ic('<rect x="9" y="21" width="46" height="28" rx="6" fill="' + c + '"/>') },
		{ id: 'bintang', name: 'Bintang', c: '#FACC15', draw: c => ic('<path d="M32 8 L39.5 24 L56 24 L43 35 L48 52 L32 42 L16 52 L21 35 L8 24 L24.5 24 Z" fill="' + c + '"/>') }
	],
	hewan: [
		{ id: 'anjing', name: 'Anjing', svg: ic('<ellipse cx="32" cy="40" rx="20" ry="17" fill="#C08446"/><ellipse cx="13" cy="27" rx="7" ry="11" fill="#8C5A2B" transform="rotate(-22 13 27)"/><ellipse cx="51" cy="27" rx="7" ry="11" fill="#8C5A2B" transform="rotate(22 51 27)"/><circle cx="25" cy="38" r="2.8" fill="#2B1808"/><circle cx="39" cy="38" r="2.8" fill="#2B1808"/><ellipse cx="32" cy="46" rx="8" ry="5.5" fill="#F6E3C4"/><circle cx="32" cy="48" r="2.6" fill="#2B1808"/>') },
		{ id: 'kucing', name: 'Kucing', svg: ic('<path d="M16 40 L22 14 L32 28 L42 14 L48 40 Q40 54 32 54 Q24 54 16 40" fill="#FB923C"/><circle cx="26" cy="34" r="2.8" fill="#431407"/><circle cx="38" cy="34" r="2.8" fill="#431407"/><path d="M32 38 l3 3 -3 3 -3 -3 z" fill="#F472B6"/><path d="M30 46 q2 2 4 0" stroke="#431407" stroke-width="1.8" fill="none"/><path d="M20 38 h-7 M20 42 h-6 M44 38 h7 M44 42 h6" stroke="#7C2D12" stroke-width="2" stroke-linecap="round"/>') },
		{ id: 'ikan', name: 'Ikan', svg: ic('<ellipse cx="36" cy="32" rx="16" ry="12" fill="#60A5FA"/><path d="M14 32 L24 22 L24 42 Z" fill="#3B82F6"/><path d="M30 20 L38 12 L44 20 Z" fill="#3B82F6"/><circle cx="44" cy="30" r="2.8" fill="#172554"/><circle cx="45.5" cy="28.5" r="1" fill="#fff"/>') },
		{ id: 'burung', name: 'Burung', svg: ic('<circle cx="34" cy="32" r="17" fill="#34D399"/><circle cx="16" cy="40" r="10" fill="#10B981"/><path d="M50 32 L60 36 L50 40 Z" fill="#F59E0B"/><circle cx="42" cy="27" r="2.6" fill="#064E3B"/><path d="M42 15 l3 6 -8 1 z" fill="#F59E0B"/><path d="M26 44 q4 6 10 6" stroke="#064E3B" stroke-width="2" fill="none"/>') },
		{ id: 'sapi', name: 'Sapi', svg: ic('<ellipse cx="32" cy="40" rx="20" ry="17" fill="#F5F5F4"/><circle cx="19" cy="31" r="5" fill="#111827"/><circle cx="45" cy="31" r="5" fill="#111827"/><ellipse cx="12" cy="24" rx="6" ry="9" fill="#9CA3AF" transform="rotate(-18 12 24)"/><ellipse cx="52" cy="24" rx="6" ry="9" fill="#9CA3AF" transform="rotate(18 52 24)"/><circle cx="25" cy="38" r="2.6" fill="#1F2937"/><circle cx="39" cy="38" r="2.6" fill="#1F2937"/><ellipse cx="32" cy="46" rx="8" ry="5.5" fill="#F9A8D4"/><circle cx="32" cy="48" r="2" fill="#1F2937"/>') },
		{ id: 'ayam', name: 'Ayam', svg: ic('<circle cx="32" cy="38" r="18" fill="#FACC15"/><circle cx="25" cy="35" r="2.6" fill="#422006"/><path d="M44 40 L54 38 L44 33 Z" fill="#F97316"/><path d="M32 20 q-1 -6 3 -10 q4 4 2 10" fill="#EF4444"/><circle cx="32" cy="17" r="2" fill="#B91C1C"/><path d="M18 44 q4 6 10 6" stroke="#713F12" stroke-width="2" fill="none"/>') },
		{ id: 'kelinci', name: 'Kelinci', svg: ic('<ellipse cx="24" cy="18" rx="6" ry="14" fill="#F5F5F4"/><ellipse cx="40" cy="18" rx="6" ry="14" fill="#F5F5F4"/><ellipse cx="26" cy="10" rx="3" ry="6" fill="#F9A8D4"/><ellipse cx="38" cy="10" rx="3" ry="6" fill="#F9A8D4"/><circle cx="32" cy="38" r="17" fill="#F5F5F4"/><circle cx="26" cy="36" r="2.6" fill="#1F2937"/><circle cx="38" cy="36" r="2.6" fill="#1F2937"/><path d="M32 40 l2.5 2.5 -2.5 2.5 -2.5 -2.5 z" fill="#F9A8D4"/><path d="M32 47 q4 2 7 1" stroke="#1F2937" stroke-width="1.6" fill="none"/>') },
		{ id: 'gajah', name: 'Gajah', svg: ic('<circle cx="32" cy="34" r="19" fill="#A8A29E"/><ellipse cx="13" cy="34" rx="9" ry="13" fill="#D6D3D1"/><circle cx="25" cy="31" r="2.8" fill="#292524"/><path d="M36 40 q9 3 11 13 q-7 2 -10 -1 q1 -8 -3 -11" fill="#A8A29E"/><circle cx="43" cy="50" r="2.4" fill="#FCA5A5"/><path d="M34 24 q-2 -6 3 -8" stroke="#A8A29E" stroke-width="3" fill="none"/>') },
		{ id: 'harimau', name: 'Harimau', svg: ic('<circle cx="32" cy="38" r="20" fill="#FB923C"/><circle cx="23" cy="22" r="6" fill="#8C5A2B"/><circle cx="41" cy="22" r="6" fill="#8C5A2B"/><path d="M16 30 Q11 27 14 22 M48 30 Q53 27 50 22 M20 24 Q17 20 20 17 M44 24 Q47 20 44 17" stroke="#7C2D12" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="26" cy="34" r="2.6" fill="#431407"/><circle cx="38" cy="34" r="2.6" fill="#431407"/><ellipse cx="32" cy="45" rx="9" ry="6" fill="#FDE68A"/><path d="M32 42 l2.6 2.6 -2.6 2.6 -2.6 -2.6 z" fill="#431407"/><path d="M18 44 l-3 3 M46 44 l3 3" stroke="#7C2D12" stroke-width="2.6" stroke-linecap="round"/>') },
		{ id: 'singa', name: 'Singa', svg: ic('<circle cx="32" cy="36" r="21" fill="#D97706"/><circle cx="32" cy="38" r="14" fill="#FB923C"/><circle cx="19" cy="27" r="4" fill="#B45309"/><circle cx="45" cy="27" r="4" fill="#B45309"/><circle cx="25" cy="34" r="2.4" fill="#431407"/><circle cx="39" cy="34" r="2.4" fill="#431407"/><ellipse cx="32" cy="44" rx="8" ry="5" fill="#FDE68A"/><path d="M32 42 l2.4 2.4 -2.4 2.4 -2.4 -2.4 z" fill="#431407"/><path d="M26 49 q6 3 12 0" stroke="#78350F" stroke-width="2.2" fill="none" stroke-linecap="round"/>') },
		{ id: 'bebek', name: 'Bebek', svg: ic('<ellipse cx="32" cy="40" rx="19" ry="15" fill="#FACC15"/><ellipse cx="20" cy="38" rx="10" ry="8" fill="#EAB308"/><path d="M14 30 Q10 22 18 20" stroke="#FACC15" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M49 36 L58 40 L49 44 Z" fill="#F97316"/><circle cx="40" cy="32" r="2.4" fill="#78350F"/><path d="M18 50 L16 54 L16 56" stroke="#F97316" stroke-width="2.6" stroke-linecap="round"/>') },
		{ id: 'katak', name: 'Katak', svg: ic('<ellipse cx="32" cy="44" rx="18" ry="12" fill="#4ADE80"/><circle cx="25" cy="31" r="5.5" fill="#22C55E"/><circle cx="39" cy="31" r="5.5" fill="#22C55E"/><circle cx="25" cy="31" r="2.2" fill="#052E16"/><circle cx="39" cy="31" r="2.2" fill="#052E16"/><path d="M24 46 q8 6 16 0" stroke="#052E16" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M16 48 q-2 4 -6 5 M48 48 q2 4 6 5" stroke="#22C55E" stroke-width="2.4" stroke-linecap="round"/>') },
		{ id: 'panda', name: 'Panda', svg: ic('<ellipse cx="32" cy="44" rx="17" ry="12" fill="#F5F5F4"/><circle cx="32" cy="30" r="15" fill="#F5F5F4"/><circle cx="21" cy="18" r="6" fill="#111827"/><circle cx="43" cy="18" r="6" fill="#111827"/><ellipse cx="26" cy="30" rx="5" ry="6.5" fill="#111827"/><ellipse cx="38" cy="30" rx="5" ry="6.5" fill="#111827"/><circle cx="26" cy="30" r="2" fill="#fff"/><circle cx="38" cy="30" r="2" fill="#fff"/><ellipse cx="32" cy="38" rx="6" ry="4" fill="#fff"/><circle cx="32" cy="37" r="2" fill="#111827"/>') },
		{ id: 'monyet', name: 'Monyet', svg: ic('<circle cx="32" cy="36" r="18" fill="#8B5A2B"/><circle cx="15" cy="34" r="6" fill="#8B5A2B"/><circle cx="49" cy="34" r="6" fill="#8B5A2B"/><circle cx="15" cy="34" r="2.4" fill="#5B3B18"/><circle cx="49" cy="34" r="2.4" fill="#5B3B18"/><ellipse cx="32" cy="40" rx="12" ry="9" fill="#E7C79B"/><circle cx="26" cy="34" r="2.2" fill="#301A0B"/><circle cx="38" cy="34" r="2.2" fill="#301A0B"/><path d="M27 44 q5 3 10 0" stroke="#301A0B" stroke-width="2.2" fill="none" stroke-linecap="round"/>') },
		{ id: 'beruang', name: 'Beruang', svg: ic('<circle cx="32" cy="38" r="20" fill="#B45309"/><circle cx="20" cy="22" r="6" fill="#B45309"/><circle cx="44" cy="22" r="6" fill="#B45309"/><circle cx="20" cy="22" r="3" fill="#FDE68A"/><circle cx="44" cy="22" r="3" fill="#FDE68A"/><ellipse cx="32" cy="46" rx="10" ry="7" fill="#FDE68A"/><circle cx="26" cy="34" r="2.6" fill="#2E1A0B"/><circle cx="38" cy="34" r="2.6" fill="#2E1A0B"/><circle cx="32" cy="44" r="2.4" fill="#2E1A0B"/>') },
		{ id: 'kupu-kupu', name: 'Kupu-kupu', svg: ic('<ellipse cx="22" cy="24" rx="9" ry="12" fill="#F472B6" transform="rotate(-28 22 24)"/><ellipse cx="42" cy="24" rx="9" ry="12" fill="#F472B6" transform="rotate(28 42 24)"/><ellipse cx="23" cy="42" rx="8" ry="11" fill="#EC4899" transform="rotate(-28 23 42)"/><ellipse cx="41" cy="42" rx="8" ry="11" fill="#EC4899" transform="rotate(28 41 42)"/><circle cx="22" cy="24" r="2.4" fill="#DB2777"/><circle cx="42" cy="24" r="2.4" fill="#DB2777"/><ellipse cx="32" cy="34" rx="4" ry="16" fill="#8B5A2B"/><path d="M30 20 Q26 10 22 10 M34 20 Q38 10 42 10" stroke="#8B5A2B" stroke-width="2" fill="none" stroke-linecap="round"/>') },
		{ id: 'kura-kura', name: 'Kura-kura', svg: ic('<path d="M15 40 L49 40 Q45 21 32 21 Q19 21 15 40 Z" fill="#22C55E"/><path d="M32 23 L32 40 M32 30 L25 40 M32 30 L39 40" stroke="#15803D" stroke-width="2"/><circle cx="52" cy="38" r="7" fill="#65A30D"/><circle cx="54" cy="36" r="1.6" fill="#052E16"/><path d="M17 40 L13 49 M47 40 L51 49 M29 52 L35 52" stroke="#65A30D" stroke-width="4" stroke-linecap="round"/>') },
		{ id: 'rusa', name: 'Rusa', svg: ic('<circle cx="34" cy="38" r="15" fill="#C79A5B"/><circle cx="21" cy="33" r="3.5" fill="#E7C79B"/><path d="M25 30 Q22 16 26 11 M27 20 Q22 15 22 11" stroke="#8A6A38" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M43 30 Q46 16 42 11 M41 20 Q46 15 46 11" stroke="#8A6A38" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="28" cy="36" r="2.4" fill="#3B2410"/><circle cx="40" cy="36" r="2.4" fill="#3B2410"/><ellipse cx="34" cy="46" rx="7" ry="5" fill="#E7C79B"/><circle cx="34" cy="45" r="1.8" fill="#3B2410"/>') },
		{ id: 'lebah', name: 'Lebah', svg: ic('<ellipse cx="32" cy="38" rx="15" ry="12" fill="#FACC15"/><path d="M27 27 L27 49 M32 25 L32 51 M37 27 L37 49" stroke="#3B2410" stroke-width="3.4"/><ellipse cx="24" cy="22" rx="8" ry="5" fill="#DBEAFE" transform="rotate(-18 24 22)"/><ellipse cx="40" cy="22" rx="8" ry="5" fill="#DBEAFE" transform="rotate(18 40 22)"/><circle cx="47" cy="36" r="4" fill="#3B2410"/><path d="M47 33 Q50 26 53 26" stroke="#3B2410" stroke-width="1.8" fill="none"/>') }
	],
	buah: [
		{ id: 'apel', name: 'Apel', svg: ic('<circle cx="32" cy="40" r="18" fill="#EF4444"/><ellipse cx="22" cy="50" rx="4.5" ry="7" fill="#F87171"/><path d="M32 24 q-4 -8 2 -12 q5 5 1 12" fill="#713F12"/><path d="M31 23 q-9 -3 -8 -11 q8 0 9 9" fill="#22C55E"/><path d="M24 32 q4 -2 6 -1" stroke="#FCA5A5" stroke-width="2" fill="none"/>') },
		{ id: 'pisang', name: 'Pisang', svg: ic('<path d="M16 46 C16 18 40 8 52 16 C50 30 36 44 16 46 Z" fill="#FACC15"/><path d="M16 46 C20 32 30 22 44 16" stroke="#EAB308" stroke-width="2.5" fill="none"/><path d="M16 46 L11 51" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>') },
		{ id: 'jeruk', name: 'Jeruk', svg: ic('<circle cx="32" cy="36" r="19" fill="#F97316"/><circle cx="24" cy="28" r="1.4" fill="#9A3412"/><circle cx="30" cy="24" r="1.4" fill="#9A3412"/><path d="M32 16 q4 -8 10 -6 q-2 8 -10 7" fill="#22C55E"/>') },
		{ id: 'anggur', name: 'Anggur', svg: ic('<path d="M34 12 q5 -8 11 -6" stroke="#4ADE80" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="24" cy="26" r="6.5" fill="#8B5CF6"/><circle cx="36" cy="26" r="6.5" fill="#8B5CF6"/><circle cx="48" cy="26" r="6.5" fill="#8B5CF6"/><circle cx="18" cy="38" r="6.5" fill="#7C3AED"/><circle cx="30" cy="38" r="6.5" fill="#8B5CF6"/><circle cx="42" cy="38" r="6.5" fill="#7C3AED"/><circle cx="24" cy="50" r="6.5" fill="#7C3AED"/><circle cx="36" cy="50" r="6.5" fill="#8B5CF6"/>') },
		{ id: 'stroberi', name: 'Stroberi', svg: ic('<path d="M32 12 C42 12 48 22 48 32 C48 44 42 52 32 52 C22 52 16 44 16 32 C16 22 22 12 32 12 Z" fill="#EF4444"/><path d="M24 16 l-2 -5 4 -1 z M40 16 l2 -5 -4 -1 z" fill="#22C55E"/><circle cx="26" cy="26" r="1.3" fill="#FCA5A5"/><circle cx="34" cy="30" r="1.3" fill="#FCA5A5"/><circle cx="28" cy="38" r="1.3" fill="#FCA5A5"/><circle cx="36" cy="42" r="1.3" fill="#FCA5A5"/>') },
		{ id: 'semangka', name: 'Semangka', svg: ic('<path d="M32 14 Q52 14 56 34 L8 34 Q12 14 32 14 Z" fill="#22C55E"/><rect x="8" y="34" width="48" height="16" rx="6" fill="#F87171"/><circle cx="22" cy="42" r="2.2" fill="#7C2D12"/><circle cx="34" cy="40" r="2.2" fill="#7C2D12"/><circle cx="44" cy="44" r="2.2" fill="#7C2D12"/>') },
		{ id: 'mangga', name: 'Mangga', svg: ic('<path d="M32 16 C48 16 55 30 54 40 C53 50 43 54 32 54 C21 54 11 50 10 40 C9 30 16 16 32 16 Z" fill="#F59E0B"/><ellipse cx="24" cy="50" rx="6" ry="4" fill="#FB923C" opacity=".7"/><path d="M32 16 q4 -8 12 -8 q-2 8 -12 8" fill="#22C55E"/>') },
		{ id: 'nanas', name: 'Nanas', svg: ic('<ellipse cx="32" cy="40" rx="15" ry="14" fill="#FACC15"/><path d="M25 30 h14 M24 38 h16 M25 46 h14" stroke="#C79A3B" stroke-width="2.4"/><path d="M22 26 Q28 12 32 12 Q36 12 42 26 M28 20 L26 12 M36 20 L38 12" stroke="#22C55E" stroke-width="2.6" fill="none" stroke-linecap="round"/>') }
	],
	kendaraan: [
		{ id: 'mobil', name: 'Mobil', svg: ic('<path d="M14 32 L22 20 h18 L48 32 Z" fill="#93C5FD"/><rect x="8" y="30" width="48" height="14" rx="7" fill="#3B82F6"/><rect x="24" y="22" width="9" height="8" rx="2" fill="#EFF6FF"/><circle cx="20" cy="47" r="5" fill="#1F2937"/><circle cx="44" cy="47" r="5" fill="#1F2937"/><rect x="30" y="42" width="4" height="6" fill="#FACC15"/>') },
		{ id: 'bus', name: 'Bus', svg: ic('<rect x="6" y="16" width="52" height="30" rx="8" fill="#F59E0B"/><rect x="12" y="22" width="11" height="10" rx="2" fill="#FEF3C7"/><rect x="26" y="22" width="11" height="10" rx="2" fill="#FEF3C7"/><rect x="40" y="22" width="11" height="10" rx="2" fill="#FEF3C7"/><circle cx="19" cy="50" r="5" fill="#1F2937"/><circle cx="45" cy="50" r="5" fill="#1F2937"/><rect x="8" y="28" width="48" height="3" fill="#D97706"/>') },
		{ id: 'kereta', name: 'Kereta', svg: ic('<rect x="6" y="26" width="22" height="16" rx="4" fill="#EF4444"/><rect x="30" y="16" width="28" height="26" rx="5" fill="#F87171"/><rect x="10" y="30" width="8" height="8" rx="2" fill="#FECACA"/><rect x="34" y="20" width="9" height="9" rx="2" fill="#FECACA"/><rect x="46" y="20" width="9" height="9" rx="2" fill="#FECACA"/><path d="M14 26 L14 16 h5 l-2 10" fill="#B91C1C"/><circle cx="16" cy="45" r="4.6" fill="#1F2937"/><circle cx="42" cy="45" r="4.6" fill="#1F2937"/>') },
		{ id: 'pesawat', name: 'Pesawat', svg: ic('<path d="M34 20 L58 12 L48 32 L36 28 L30 42 L22 32 L10 38 L16 28 L28 22 Z" fill="#60A5FA"/><circle cx="44" cy="22" r="1.6" fill="#1E3A8A"/>') },
		{ id: 'kapal', name: 'Kapal', svg: ic('<path d="M8 40 L14 30 L50 30 L56 40 Q48 48 32 48 Q16 48 8 40 Z" fill="#3B82F6"/><rect x="26" y="18" width="12" height="12" rx="2" fill="#F9FAFB"/><rect x="30" y="10" width="4" height="9" fill="#F59E0B"/><path d="M6 44 Q14 50 24 46 Q34 42 42 48 Q50 52 58 46" stroke="#93C5FD" stroke-width="4" fill="none" stroke-linecap="round"/>') },
		{ id: 'motor', name: 'Motor', svg: ic('<circle cx="16" cy="46" r="8.5" fill="#1F2937"/><circle cx="46" cy="46" r="8.5" fill="#1F2937"/><path d="M18 40 L34 20 L44 22 L42 28 L34 30 L24 42 Z" fill="#F43F5E"/><path d="M20 40 L26 34" stroke="#F43F5E" stroke-width="5" stroke-linecap="round"/><rect x="30" y="16" width="16" height="5" rx="2.5" fill="#9F1239"/>') }
	],
	sayuran: [
		{ id: 'wortel', name: 'Wortel', svg: ic('<path d="M22 18 L38 20 L30 54 L24 48 L20 30 Z" fill="#F97316"/><path d="M22 20 Q12 16 10 8 M22 20 Q14 8 20 4 M24 20 Q30 12 36 10" stroke="#22C55E" stroke-width="3" fill="none" stroke-linecap="round"/>') },
		{ id: 'brokoli', name: 'Brokoli', svg: ic('<rect x="27" y="34" width="10" height="16" rx="4" fill="#65A30D"/><circle cx="24" cy="26" r="8" fill="#22C55E"/><circle cx="36" cy="22" r="9" fill="#4ADE80"/><circle cx="44" cy="30" r="8" fill="#22C55E"/><circle cx="30" cy="30" r="8" fill="#4ADE80"/>') },
		{ id: 'tomat', name: 'Tomat', svg: ic('<circle cx="32" cy="38" r="19" fill="#EF4444"/><path d="M32 20 q-2 -7 4 -10 q6 3 3 10" fill="#22C55E"/>') },
		{ id: 'jagung', name: 'Jagung', svg: ic('<path d="M20 20 q-3 12 0 24 q3 8 12 8 q9 0 12 -8 q3 -12 0 -24 q-3 -8 -12 -8 q-9 0 -12 8" fill="#FACC15"/><path d="M26 20 v24 M32 18 v28 M38 20 v24" stroke="#EAB308" stroke-width="2"/><path d="M24 14 q8 -6 16 0 q-6 4 -16 0" fill="#22C55E"/>') },
		{ id: 'kentang', name: 'Kentang', svg: ic('<ellipse cx="32" cy="38" rx="20" ry="14" fill="#C79A5B"/><circle cx="22" cy="32" r="2" fill="#8A6A38"/><circle cx="36" cy="44" r="2" fill="#8A6A38"/><circle cx="42" cy="34" r="2" fill="#8A6A38"/>') }
	],
	tubuh: [
		{ id: 'mata', name: 'Mata', svg: ic('<path d="M12 34 Q32 12 52 34 Q32 56 12 34 Z" fill="#fff" stroke="#FDE047" stroke-width="3"/><circle cx="32" cy="34" r="9" fill="#3B82F6"/><circle cx="32" cy="34" r="4.5" fill="#172554"/><circle cx="34.5" cy="31.5" r="1.6" fill="#fff"/>') },
		{ id: 'hidung', name: 'Hidung', svg: ic('<path d="M24 18 Q32 14 40 18 L44 30 Q32 40 20 30 Z" fill="#F9A8D4"/><circle cx="28" cy="27" r="1.8" fill="#9D174D"/><circle cx="36" cy="27" r="1.8" fill="#9D174D"/>') },
		{ id: 'mulut', name: 'Mulut', svg: ic('<path d="M14 34 Q32 58 50 34" stroke="#EF4444" stroke-width="6" fill="none" stroke-linecap="round"/>') },
		{ id: 'telinga', name: 'Telinga', svg: ic('<path d="M28 18 Q12 16 14 34 Q16 46 28 48 Q24 34 28 18 Z" fill="#F9A8D4"/><path d="M52 18 Q40 14 38 30 Q38 42 46 46 Q50 36 52 18 Z" fill="#F9A8D4"/>') },
		{ id: 'tangan', name: 'Tangan', svg: ic('<rect x="12" y="34" width="26" height="20" rx="8" fill="#F9A8D4"/><rect x="14" y="18" width="10" height="20" rx="5" fill="#F9A8D4"/><rect x="27" y="14" width="10" height="22" rx="5" fill="#F9A8D4"/><rect x="40" y="22" width="10" height="22" rx="5" fill="#F9A8D4"/>') },
		{ id: 'kaki', name: 'Kaki', svg: ic('<ellipse cx="32" cy="46" rx="15" ry="14" fill="#F9A8D4"/><circle cx="18" cy="18" r="5.5" fill="#F9A8D4"/><circle cx="30" cy="12" r="5.5" fill="#F9A8D4"/><circle cx="42" cy="16" r="5.5" fill="#F9A8D4"/><ellipse cx="30" cy="44" rx="6" ry="8" fill="#F472B6"/>') }
	],
	benda: [
		{ id: 'sendok', name: 'Sendok', svg: ic('<ellipse cx="32" cy="15" rx="11" ry="14" fill="#E2E8F0"/><path d="M32 28 L32 52" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>') },
		{ id: 'cangkir', name: 'Cangkir', svg: ic('<path d="M13 20 h32 v20 q0 9 -8 9 h-16 q-8 0 -8 -9 Z" fill="#60A5FA"/><path d="M45 24 h5 q8 0 8 9 q0 8 -8 9 h-5" fill="none" stroke="#60A5FA" stroke-width="5"/><ellipse cx="29" cy="20" rx="16" ry="5" fill="#93C5FD"/>') },
		{ id: 'sikat-gigi', name: 'Sikat Gigi', svg: ic('<rect x="12" y="38" width="34" height="9" rx="4.5" fill="#38BDF8"/><rect x="44" y="28" width="10" height="24" rx="4" fill="#F472B6"/><path d="M45 33 h8 M45 39 h8 M45 45 h8" stroke="#fff" stroke-width="2"/>') },
		{ id: 'sepatu', name: 'Sepatu', svg: ic('<path d="M10 38 Q26 30 44 36 Q55 40 56 46 Q56 54 44 54 L20 54 Q10 54 10 44 Z" fill="#EF4444"/><rect x="12" y="48" width="34" height="6" rx="3" fill="#FECACA"/><path d="M18 38 l3 -4 4 3 -3 4 Z" fill="#B91C1C"/>') },
		{ id: 'tas', name: 'Tas', svg: ic('<rect x="14" y="22" width="36" height="32" rx="9" fill="#F59E0B"/><path d="M26 22 Q32 14 38 22" fill="none" stroke="#F59E0B" stroke-width="5"/><rect x="26" y="34" width="12" height="4" rx="2" fill="#FEF3C7"/><rect x="16" y="44" width="8" height="4" rx="2" fill="#B45309"/><rect x="40" y="44" width="8" height="4" rx="2" fill="#B45309"/>') },
		{ id: 'kursi', name: 'Kursi', svg: ic('<rect x="12" y="16" width="40" height="9" rx="4" fill="#D97706"/><path d="M20 25 L20 56 M44 25 L44 56" stroke="#B45309" stroke-width="7" stroke-linecap="round"/><path d="M12 25 L12 40" stroke="#B45309" stroke-width="7" stroke-linecap="round"/>') }
	],
	rumah: [
		{ id: 'rumah', name: 'Rumah', svg: ic('<path d="M8 34 L32 12 L56 34 L52 34 L52 52 L40 52 L40 42 L24 42 L24 52 L12 52 L12 34 Z" fill="#FCD34D"/><path d="M8 34 L32 12 L56 34" stroke="#B45309" stroke-width="5" fill="none" stroke-linejoin="round"/><rect x="40" y="40" width="9" height="12" fill="#B45309"/>') },
		{ id: 'air', name: 'Air', svg: ic('<path d="M32 6 Q54 24 46 42 Q40 56 24 56 Q8 56 12 40 Q14 24 32 6 Z" fill="#60A5FA"/><path d="M20 34 Q26 30 32 34 Q38 38 44 34" stroke="#DBEAFE" stroke-width="4" fill="none" stroke-linecap="round"/>') },
		{ id: 'sarang', name: 'Sarang', svg: ic('<path d="M10 32 Q12 54 32 54 Q52 54 54 32 Q46 42 32 42 Q18 42 10 32 Z" fill="#B45309"/><path d="M8 30 Q32 18 56 30 Q32 26 8 30" fill="none" stroke="#78350F" stroke-width="4"/><ellipse cx="24" cy="44" rx="4.5" ry="6" fill="#DBEAFE"/><ellipse cx="36" cy="46" rx="4.5" ry="6" fill="#DBEAFE"/>') },
		{ id: 'gua', name: 'Gua', svg: ic('<path d="M7 56 V24 Q7 8 24 8 Q44 8 52 22 Q57 30 57 56 Z" fill="#A8A29E"/><path d="M20 56 V38 Q20 23 35 23 Q48 23 48 38 V56 Z" fill="#57534E"/><path d="M27 36 l2 -6 4 4" stroke="#A8A29E" stroke-width="2" fill="none"/>') },
		{ id: 'pohon', name: 'Pohon', svg: ic('<path d="M30 56 L34 56 L33 32 L31 32 Z" fill="#92400E"/><circle cx="32" cy="22" r="16" fill="#22C55E"/><circle cx="20" cy="28" r="10" fill="#16A34A"/><circle cx="44" cy="28" r="10" fill="#16A34A"/><circle cx="32" cy="34" r="8" fill="#15803D"/>') },
		{ id: 'hutan', name: 'Hutan', svg: ic('<path d="M14 56 L18 56 L17 34 L15 34 Z" fill="#92400E"/><path d="M6 38 L16 16 L26 38 Z" fill="#22C55E"/><path d="M40 56 L45 56 L44 26 L41 26 Z" fill="#78350F"/><path d="M32 32 L44 6 L56 32 Z" fill="#15803D"/><ellipse cx="30" cy="56" rx="10" ry="4" fill="#65A30D"/>') },
		{ id: 'kandang', name: 'Kandang', svg: ic('<rect x="7" y="18" width="50" height="34" rx="6" fill="#E7C79B"/><rect x="7" y="18" width="50" height="8" rx="4" fill="#B45309"/><path d="M16 26 V50 M24 26 V50 M32 26 V50 M40 26 V50 M48 26 V50" stroke="#8A6A38" stroke-width="3"/><path d="M12 50 Q32 58 52 50" stroke="#8A6A38" stroke-width="4" fill="none" stroke-linecap="round"/>') }
	],
	makanan: [
		{ id: 'wortel', name: 'Wortel', svg: ic('<path d="M22 18 L38 20 L30 54 L24 48 L20 30 Z" fill="#F97316"/><path d="M22 20 Q12 16 10 8 M22 20 Q14 8 20 4 M24 20 Q30 12 36 10" stroke="#22C55E" stroke-width="3" fill="none" stroke-linecap="round"/>') },
		{ id: 'ikan', name: 'Ikan', svg: ic('<ellipse cx="36" cy="32" rx="16" ry="12" fill="#60A5FA"/><path d="M14 32 L24 22 L24 42 Z" fill="#3B82F6"/><path d="M30 20 L38 12 L44 20 Z" fill="#3B82F6"/><circle cx="44" cy="30" r="2.8" fill="#172554"/>') },
		{ id: 'jagung', name: 'Jagung', svg: ic('<path d="M20 20 q-3 12 0 24 q3 8 12 8 q9 0 12 -8 q3 -12 0 -24 q-3 -8 -12 -8 q-9 0 -12 8" fill="#FACC15"/><path d="M26 20 v24 M32 18 v28 M38 20 v24" stroke="#EAB308" stroke-width="2"/><path d="M24 14 q8 -6 16 0 q-6 4 -16 0" fill="#22C55E"/>') },
		{ id: 'pisang', name: 'Pisang', svg: ic('<path d="M16 46 C16 18 40 8 52 16 C50 30 36 44 16 46 Z" fill="#FACC15"/><path d="M16 46 C20 32 30 22 44 16" stroke="#EAB308" stroke-width="2.5" fill="none"/><path d="M16 46 L11 51" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>') },
		{ id: 'bambu', name: 'Bambu', svg: ic('<path d="M24 56 L28 12" stroke="#22C55E" stroke-width="8" stroke-linecap="round"/><path d="M40 56 L36 12" stroke="#4ADE80" stroke-width="8" stroke-linecap="round"/><path d="M23 34 H31 M37 34 H45" stroke="#15803D" stroke-width="3"/>') },
		{ id: 'madu', name: 'Madu', svg: ic('<rect x="14" y="30" width="36" height="24" rx="7" fill="#F59E0B"/><rect x="18" y="24" width="28" height="9" rx="4" fill="#D97706"/><path d="M24 34 h4 M36 34 h4" stroke="#92400E" stroke-width="2"/><path d="M32 24 q-2 -6 4 -8" stroke="#D97706" stroke-width="3" fill="none"/>') },
		{ id: 'apel', name: 'Apel', svg: ic('<circle cx="32" cy="40" r="18" fill="#EF4444"/><ellipse cx="22" cy="50" rx="4.5" ry="7" fill="#F87171"/><path d="M32 24 q-4 -8 2 -12 q5 5 1 12" fill="#713F12"/><path d="M31 23 q-9 -3 -8 -11 q8 0 9 9" fill="#22C55E"/><path d="M24 32 q4 -2 6 -1" stroke="#FCA5A5" stroke-width="2" fill="none"/>') }
	],
};
export const BY: Record<string, Item> = {};
Object.values(SETS).flat().forEach(it => { BY[it.id] = it; });
export const MIXED = [...SETS.hewan, ...SETS.buah, ...SETS.bentuk, ...SETS.kendaraan, ...SETS.sayuran, ...SETS.tubuh, ...SETS.benda];
export const SHAPE_COLORS = ['#F97316', '#3B82F6', '#22C55E', '#8B5CF6', '#FACC15', '#EF4444'];

const ICON_PAL = '<svg class="ic" viewBox="0 0 64 64"><circle cx="24" cy="24" r="15" fill="#EF4444"/><circle cx="43" cy="24" r="15" fill="#3B82F6"/><circle cx="33" cy="43" r="15" fill="#FACC15"/></svg>';
const ICON_PAL2 = '<svg class="ic" viewBox="0 0 64 64"><rect x="8" y="15" width="48" height="14" rx="7" fill="#EF4444"/><rect x="8" y="35" width="48" height="14" rx="7" fill="#3B82F6"/></svg>';
const ICON_SHAPE = '<svg class="ic" viewBox="0 0 64 64"><circle cx="23" cy="22" r="12" fill="#F97316"/><rect x="36" y="10" width="19" height="19" rx="4" fill="#3B82F6"/><path d="M32 46 L50 46 L41 32 Z" fill="#22C55E"/></svg>';
const ICON_NUM = '<svg class="ic" viewBox="0 0 64 64"><text x="32" y="46" text-anchor="middle" font-size="30" font-weight="800" fill="#F59E0B" font-family="sans-serif">123</text></svg>';
const ICON_CMP = '<svg class="ic" viewBox="0 0 64 64"><circle cx="17" cy="19" r="8" fill="#F87171"/><circle cx="34" cy="19" r="8" fill="#F87171"/><circle cx="25" cy="35" r="8" fill="#F87171"/><rect x="44" y="12" width="9" height="9" rx="2" fill="#3B82F6"/><rect x="56" y="12" width="9" height="9" rx="2" fill="#3B82F6"/><rect x="50" y="25" width="9" height="9" rx="2" fill="#3B82F6"/></svg>';

/* ─── daftar permainan Seri 1 (17, semua playable) ───────────────────── */
const GAMES1: GameDef[] = [
	{ id: 'tebak-hewan', cat: 'kenali', name: 'Tebak Hewan', t: 'pick', set: 'hewan', audio: true, icon: BY.anjing.svg! },
	{ id: 'tebak-warna', cat: 'kenali', name: 'Tebak Warna', t: 'pick', set: 'warna', audio: true, icon: ICON_PAL },
	{ id: 'tebak-buah', cat: 'kenali', name: 'Tebak Buah', t: 'pick', set: 'buah', audio: true, icon: BY.apel.svg! },
	{ id: 'tebak-bentuk', cat: 'kenali', name: 'Tebak Bentuk', t: 'pick', set: 'bentuk', audio: true, icon: ICON_SHAPE },
	{ id: 'tebak-kendaraan', cat: 'kenali', name: 'Tebak Kendaraan', t: 'pick', set: 'kendaraan', audio: true, icon: BY.mobil.svg! },
	{ id: 'tebak-sayuran', cat: 'kenali', name: 'Tebak Sayuran', t: 'pick', set: 'sayuran', audio: true, icon: BY.wortel.svg! },
	{ id: 'tebak-tubuh', cat: 'kenali', name: 'Tebak Tubuh', t: 'pick', set: 'tubuh', audio: true, icon: BY.mata.svg! },
	{ id: 'tebak-benda', cat: 'kenali', name: 'Tebak Benda', t: 'pick', set: 'benda', audio: true, icon: BY.cangkir.svg! },
	{ id: 'cocok-warna', cat: 'cocokkan', name: 'Cocokkan Warna', t: 'pick', set: 'warna', similar: true, hideName: true, icon: ICON_PAL2 },
	{ id: 'cocok-bentuk', cat: 'cocokkan', name: 'Cocokkan Bentuk', t: 'pick', set: 'bentuk', vary: true, hideName: true, icon: ICON_SHAPE },
	{ id: 'cocok-hewan', cat: 'cocokkan', name: 'Cocokkan Hewan', t: 'pick', set: 'hewan', icon: BY.kucing.svg! },
	{
		id: 'hewan-rumah', cat: 'cocokkan', name: 'Hewan & Rumahnya', t: 'pair', audio: true,
		pairs: [{ from: BY.anjing, to: BY.rumah }, { from: BY.ikan, to: BY.air }, { from: BY.burung, to: BY.sarang }, { from: BY.monyet, to: BY.pohon }, { from: BY.beruang, to: BY.gua }, { from: BY.singa, to: BY.hutan }],
		fromPool: [BY.anjing, BY.ikan, BY.burung, BY.monyet, BY.beruang, BY.singa], toPool: SETS.rumah, icon: BY.anjing.svg!
	},
	{
		id: 'hewan-makanan', cat: 'cocokkan', name: 'Hewan & Makanannya', t: 'pair', audio: true,
		pairs: [{ from: BY.kelinci, to: BY.wortel }, { from: BY.kucing, to: BY.ikan }, { from: BY.ayam, to: BY.jagung }, { from: BY.monyet, to: BY.pisang }, { from: BY.beruang, to: BY.madu }, { from: BY.panda, to: BY.bambu }],
		fromPool: [BY.kelinci, BY.kucing, BY.ayam, BY.monyet, BY.beruang, BY.panda], toPool: SETS.makanan, icon: BY.kelinci.svg!
	},
	{ id: 'hitung-hewan', cat: 'hitung', name: 'Hitung Hewan', t: 'count', set: 'hewan', icon: BY.sapi.svg! },
	{ id: 'hitung-buah', cat: 'hitung', name: 'Hitung Buah', t: 'count', set: 'buah', icon: BY.stroberi.svg! },
	{ id: 'pilih-angka', cat: 'hitung', name: 'Pilih Angka', t: 'count', set: 'campur', icon: ICON_NUM },
	{ id: 'lebih-banyak', cat: 'hitung', name: 'Lebih Banyak', t: 'compare', set: 'hewan', icon: ICON_CMP }
];
const CATS1: Category[] = [
	{ id: 'kenali', name: 'Kenali', desc: 'Hewan, warna, buah & bentuk', chip: 'sun', icon: ICON_KENALI },
	{ id: 'cocokkan', name: 'Cocokkan', desc: 'Pasangkan yang sama & pasangan', chip: 'mint', icon: ICON_COCOK },
	{ id: 'hitung', name: 'Hitung', desc: 'Berhitung & membandingkan', chip: 'coral', icon: ICON_HITUNG }
];

/* ─── Seri 2: ikon & data baru ──────────────────────────────────────── */
const ICON_HOME = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z" fill="currentColor"/></svg>';
const ICON_USER = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 21a8 8 0 0 1 16 0Z" fill="currentColor"/></svg>';
const ICON_TROPHY = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v4a6 6 0 0 1-12 0Z" fill="currentColor"/><path d="M6 4H3v2a4 4 0 0 0 4 4M18 4h3v2a4 4 0 0 1-4 4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M12 13v4m-3 4h6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
const ICON_LOCK = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="3" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ICON_MCARD = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.5-4.2 6.1-.8Z" fill="currentColor"/></svg>';

const ICON_MEM = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="10" height="14" rx="3" fill="#60A5FA"/><rect x="9" y="7" width="10" height="14" rx="3" fill="#F59E0B"/><path d="M12 12v6m-3-3h6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_ODD = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="4" fill="#F59E0B"/><circle cx="14" cy="12" r="4" fill="#F59E0B"/><path d="m21 8-1.7 1.7L17 8l1.7-1.7L21 8Z" fill="#EF4444"/></svg>';
const ICON_UP = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="13" width="3.5" height="6" rx="1.2" fill="#F59E0B"/><rect x="10.2" y="9" width="3.5" height="10" rx="1.2" fill="#F97316"/><rect x="15.4" y="5" width="3.5" height="14" rx="1.2" fill="#34D399"/></svg>';
const ICON_PAT = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="12" r="3.4" fill="#F59E0B"/><rect x="12" y="8.6" width="7" height="6.8" rx="1.6" fill="#60A5FA"/></svg>';
export const ICON_MISS = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="#F59E0B" stroke-width="2.6"/><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="800" fill="#F59E0B" font-family="Avenir, sans-serif">?</text></svg>';
const ICON_PUZ = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h5v2.5a2.5 2.5 0 0 0 5 0V3h4v5h-2.5a2.5 2.5 0 0 0 0 5H20v5h-4v-2.5a2.5 2.5 0 0 0-5 0V18H6v-5h2.5a2.5 2.5 0 0 0 0-5H6Z" fill="#60A5FA" stroke="#F59E0B" stroke-width="2" stroke-linejoin="round"/></svg>';
const ICON_AB = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18" text-anchor="middle" font-size="15" font-weight="800" fill="#F97316" font-family="Avenir, sans-serif">Ab</text></svg>';
const ICON_AB2 = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><text x="6.5" y="17" text-anchor="middle" font-size="15" font-weight="800" fill="#F59E0B" font-family="Avenir, sans-serif">A</text><text x="17" y="17" text-anchor="middle" font-size="15" font-weight="800" fill="#3B82F6" font-family="Avenir, sans-serif">a</text></svg>';
const ICON_A1 = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18" text-anchor="middle" font-size="16" font-weight="800" fill="#EF4444" font-family="Avenir, sans-serif">A+</text></svg>';
const ICON_KATA = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="7" height="7" rx="2" fill="#F59E0B"/><rect x="14" y="6" width="7" height="7" rx="2" fill="#60A5FA"/><rect x="3" y="14" width="7" height="7" rx="2" fill="#34D399"/><rect x="14" y="14" width="7" height="7" rx="2" fill="#F472B6"/><text x="6.5" y="11" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Avenir, sans-serif">K</text><text x="17.5" y="11" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Avenir, sans-serif">A</text><text x="6.5" y="19" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Avenir, sans-serif">T</text><text x="17.5" y="19" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" font-family="Avenir, sans-serif">A</text></svg>';
const ICON_PIANO = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="4.5" height="14" rx="1.6" fill="#F59E0B"/><rect x="8.2" y="6" width="4.5" height="14" rx="1.6" fill="#EF4444"/><rect x="13.4" y="6" width="4.5" height="14" rx="1.6" fill="#3B82F6"/><rect x="18.6" y="6" width="4.5" height="14" rx="1.6" fill="#34D399"/><rect x="3" y="3" width="20" height="4" rx="2" fill="#A78BFA"/></svg>';
const ICON_DRUM = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11c0-3 3.6-5 8-5s8 2 8 5v2c0 3-3.6 5-8 5s-8-2-8-5Z" fill="#EF4444"/><path d="M12 6v10" stroke="#B91C1C" stroke-width="1.8"/><path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" fill="none" stroke="#F59E0B" stroke-width="2.4"/></svg>';
const ICON_CAT_LOGIC = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M12 9v6M9 12h6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
const ICON_CAT_HURUF = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="Avenir, sans-serif">Aa</text></svg>';
const ICON_CAT_KREATIF = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="4" fill="#fff"/><rect x="14" y="5" width="6" height="8" rx="2" fill="#fff" opacity=".85"/><path d="m6 16 3 3 3-6-3 3Z" fill="#fff" opacity=".85"/></svg>';

/** Letter pictograms used on the drum pads. */
export const DIC: Record<string, string> = {
	dum: '<circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="2.4"/>',
	tak: '<circle cx="12" cy="12" r="7" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="12" cy="12" r="2.6" fill="#fff"/>',
	sss: '<path d="M5 8h14M5 16h14M9 8v8M15 8v8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
	deng: '<ellipse cx="12" cy="12" rx="9" ry="6" fill="none" stroke="#fff" stroke-width="2.4"/>',
	tir: '<circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="12" cy="12" r="4.5" fill="#fff" opacity=".5"/>',
	pak: '<circle cx="8" cy="14" r="5" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="16" cy="10" r="5" fill="none" stroke="#fff" stroke-width="2.2"/>'
};

/** Similar-looking pairs for "Cari yang Berbeda" level 3. */
export const SIM: string[][] = [
	["apel", "stroberi"], ["anjing", "kucing"], ["sapi", "kelinci"], ["mobil", "bus"]
];
export const LET: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const WORDS = [
	{ w: "API", pic: null }, { w: "TAS", pic: BY.tas }, { w: "BOLA", pic: null },
	{ w: "IKAN", pic: BY.ikan }, { w: "SAPI", pic: BY.sapi }, { w: "APEL", pic: BY.apel },
	{ w: "RUMAH", pic: BY.rumah }, { w: "MOBIL", pic: BY.mobil }, { w: "MINUM", pic: null }
];

/* ─── daftar permainan Seri 2 (17, unlock berbasis bintang) ─────────── */
const GAMES2: GameDef[] = [
	{ id: "memory-card", t: "memory", sub: null, cat: "logika", name: "Memory Card", u: 0, icon: ICON_MEM, inst: "Ingat pasangannya!" },
	{ id: "cari-berbeda", t: "odd", sub: null, cat: "logika", name: "Cari yang Berbeda", u: 4, icon: ICON_ODD, inst: "Temukan yang berbeda!" },
	{ id: "urutkan-angka", t: "order", sub: "angka", cat: "logika", name: "Urutkan Angka", u: 8, icon: ICON_UP, inst: "Urutkan angkanya dari kecil ke besar!" },
	{ id: "urutkan-besar", t: "order", sub: "besar", cat: "logika", name: "Urutkan dari Terkecil", u: 12, icon: ICON_UP, inst: "Urutkan dari yang terkecil!" },
	{ id: "lanjutkan-pola", t: "pat", sub: null, cat: "logika", name: "Lanjutkan Pola", u: 16, icon: ICON_PAT, inst: "Lanjutkan polanya!" },
	{ id: "mana-hilang", t: "miss", sub: null, cat: "logika", name: "Mana yang Hilang?", u: 20, icon: ICON_MISS, inst: "Yang mana yang hilang?" },
	{ id: "puzzle-2-4", t: "puzzle", sub: null, cat: "logika", name: "Puzzle 2–4 Potong", u: 24, icon: ICON_PUZ, inst: "Pasang potongannya!" },
	{ id: "puzzle-6-9", t: "puzzle", sub: null, cat: "logika", name: "Puzzle 6–9 Potong", u: 28, icon: ICON_PUZ, inst: "Pasang potongannya!" },
	{ id: "tebak-huruf", t: "letter", sub: "tebak", cat: "huruf", name: "Tebak Huruf", u: 0, icon: ICON_AB, inst: "Kenali hurufnya!" },
	{ id: "huruf-besar-kecil", t: "letter", sub: "besar-kecil", cat: "huruf", name: "Huruf Besar & Kecil", u: 4, icon: ICON_AB2, inst: "Cari huruf kecilnya!" },
	{ id: "huruf-awal", t: "letter", sub: "awal", cat: "huruf", name: "Huruf Awal", u: 8, icon: ICON_A1, inst: "Apa huruf awalnya?" },
	{ id: "dengarkan-pilih", t: "letter", sub: "dengar", cat: "huruf", name: "Dengarkan & Pilih", u: 12, icon: ICON_SPEAK, inst: "Dengarkan, lalu pilih hurufnya!" },
	{ id: "susun-kata", t: "order", sub: "kata", cat: "huruf", name: "Susun Kata", u: 16, icon: ICON_KATA, inst: "Susun huruf jadi kata!" },
	{ id: "coloring", t: "color", sub: null, cat: "kreatif", name: "Mewarnai", u: 0, icon: ICON_MEM, inst: "Warnai gambarnya!" },
	{ id: "piano", t: "simon", sub: null, cat: "kreatif", name: "Piano", u: 4, icon: ICON_PIANO, inst: "Ikuti nadanya!" },
	{ id: "drum", t: "simon", sub: null, cat: "kreatif", name: "Drum", u: 8, icon: ICON_DRUM, inst: "Ikuti iramanya!" },
	{ id: "shape-builder", t: "build", sub: null, cat: "kreatif", name: "Shape Builder", u: 12, icon: ICON_ODD, inst: "Pasang bentuknya!" }
];

const CATS2: Category[] = [
	{ id: "logika", name: "Logika & Memori", desc: "Ingat & pikir", chip: "sun", icon: ICON_CAT_LOGIC },
	{ id: "huruf", name: "Huruf & Kata", desc: "Kenali huruf", chip: "mint", icon: ICON_CAT_HURUF },
	{ id: "kreatif", name: "Kreatif", desc: "Warna & musik", chip: "coral", icon: ICON_CAT_KREATIF }
];

export const GAMES: GameDef[] = [...GAMES1, ...GAMES2];
export const CATS: Category[] = [...CATS1, ...CATS2];

/** Series 1 games (always unlocked); series 2 are the ones with a `u` threshold. */
export const S1GAMES = GAMES.filter((g) => g.u === undefined);
export const S2GAMES = GAMES.filter((g) => g.u !== undefined);

/* ─── progres & unlock ──────────────────────────────────────────────── */
export const stOf = (id: string): number => load(`st.${id}`, 0);
export const lvOf = (id: string): number => load(`lv.${id}`, 1);
export const plOf = (id: string): number => load(`pl.${id}`, 0);

/** Total stars across both series — the currency for unlocking series 2. */
export const totalStars = (): number => GAMES.reduce((s, g) => s + stOf(g.id), 0);

export const unlocked = (id: string): boolean => {
	if (load("free", false)) return true;
	const g = GAMES.find((x) => x.id === id);
	return !g || totalStars() >= (g.u ?? 0);
};

export type Ach = { id: string; name: string; desc: string; test: () => boolean };

/* ─── pencapaian ────────────────────────────────────────────────────── */
export const ACH: Ach[] = [
	{ id: "first", name: "Pertama Kali", desc: "Main satu permainan Seri 2", test: () => GAMES.some((g) => plOf(g.id) > 0) },
	{ id: "b10", name: "Bintang 10", desc: "Kumpulkan 10 bintang", test: () => totalStars() >= 10 },
	{ id: "b50", name: "Bintang 50", desc: "Kumpulkan 50 bintang", test: () => totalStars() >= 50 },
	{ id: "memori", name: "Ingatan Kuat", desc: "Selesaikan Memory Card dengan 6+ bintang", test: () => stOf("memory-card") >= 6 },
	{ id: "puzzle", name: "Ahli Puzzle", desc: "Selesaikan Puzzle 6–9 Potong", test: () => stOf("puzzle-6-9") >= 1 },
	{ id: "abc", name: "ABC Keren", desc: "Mainkan kelima permainan huruf", test: () => ["tebak-huruf", "huruf-besar-kecil", "huruf-awal", "dengarkan-pilih", "susun-kata"].every((x) => plOf(x) > 0) },
	{ id: "logic", name: "Detektif Cilik", desc: "Mainkan 5 permainan logika", test: () => ["cari-berbeda", "urutkan-angka", "lanjutkan-pola", "mana-hilang", "puzzle-2-4"].every((x) => plOf(x) > 0) },
	{ id: "kreatif", name: "Seniman Kecil", desc: "Mainkan 3 permainan kreatif", test: () => ["coloring", "piano", "drum", "shape-builder"].filter((x) => plOf(x) > 0).length >= 3 },
	{ id: "sempurna", name: "Luar Biasa!", desc: "Dapatkan 8 bintang dalam satu permainan", test: () => GAMES.some((g) => stOf(g.id) >= 8) },
	{ id: "rajin", name: "Rajin", desc: "Bermain di 3 hari berbeda", test: () => load<string[]>("days", []).length >= 3 }
];

/** Award any newly-earned achievements; returns the ones unlocked this call. */
export function checkAch(): Ach[] {
	const news: Ach[] = [];
	ACH.forEach((a) => {
		if (load(`ach.${a.id}`, false)) return;
		if (a.test()) {
			save(`ach.${a.id}`, Date.now());
			news.push(a);
		}
	});
	return news;
}
