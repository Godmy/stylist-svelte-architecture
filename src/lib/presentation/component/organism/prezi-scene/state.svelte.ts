import { Tween } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { SemanticZoomManager } from '$stylist/presentation/class/manager/semantic-zoom';
import { RECORD_FRAME } from '$stylist/presentation/const/record/frame/index';
import { FOCUS_DURATION_MS } from '$stylist/presentation/const/value/prezi-scene/index';
import { resolvePresenterSceneLinks } from '$stylist/presentation/function/script/scene/presenter';
import type { RecipePreziScene } from '$stylist/presentation/interface/recipe/prezi-scene';
import type { SceneNode } from '$stylist/presentation/interface/slot/scene-node';
import type { PreziCamera } from '$stylist/presentation/interface/slot/prezi-camera/index';
import type { RecipePreziSceneState } from '$stylist/presentation/interface/recipe/prezi-scene-state/index';
import type { BehaviorPreziSceneMethods } from '$stylist/presentation/interface/behavior/prezi-scene-methods';

/**
 * Hook для управления состоянием PreziScene.
 * Coordinate system: CSS-translate — transform: translate(x, y) scale(zoom) с origin 0 0.
 * Nodes внутри world-div используют raw position (не трансформированные).
 *
 * `getProps` вместо обычного объекта: пропсы читаются лениво на каждый вызов,
 * поэтому производные/эффекты ниже видят живые значения и сцена может
 * оставаться смонтированной между шагами презентации, плавно анимируя
 * камеру, а не пересоздаваться (что раньше требовалось родителю через
 * `{#key}`, потому что обычная деструктуризация объекта — это снимок один раз).
 */
export function usePreziState(
	getProps: () => RecipePreziScene
): RecipePreziSceneState & BehaviorPreziSceneMethods {
	const initialProps = getProps();
	const initialCamera = initialProps.initialCamera ?? { x: 0, y: 0, zoom: 1 };
	const initialDepth = initialProps.initialDepth ?? 0;

	const nodes = $derived(getProps().nodes ?? []);
	const title = $derived(getProps().title);
	const subtitle = $derived(getProps().subtitle);
	const panMode = $derived(getProps().panMode ?? 'drag');
	const zoomEnabled = $derived(getProps().zoomEnabled ?? true);
	const panEnabled = $derived(getProps().panEnabled ?? true);
	const minZoom = $derived(getProps().minZoom ?? 0.1);
	const maxZoom = $derived(getProps().maxZoom ?? 5);
	const animationDurationMs = $derived(getProps().animationDurationMs ?? FOCUS_DURATION_MS);
	const showGridProp = $derived(getProps().showGrid ?? true);
	const showMinimapProp = $derived(getProps().showMinimap ?? true);
	const showInspectorProp = $derived(getProps().showInspector ?? true);
	const showHeaderProp = $derived(getProps().showHeader ?? true);
	const showLinksProp = $derived(getProps().showLinks ?? false);
	const controlledSelectedNodeId = $derived(getProps().selectedNodeId);
	const targetCamera = $derived(getProps().targetCamera);
	const onNodeSelect = initialProps.onNodeSelect;
	const onCameraChange = initialProps.onCameraChange;
	const onDepthChange = initialProps.onDepthChange;

	let camera = $state<PreziCamera>({
		x: initialCamera.x,
		y: initialCamera.y,
		zoom: initialCamera.zoom,
		depth: initialDepth
	});

	// Depth drives per-node semantic-zoom stage (dot -> ... -> screen). Unlike
	// x/y/zoom (animated for free by the CSS transition on `worldStyle`), depth
	// is read synchronously by every node shell, so it needs its own tween —
	// otherwise every node's size/detail snaps instantly instead of growing
	// into view together with the camera flight ("diving into" a node).
	const depthTween = new Tween(initialDepth, {
		duration: initialProps.animationDurationMs ?? FOCUS_DURATION_MS,
		easing: cubicOut
	});

	let viewportWidth = $state(800);
	let viewportHeight = $state(600);
	let selectedNode = $state<SceneNode | null>(null);
	let selectedNodeId = $state<string | null>(initialProps.selectedNodeId ?? null);
	let isPanning = $state(false);
	let isAnimating = $state(false);
	let lastPointerX = 0;
	let lastPointerY = 0;
	let showGrid = $state(initialProps.showGrid ?? true);
	let showMinimap = $state(initialProps.showMinimap ?? true);
	let showInspector = $state(initialProps.showInspector ?? true);

	let animationTimer: ReturnType<typeof setTimeout> | null = null;
	let activeTransitionDurationMs = $state(initialProps.animationDurationMs ?? FOCUS_DURATION_MS);
	let flightToken = 0;

	// Sync toggle state when props change externally (e.g. workspace checkbox)
	$effect(() => {
	const props = $derived(getProps());
		showGrid = showGridProp;
	});
	$effect(() => {
		showMinimap = showMinimapProp;
	});
	$effect(() => {
		showInspector = showInspectorProp;
	});

	const clampZoom = (z: number) => Math.max(minZoom, Math.min(maxZoom, z));
	const nodeCamera = $derived({
		x: 0,
		y: 0,
		zoom: 1,
		depth: depthTween.current,
		viewportWidth,
		viewportHeight
	});
	const worldStyle = $derived.by(
		() =>
			`transform: translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom}); --prezi-animation-duration: ${activeTransitionDurationMs}ms;`
	);
	const sceneLinks = $derived(resolvePresenterSceneLinks(nodes));

	$effect(() => {
		if (controlledSelectedNodeId === undefined) return;

		if (controlledSelectedNodeId === null) {
			selectNode(null);
			return;
		}

		const node = nodes.find((candidate) => candidate.id === controlledSelectedNodeId) ?? null;
		if (node) {
			selectNode(node);
		}
	});

	let lastAppliedTargetCamera: { x: number; y: number; zoom: number; depth: number } | null = null;

	$effect(() => {
		const next = targetCamera;
		if (!next) return;

		const previous = lastAppliedTargetCamera;
		const isUnchanged =
			previous !== null &&
			previous.x === next.x &&
			previous.y === next.y &&
			previous.zoom === next.zoom &&
			previous.depth === next.depth;

		if (isUnchanged) return;

		const isFirstApplication = previous === null;
		lastAppliedTargetCamera = next;

		if (isFirstApplication) {
			setCamera({ x: next.x, y: next.y, zoom: next.zoom, depth: next.depth });
		} else {
			void flyTo(next, previous);
		}

		onDepthChange?.(next.depth);
	});

	const setCamera = (next: Partial<PreziCamera>, durationMs = animationDurationMs) => {
		camera = { ...camera, ...next };
		if (next.depth !== undefined) {
			void depthTween.set(next.depth, { duration: durationMs, easing: cubicOut });
		}
		onCameraChange?.({ x: camera.x, y: camera.y, zoom: camera.zoom });
	};

	const setViewportSize = (width: number, height: number) => {
		viewportWidth = Math.max(1, width);
		viewportHeight = Math.max(1, height);
	};

	const viewport = (element: HTMLDivElement) => {
		const syncViewportSize = () => {
			setViewportSize(element.clientWidth, element.clientHeight);
		};

		syncViewportSize();

		const observer = new ResizeObserver(() => {
			syncViewportSize();
		});

		observer.observe(element);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	};

	const selectNode = (node: SceneNode | null) => {
		selectedNode = node;
		selectedNodeId = node?.id ?? null;
		onNodeSelect?.(node);
	};

	const startAnimation = (durationMs = animationDurationMs) => {
		if (animationTimer !== null) clearTimeout(animationTimer);
		activeTransitionDurationMs = durationMs;
		isAnimating = true;
		animationTimer = setTimeout(() => {
			isAnimating = false;
			animationTimer = null;
		}, durationMs);
	};

	const toWorldPoint = (point: { x: number; y: number; zoom: number }) => ({
		x: (viewportWidth / 2 - point.x) / point.zoom,
		y: (viewportHeight / 2 - point.y) / point.zoom
	});

	/**
	 * Prezi-style flight between two arbitrary camera states.
	 *
	 * A direct linear tween of x/y/zoom feels wrong for long jumps: at a high
	 * zoom the camera would slide sideways across mostly-empty canvas instead
	 * of the classic Prezi "pull back to see the map, glide, dive back in".
	 * When the two targets are far apart in world space, this pulls back to a
	 * zoomed-out midpoint first, then dives into the destination — otherwise
	 * (adjacent nodes, same branch) it flies straight there.
	 */
	const flyTo = async (
		next: { x: number; y: number; zoom: number; depth: number },
		previous: { x: number; y: number; zoom: number; depth: number }
	) => {
		const token = ++flightToken;
		const totalDuration = animationDurationMs;

		const from = toWorldPoint(previous);
		const to = toWorldPoint(next);
		const worldDistance = Math.hypot(to.x - from.x, to.y - from.y);
		const isZoomedIn = Math.min(previous.zoom, next.zoom) > clampZoom(0.6);
		const isFarJump = worldDistance > 480;

		if (!isFarJump || !isZoomedIn) {
			startAnimation(totalDuration);
			setCamera({ x: next.x, y: next.y, zoom: next.zoom, depth: next.depth }, totalDuration);
			return;
		}

		const midWorld = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
		const padding = 220;
		const boundsWidth = Math.max(Math.abs(to.x - from.x) + padding * 2, 1);
		const boundsHeight = Math.max(Math.abs(to.y - from.y) + padding * 2, 1);
		const fitZoom = Math.min(viewportWidth / boundsWidth, viewportHeight / boundsHeight);
		const pullBackZoom = clampZoom(Math.min(fitZoom, Math.min(previous.zoom, next.zoom) * 0.6));
		const midCamera = {
			x: viewportWidth / 2 - midWorld.x * pullBackZoom,
			y: viewportHeight / 2 - midWorld.y * pullBackZoom,
			zoom: pullBackZoom
		};

		const outDuration = Math.round(totalDuration * 0.45);
		const inDuration = Math.max(1, totalDuration - outDuration);

		startAnimation(outDuration);
		setCamera({ x: midCamera.x, y: midCamera.y, zoom: midCamera.zoom }, outDuration);

		await new Promise((resolve) => setTimeout(resolve, outDuration));
		if (token !== flightToken) return;

		startAnimation(inDuration);
		setCamera({ x: next.x, y: next.y, zoom: next.zoom, depth: next.depth }, inDuration);
	};

	/**
	 * Prezi-zoom: центрируем ноду и зумируем так, чтобы она занимала ~88% вьюпорта.
	 * screen-frame (520×320) — максимальная детализация при distance=0.
	 */
	const focusNode = (node: SceneNode) => {
		const screenFrame = RECORD_FRAME['screen'];
		const targetZoom = clampZoom(
			Math.min(
				(viewportWidth * 0.88) / screenFrame.width,
				(viewportHeight * 0.88) / screenFrame.height
			)
		);

		startAnimation();
		setCamera({
			x: viewportWidth / 2 - node.position.x * targetZoom,
			y: viewportHeight / 2 - node.position.y * targetZoom,
			zoom: targetZoom,
			depth: node.depth
		});
		selectNode(node);
		onDepthChange?.(node.depth);
	};

	const resetCamera = () => {
		startAnimation();
		setCamera({
			x: initialCamera.x,
			y: initialCamera.y,
			zoom: initialCamera.zoom,
			depth: initialDepth
		});
		selectNode(null);
		onDepthChange?.(initialDepth);
	};

	const stepDepth = (delta: number) => {
		const newDepth = Math.max(0, Math.min(1000, camera.depth + delta));
		setCamera({ depth: newDepth });
		onDepthChange?.(newDepth);
	};

	const handleWheel = (event: WheelEvent, viewportRect?: DOMRect) => {
		if (!zoomEnabled) return;
		event.preventDefault();

		const factor = event.deltaY < 0 ? 1.12 : 1 / 1.12;
		const newZoom = clampZoom(camera.zoom * factor);

		const bounds =
			viewportRect ??
			(event.currentTarget as HTMLDivElement | null)?.getBoundingClientRect() ??
			undefined;

		if (bounds) {
			const mouseX = event.clientX - bounds.left;
			const mouseY = event.clientY - bounds.top;
			const worldX = (mouseX - camera.x) / camera.zoom;
			const worldY = (mouseY - camera.y) / camera.zoom;
			setCamera({
				zoom: newZoom,
				x: mouseX - worldX * newZoom,
				y: mouseY - worldY * newZoom
			});
		} else {
			setCamera({ zoom: newZoom });
		}
	};

	const handlePointerDown = (event: PointerEvent) => {
		if (!panEnabled || event.button !== 0) return;
		isPanning = true;
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (!isPanning || !panEnabled) return;
		const dx = event.clientX - lastPointerX;
		const dy = event.clientY - lastPointerY;
		setCamera({ x: camera.x + dx, y: camera.y + dy });
		lastPointerX = event.clientX;
		lastPointerY = event.clientY;
	};

	const handlePointerUp = (event: PointerEvent) => {
		if (!isPanning) return;
		isPanning = false;
		try {
			(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		} catch {
			// pointerleave может прийти без предшествующего capture
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		const step = 60 / camera.zoom;

		switch (event.key) {
			case 'ArrowLeft':
				event.preventDefault();
				if (panEnabled) setCamera({ x: camera.x + step });
				break;
			case 'ArrowRight':
				event.preventDefault();
				if (panEnabled) setCamera({ x: camera.x - step });
				break;
			case 'ArrowUp':
				event.preventDefault();
				if (panEnabled) setCamera({ y: camera.y + step });
				break;
			case 'ArrowDown':
				event.preventDefault();
				if (panEnabled) setCamera({ y: camera.y - step });
				break;
			case '+':
			case '=':
				event.preventDefault();
				if (zoomEnabled) setCamera({ zoom: clampZoom(camera.zoom * 1.12) });
				break;
			case '-':
			case '_':
				event.preventDefault();
				if (zoomEnabled) setCamera({ zoom: clampZoom(camera.zoom / 1.12) });
				break;
			case '0':
				event.preventDefault();
				resetCamera();
				break;
			case 'Escape':
				event.preventDefault();
				selectNode(null);
				break;
		}
	};

	const getPresentation = (node: SceneNode) =>
		SemanticZoomManager.resolveNode(node, depthTween.current);

	return {
		get camera() {
			return camera;
		},
		get viewportWidth() {
			return viewportWidth;
		},
		get viewportHeight() {
			return viewportHeight;
		},
		get selectedNode() {
			return selectedNode;
		},
		get selectedNodeId() {
			return selectedNodeId;
		},
		get isPanning() {
			return isPanning;
		},
		get isAnimating() {
			return isAnimating;
		},
		get showGrid() {
			return showGrid;
		},
		get showMinimap() {
			return showMinimap;
		},
		get showInspector() {
			return showInspector;
		},
		get showLinks() {
			return showLinksProp;
		},
		get showHeader() {
			return showHeaderProp;
		},
		get title() {
			return title;
		},
		get subtitle() {
			return subtitle;
		},
		get panMode() {
			return panMode;
		},
		get zoomEnabled() {
			return zoomEnabled;
		},
		get panEnabled() {
			return panEnabled;
		},
		get minZoom() {
			return minZoom;
		},
		get maxZoom() {
			return maxZoom;
		},
		get nodeCamera() {
			return nodeCamera;
		},
		get nodes() {
			return nodes;
		},
		get sceneLinks() {
			return sceneLinks;
		},
		get worldStyle() {
			return worldStyle;
		},
		setCamera,
		setViewportSize,
		viewport,
		selectNode,
		toggleGrid: () => {
			showGrid = !showGrid;
		},
		toggleMinimap: () => {
			showMinimap = !showMinimap;
		},
		handleWheel,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		handleKeyDown,
		focusNode,
		resetCamera,
		stepDepth,
		getPresentation
	};
}

export default usePreziState;
