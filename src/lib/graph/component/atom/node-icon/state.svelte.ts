import type { RecipeNodeIcon } from '$stylist/graph/interface/recipe/node-icon';

export function createNodeIconState(getProps: () => RecipeNodeIcon) {
	const props = $derived(getProps());
	const icon = $derived(props.icon ?? '📦');
	const size = $derived(props.size ?? 32);
	const accent = $derived(props.accent ?? 'var(--color-accent, #3498db)');
	const background = $derived(props.background ?? 'var(--color-surface-primary, #ffffff)');
	const iconStyle = $derived(`width: ${size}px; height: ${size}px; background: ${background};`);
	const iconTextStyle = $derived(`color: ${accent}; font-size: ${size * 0.6}px;`);

	return {
		get icon() {
			return icon;
		},
		get size() {
			return size;
		},
		get accent() {
			return accent;
		},
		get background() {
			return background;
		},
		get iconStyle() {
			return iconStyle;
		},
		get iconTextStyle() {
			return iconTextStyle;
		}
	};
}
