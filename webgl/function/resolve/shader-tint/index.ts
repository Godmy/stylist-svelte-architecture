/** Convert a `#rrggbb` color into normalized shader RGB; invalid input falls back to `fallback`. */
export function shaderTint(color: string, fallback = '#80b7eb'): [number, number, number] {
	const hex = /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
	const value = parseInt(hex.slice(1), 16);
	return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}
