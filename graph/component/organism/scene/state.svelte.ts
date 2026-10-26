import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import { SceneObjectManager } from '$stylist/graph/class/manager/scene/index';
import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import type { RecipeScene } from '$stylist/graph/interface/recipe/scene';
import type { SceneDebugInfo } from '$stylist/graph/interface/slot/scene-debug-info';
import { GRAPH_SCENE_MESSAGE } from '$stylist/graph/const/record/scene-message';
import { useMessage } from '$stylist/localization/function/hook/use-message';

const DEFAULT_CAMERA_CONTROL = {
	radius: 18,
	minRadius: 2,
	maxRadius: 50,
	sceneFitRadius: 18,
	targetX: 0,
	targetY: 0,
	targetZ: 0,
	horizontalAngle: 0.72,
	verticalAngle: 0.42
};

export function createSceneState(getProps: () => RecipeScene) {
	const props = $derived(getProps());
	const t = useMessage('scene', GRAPH_SCENE_MESSAGE);
	const sceneManager = new SceneObjectManager();
	let cameraControl = $state(DEFAULT_CAMERA_CONTROL);
	let debugInfo = $state<SceneDebugInfo>({
		mounted: false,
		context: 'none',
		glVersion: 'none',
		glslVersion: 'none',
		programLinked: false,
		uniformsReady: false,
		cubeReady: false,
		depthTest: false,
		canvasClient: 'none',
		canvasBuffer: 'none',
		viewport: 'none',
		devicePixelRatio: '1.00',
		drawCount: 0,
		lastError: null,
		cameraPosition: 'none',
		radius: '0.00',
		angles: '0.00, 0.00',
		cubeRotation: '0.00',
		sceneObjects: 0,
		graphNodes: 0,
		graphConnections: 0,
		sceneFitRadius: '0.00',
		sceneMolecules: 0,
		cameraPreset: 'iso',
		hoveredAtom: 'none',
		selectedAtom: 'none',
		selectedMolecule: 'none',
		shaderProfile: 'unknown'
	});
	let debugTimer: ReturnType<typeof setInterval> | null = null;

	const title = $derived(props.title ?? t('title'));
	const rotateHint = $derived(props.rotateHint ?? t('rotate'));
	const zoomHint = $derived(props.zoomHint ?? t('zoom'));
	const containerClass = $derived(ClassNamesManager.merge('scene', props.class?.toString() ?? ''));
	const canvasClass = $derived(
		ClassNamesManager.merge('scene__canvas', props.canvasClass?.toString() ?? '')
	);
	const overlayClass = $derived(
		ClassNamesManager.merge('scene__overlay', props.overlayClass?.toString() ?? '')
	);
	const text = $derived({
		nodes: props.text?.nodes ?? 'nodes',
		links: props.text?.links ?? 'links',
		frames: props.text?.frames ?? 'frames',
		selected: props.text?.selected ?? 'selected'
	});
	const restProps = $derived.by(() => {
		const {
			title: _title,
			rotateHint: _rotateHint,
			zoomHint: _zoomHint,
			canvasClass: _canvasClass,
			overlayClass: _overlayClass,
			class: _class,
			nodes: _nodes,
			connections: _connections,
			text: _text,
			theme: _theme,
			...rest
		} = props;

		return rest;
	});

	function mount(canvas: HTMLCanvasElement | null): void {
		if (!canvas) return;

		debugInfo = {
			...debugInfo,
			mounted: true,
			canvasClient: `${canvas.clientWidth}x${canvas.clientHeight}`,
			canvasBuffer: `${canvas.width}x${canvas.height}`,
			lastError: null
		};

		try {
			const light = props.theme === 'light';
			if (light) sceneManager.setBackground([0.965, 0.957, 0.94]);
			sceneManager.start(
				canvas,
				props.nodes
					? GraphScriptManager.createSceneGraph(props.nodes, props.connections ?? [], {
							label: title,
							...(light && { floorColor: [0.9, 0.88, 0.84], nodeColor: [0.36, 0.4, 0.48] })
						})
					: undefined
			);
			debugInfo = sceneManager.getDebugInfo();
			cameraControl = sceneManager.getCameraControlInfo();
		} catch (error) {
			debugInfo = {
				...debugInfo,
				lastError: error instanceof Error ? error.message : String(error)
			};
			return;
		}

		if (debugTimer !== null) {
			clearInterval(debugTimer);
		}

		debugTimer = setInterval(() => {
			debugInfo = sceneManager.getDebugInfo();
			cameraControl = sceneManager.getCameraControlInfo();
		}, 120);
	}

	function setCameraRadius(radius: number): void {
		sceneManager.setCameraRadius(radius);
		cameraControl = sceneManager.getCameraControlInfo();
		debugInfo = sceneManager.getDebugInfo();
	}

	function setCameraTarget(x: number, y: number): void {
		sceneManager.setCameraTarget(x, y);
		cameraControl = sceneManager.getCameraControlInfo();
		debugInfo = sceneManager.getDebugInfo();
	}

	function destroy(): void {
		if (debugTimer !== null) {
			clearInterval(debugTimer);
			debugTimer = null;
		}

		sceneManager.stop();
	}

	return {
		get title() {
			return title;
		},
		get rotateHint() {
			return rotateHint;
		},
		get zoomHint() {
			return zoomHint;
		},
		get containerClass() {
			return containerClass;
		},
		get canvasClass() {
			return canvasClass;
		},
		get overlayClass() {
			return overlayClass;
		},
		get restProps() {
			return restProps;
		},
		get text() {
			return text;
		},
		get theme() {
			return props.theme ?? 'dark';
		},
		get debugInfo() {
			return debugInfo;
		},
		get cameraControl() {
			return cameraControl;
		},
		setCameraRadius,
		setCameraTarget,
		mount,
		destroy
	};
}

export default createSceneState;
