/**
 * Converts a CSS color into a value the 2D canvas context accepts.
 * The context ignores `var(--token)`, so custom properties are read from
 * `element` (or the document root); an unresolved variable uses its own
 * fallback, then `fallback`.
 */
export function canvasColor(
	value: string | null | undefined,
	element?: Element | null,
	fallback = '#111827'
): string {
	const color = value?.trim();
	if (!color) return fallback;

	const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/s.exec(color);
	if (!match) return color;

	const [, name, variableFallback] = match;
	const source = element ?? (typeof document !== 'undefined' ? document.documentElement : null);
	const computed =
		source && typeof getComputedStyle === 'function'
			? getComputedStyle(source).getPropertyValue(name).trim()
			: '';

	if (computed) return canvasColor(computed, element, fallback);
	return variableFallback ? canvasColor(variableFallback, element, fallback) : fallback;
}
