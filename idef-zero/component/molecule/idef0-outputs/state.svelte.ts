import type { HTMLAttributes } from 'svelte/elements';
import type { RecipeIdef0Io } from '$stylist/idef-zero/interface/recipe/idef0-io';

export function createIdef0OutputsState(getProps: () => RecipeIdef0Io & HTMLAttributes<HTMLDivElement>) {
	const props = $derived(getProps());
	const boxWidth = $derived(props.boxWidth ?? 0);
	const startX = $derived(props.boxX + boxWidth);
	const endX = $derived(props.endX ?? props.boxX + boxWidth + 140);
	const positions = $derived.by(() => {
		if (props.ports.length === 0) return [];
		const top = props.boxY ?? 0;
		const step = props.boxHeight / (props.ports.length + 1);
		return props.ports.map((port, index) => ({ port, y: top + step * (index + 1) }));
	});

	return {
		get startX() {
			return startX;
		},
		get endX() {
			return endX;
		},
		get positions() {
			return positions;
		}
	};
}

export default createIdef0OutputsState;
