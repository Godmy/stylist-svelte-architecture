import type { HTMLAttributes } from 'svelte/elements';
import type { SVGAttributes } from 'svelte/elements';
import type { RecipeIdef0FunctionBox as Idef0FunctionBoxProps } from '$stylist/idef-zero/interface/recipe/idef0-function-box';

export function createIdef0FunctionBoxState(
	getProps: () => Idef0FunctionBoxProps & SVGAttributes<SVGGElement>
) {
	const props = $derived(getProps());
	const groupClasses = $derived(
		typeof props.class === 'string' ? `idef0-function-box ${props.class}` : 'idef0-function-box'
	);
	const x = $derived(props.x ?? 0);
	const y = $derived(props.y ?? 0);
	const width = $derived(props.width ?? 320);
	const height = $derived(props.height ?? 220);
	const centerX = $derived(x + width / 2);
	const centerY = $derived(y + height / 2);
	const titleY = $derived(centerY - (props.subtitle ? 10 : 0));
	const subtitleY = $derived(centerY + 14);

	return {
		get groupClasses() {
			return groupClasses;
		},
		get x() {
			return x;
		},
		get y() {
			return y;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get centerX() {
			return centerX;
		},
		get titleY() {
			return titleY;
		},
		get subtitleY() {
			return subtitleY;
		},
		get rectClasses() {
			return 'idef0-function-box__rect';
		},
		get titleClasses() {
			return 'idef0-function-box__title';
		},
		get subtitleClasses() {
			return 'idef0-function-box__subtitle';
		}
	};
}

export default createIdef0FunctionBoxState;
