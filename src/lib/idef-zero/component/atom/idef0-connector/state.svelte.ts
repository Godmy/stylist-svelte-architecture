import type { HTMLAttributes } from 'svelte/elements';
import type { SVGAttributes } from 'svelte/elements';
import type { RecipeIdef0Connector as Idef0ConnectorProps } from '$stylist/idef-zero/interface/recipe/idef0-connector';

export function createIdef0ConnectorState(getProps: () => Idef0ConnectorProps & SVGAttributes<SVGGElement>) {
	const props = $derived(getProps());
	const groupClasses = $derived(
		typeof props.class === 'string' ? `idef0-connector ${props.class}` : 'idef0-connector'
	);
	const showArrow = $derived(props.showArrow ?? true);
	const isInput = $derived(props.direction === 'input');
	const color = $derived(props.color ?? 'var(--color-text-secondary)');
	const arrow = $derived.by(() => {
		if (!showArrow) return '';
		if (isInput) {
			return `${props.x2},${props.y2} ${props.x2 - 8},${props.y2 - 5} ${props.x2 - 8},${props.y2 + 5}`;
		}
		return `${props.x2},${props.y2} ${props.x2 + 8},${props.y2 - 5} ${props.x2 + 8},${props.y2 + 5}`;
	});
	const labelX = $derived(isInput ? props.x1 + 6 : props.x2 - 6);
	const labelAnchor = $derived(isInput ? 'start' : 'end');

	return {
		get groupClasses() {
			return groupClasses;
		},
		get showArrow() {
			return showArrow;
		},
		get color() {
			return color;
		},
		get arrow() {
			return arrow;
		},
		get labelX() {
			return labelX;
		},
		get labelAnchor() {
			return labelAnchor;
		},
		get lineClasses() {
			return 'idef0-connector__line';
		},
		get labelClasses() {
			return 'idef0-connector__label';
		}
	};
}

export default createIdef0ConnectorState;
