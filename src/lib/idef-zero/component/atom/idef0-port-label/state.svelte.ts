import type { HTMLAttributes } from 'svelte/elements';
import type { RecipeIdef0PortLabel } from '$stylist/idef-zero/interface/recipe/idef0-port-label';

export function createIdef0PortLabelState(
	getProps: () => RecipeIdef0PortLabel & HTMLAttributes<HTMLSpanElement>
) {
	const props = $derived(getProps());
	const classes = $derived(
		typeof props.class === 'string' ? `idef0-port-label ${props.class}` : 'idef0-port-label'
	);

	return {
		get classes() {
			return classes;
		}
	};
}

export default createIdef0PortLabelState;
