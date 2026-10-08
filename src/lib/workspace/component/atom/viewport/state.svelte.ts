import type { RecipeViewport } from '$stylist/workspace/interface/recipe/viewport';

export function createViewportState(getProps: () => RecipeViewport) {
	const props = $derived(getProps());
	let isDragging = $state(false);
	let lastX = $state(0);
	let lastY = $state(0);

	const camera = $derived(props.camera);
	const interactive = $derived(props.interactive ?? true);
	const showGrid = $derived(props.showGrid ?? false);
	const worldWidth = $derived(props.worldWidth ?? 10000);
	const worldHeight = $derived(props.worldHeight ?? 10000);
	const classes = $derived(
		['viewport', isDragging ? 'dragging' : '', typeof props.class === 'string' ? props.class : '']
			.filter(Boolean)
			.join(' ')
	);
	const restProps = $derived.by(() => {
		const {
			class: _class,
			camera: _camera,
			interactive: _interactive,
			showGrid: _showGrid,
			worldWidth: _worldWidth,
			worldHeight: _worldHeight,
			children: _children,
			...rest
		} = props;
		return rest;
	});

	function handleMouseDown(event: MouseEvent): void {
		if (!interactive) return;
		isDragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
	}

	function handleMouseMove(event: MouseEvent): void {
		if (!interactive || !isDragging) return;
		const dx = event.clientX - lastX;
		const dy = event.clientY - lastY;
		camera.x -= dx / camera.zoom;
		camera.y -= dy / camera.zoom;
		lastX = event.clientX;
		lastY = event.clientY;
	}

	function handleMouseUp(): void {
		isDragging = false;
	}

	function handleWheel(event: WheelEvent): void {
		if (!interactive) return;
		event.preventDefault();
		const delta = -event.deltaY * 0.001;
		camera.zoom = Math.max(0.1, Math.min(5, camera.zoom * (1 + delta)));
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (!interactive) return;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				camera.x -= 60 / camera.zoom;
				break;
			case 'ArrowRight':
				event.preventDefault();
				camera.x += 60 / camera.zoom;
				break;
			case 'ArrowUp':
				event.preventDefault();
				camera.y -= 60 / camera.zoom;
				break;
			case 'ArrowDown':
				event.preventDefault();
				camera.y += 60 / camera.zoom;
				break;
			case '+':
			case '=':
				event.preventDefault();
				camera.zoom = Math.min(5, camera.zoom * 1.12);
				break;
			case '-':
			case '_':
				event.preventDefault();
				camera.zoom = Math.max(0.1, camera.zoom / 1.12);
				break;
			case '0':
				event.preventDefault();
				camera.zoom = 1;
				break;
		}
	}

	return {
		get camera() {
			return camera;
		},
		get interactive() {
			return interactive;
		},
		get showGrid() {
			return showGrid;
		},
		get worldWidth() {
			return worldWidth;
		},
		get worldHeight() {
			return worldHeight;
		},
		get isDragging() {
			return isDragging;
		},
		get classes() {
			return classes;
		},
		get restProps() {
			return restProps;
		},
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleWheel,
		handleKeyDown
	};
}

export default createViewportState;
