import type { HTMLAttributes } from 'svelte/elements';
import type { RecipeIdef0Diagram } from '$stylist/idef-zero/interface/recipe/idef0-diagram';

export function createIdef0DiagramState(
	getProps: () => RecipeIdef0Diagram & HTMLAttributes<HTMLDivElement>
) {
	const props = $derived(getProps());
	const containerClasses = $derived(
		typeof props.class === 'string' ? `idef0-diagram ${props.class}` : 'idef0-diagram'
	);
	const svgClasses = $derived('idef0-diagram__svg');
	const width = $derived(props.width ?? 960);
	const height = $derived(props.height ?? 460);

	return {
		get containerClasses() {
			return containerClasses;
		},
		get svgClasses() {
			return svgClasses;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		}
	};
}

export default createIdef0DiagramState;
