import type { RecipeStage } from '$stylist/workspace/interface/recipe/stage';

export function createStageState(getProps: () => RecipeStage) {
	const props = $derived(getProps());
	const camera = $derived(props.camera);
	const worldWidth = $derived(props.worldWidth ?? 10000);
	const worldHeight = $derived(props.worldHeight ?? 10000);
	const classes = $derived(
		['stage', typeof props.class === 'string' ? props.class : ''].filter(Boolean).join(' ')
	);
	const worldClass = $derived('world');
	const worldStyle = $derived(`--world-width: ${worldWidth}px; --world-height: ${worldHeight}px;`);
	const transformStyle = $derived(
		`transform: translate(${-camera.x}px, ${-camera.y}px) scale(${camera.zoom});`
	);
	const restProps = $derived.by(() => {
		const {
			class: _class,
			camera: _camera,
			worldWidth: _worldWidth,
			worldHeight: _worldHeight,
			children: _children,
			...rest
		} = props;
		return rest;
	});

	return {
		get camera() {
			return camera;
		},
		get worldWidth() {
			return worldWidth;
		},
		get worldHeight() {
			return worldHeight;
		},
		get classes() {
			return classes;
		},
		get worldClass() {
			return worldClass;
		},
		get worldStyle() {
			return worldStyle;
		},
		get transformStyle() {
			return transformStyle;
		},
		get restProps() {
			return restProps;
		}
	};
}

export default createStageState;
