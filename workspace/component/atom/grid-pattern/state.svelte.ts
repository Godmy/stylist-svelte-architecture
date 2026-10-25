import type { RecipeGridPattern } from '$stylist/workspace/interface/recipe/grid-pattern';

export function createGridPatternState(getProps: () => RecipeGridPattern) {
	const props = $derived(getProps());
	const gridSize = $derived(props.gridSize ?? 50);
	const zoom = $derived(props.zoom ?? 1);
	const visible = $derived(props.visible ?? true);
	const color = $derived(props.color ?? 'var(--color-border-subtle, #e0e0e0)');
	const hostClass = $derived(typeof props.class === 'string' ? props.class : '');
	const scaledSize = $derived(gridSize * zoom);
	const svgStyle = $derived(`--grid-color: ${color}; --grid-opacity: ${visible ? 1 : 0};`);

	const restProps = $derived.by(() => {
		const {
			gridSize: _gridSize,
			zoom: _zoom,
			visible: _visible,
			color: _color,
			class: _class,
			...rest
		} = props;

		return rest;
	});

	return {
		get gridSize() {
			return gridSize;
		},
		get zoom() {
			return zoom;
		},
		get visible() {
			return visible;
		},
		get color() {
			return color;
		},
		get hostClass() {
			return hostClass;
		},
		get scaledSize() {
			return scaledSize;
		},
		get svgStyle() {
			return svgStyle;
		},
		get restProps() {
			return restProps;
		}
	};
}

export default createGridPatternState;
