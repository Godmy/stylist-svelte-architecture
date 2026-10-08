import { ClassNamesManager } from '$stylist/layout/class/manager/class-names';
import { SceneObjectManager } from '$stylist/graph/class/manager/scene/index';
import type { RecipeScene } from '$stylist/graph/interface/recipe/scene';
import type { SceneDebugInfo } from '$stylist/graph/interface/slot/scene-debug-info';

const DEFAULT_SCENE_TITLE = 'WebGL Graph';
const DEFAULT_SCENE_ROTATE_HINT = 'LMB + drag to orbit the camera';
const DEFAULT_SCENE_ZOOM_HINT = 'Mouse wheel to zoom';
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

	const title = $derived(props.title ?? DEFAULT_SCENE_TITLE);
	const rotateHint = $derived(props.rotateHint ?? DEFAULT_SCENE_ROTATE_HINT);
	const zoomHint = $derived(props.zoomHint ?? DEFAULT_SCENE_ZOOM_HINT);
	const containerClass = $derived(ClassNamesManager.merge('scene', props.class?.toString() ?? ''));
	const canvasClass = $derived(
		ClassNamesManager.merge('scene__canvas', props.canvasClass?.toString() ?? '')
	);
	const overlayClass = $derived(
		ClassNamesManager.merge('scene__overlay', props.overlayClass?.toString() ?? '')
	);
	const restProps = $derived.by(() => {
		const {
			title: _title,
			rotateHint: _rotateHint,
			zoomHint: _zoomHint,
			canvasClass: _canvasClass,
			overlayClass: _overlayClass,
			class: _class,
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
			sceneManager.start(canvas);
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
