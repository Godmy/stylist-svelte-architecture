import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import { Camera } from '$stylist/graph/class/manager/camera';
import type { SceneBufferSet } from '$stylist/graph/interface/slot/scene-buffer-set';
import type { SceneDebugInfo } from '$stylist/graph/interface/slot/scene-debug-info';
import type { SceneAtom } from '$stylist/graph/interface/slot/scene-atom';
import type { SceneCameraPreset } from '$stylist/graph/type/alias/scene-camera-preset';
import type { SceneGraph } from '$stylist/graph/interface/slot/scene-graph';
import vertexBasic from '$stylist/graph/data/shader/vertex/base.vert?raw';
import fragmentBasic from '$stylist/graph/data/shader/fragment/base.frag?raw';

export class SceneObjectManager {
	private static readonly CAMERA_FOV = Math.PI / 4;
	private static readonly PRESET_ANGLES: Record<
		SceneCameraPreset,
		{ horizontal: number; vertical: number }
	> = {
		iso: { horizontal: 0.72, vertical: 0.42 },
		top: { horizontal: 0.0001, vertical: 1.22 },
		front: { horizontal: 0, vertical: 0.08 }
	};

	private canvas: HTMLCanvasElement | null = null;
	private gl: WebGL2RenderingContext | null = null;
	private animationFrameId: number | null = null;
	private program: WebGLProgram | null = null;
	private sceneGraph: SceneGraph | null = null;
	private sceneAtoms: readonly SceneAtom[] = [];
	private atomBuffers = new Map<string, SceneBufferSet>();
	private modelLocation: WebGLUniformLocation | null = null;
	private viewLocation: WebGLUniformLocation | null = null;
	private projectionLocation: WebGLUniformLocation | null = null;
	private tintColorLocation: WebGLUniformLocation | null = null;
	private tintStrengthLocation: WebGLUniformLocation | null = null;
	private camera: Camera | null = null;
	private focusTarget: [number, number, number] = [0, 0, 0];
	private cameraPreset: SceneCameraPreset = 'iso';
	private horizontalAngle = SceneObjectManager.PRESET_ANGLES.iso.horizontal;
	private verticalAngle = SceneObjectManager.PRESET_ANGLES.iso.vertical;
	private radius = 18;
	private sceneFitRadius = 18;
	private cubeRotation = 0;
	private drawCount = 0;
	private lastError: string | null = null;
	private isDragging = false;
	private pointerDownX = 0;
	private pointerDownY = 0;
	private lastMouseX = 0;
	private lastMouseY = 0;
	private hasFittedScene = false;
	private hoveredAtomId: string | null = null;
	private selectedAtomId: string | null = 'node-graph-core';

	start(canvas: HTMLCanvasElement): void {
		if (this.canvas === canvas && this.gl) {
			return;
		}

		this.stop();
		this.canvas = canvas;
		this.gl = canvas.getContext('webgl2');

		if (!this.gl) {
			this.lastError = 'WebGL2 is required for the current scene shader pipeline';
			throw new Error(this.lastError);
		}

		this.lastError = null;
		this.program = GraphScriptManager.createSceneProgram(this.gl, vertexBasic, fragmentBasic);
		this.gl.useProgram(this.program);

		this.modelLocation = this.gl.getUniformLocation(this.program, 'uModelMatrix');
		this.viewLocation = this.gl.getUniformLocation(this.program, 'uViewMatrix');
		this.projectionLocation = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
		this.tintColorLocation = this.gl.getUniformLocation(this.program, 'uTintColor');
		this.tintStrengthLocation = this.gl.getUniformLocation(this.program, 'uTintStrength');

		this.sceneGraph = GraphScriptManager.createDemoSceneGraph();
		this.sceneAtoms = this.sceneGraph.atoms;
		this.atomBuffers = new Map(
			this.sceneAtoms.map((atom) => [
				atom.id,
				GraphScriptManager.createSceneAtomBuffers(this.gl!, atom)
			])
		);
		this.focusTarget = [
			this.sceneGraph.focusTarget.x,
			this.sceneGraph.focusTarget.y,
			this.sceneGraph.focusTarget.z
		];
		this.cameraPreset = this.sceneGraph.defaultPreset;
		this.camera = new Camera(
			[0, 0, this.radius],
			this.focusTarget,
			[0, 1, 0],
			SceneObjectManager.CAMERA_FOV
		);
		this.applyCameraPreset(this.cameraPreset, this.focusTarget, this.radius);

		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.clearColor(0.025, 0.032, 0.052, 1);

		this.canvas.addEventListener('mousedown', this.handleMouseDown);
		this.canvas.addEventListener('mousemove', this.handleMouseMove);
		this.canvas.addEventListener('mouseup', this.handleMouseUp);
		this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
		this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
		window.addEventListener('keydown', this.handleKeyDown);

		this.render();
	}

	stop(): void {
		if (this.animationFrameId != null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		if (this.canvas) {
			this.canvas.removeEventListener('mousedown', this.handleMouseDown);
			this.canvas.removeEventListener('mousemove', this.handleMouseMove);
			this.canvas.removeEventListener('mouseup', this.handleMouseUp);
			this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
			this.canvas.removeEventListener('wheel', this.handleWheel);
		}

		window.removeEventListener('keydown', this.handleKeyDown);

		if (this.gl) {
			for (const buffers of this.atomBuffers.values()) {
				GraphScriptManager.destroySceneBuffers(this.gl, buffers);
			}

			if (this.program) {
				this.gl.deleteProgram(this.program);
			}
		}

		this.canvas = null;
		this.gl = null;
		this.program = null;
		this.sceneGraph = null;
		this.sceneAtoms = [];
		this.atomBuffers = new Map();
		this.modelLocation = null;
		this.viewLocation = null;
		this.projectionLocation = null;
		this.tintColorLocation = null;
		this.tintStrengthLocation = null;
		this.camera = null;
		this.focusTarget = [0, 0, 0];
		this.drawCount = 0;
		this.isDragging = false;
		this.hasFittedScene = false;
		this.hoveredAtomId = null;
		this.selectedAtomId = 'node-graph-core';
	}

	private readonly handleMouseDown = (event: MouseEvent): void => {
		this.isDragging = true;
		this.pointerDownX = event.clientX;
		this.pointerDownY = event.clientY;
		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
		this.updateHoveredAtom(event);
	};

	private readonly handleMouseMove = (event: MouseEvent): void => {
		this.updateHoveredAtom(event);

		if (!this.isDragging || !this.camera) {
			return;
		}

		const deltaX = event.clientX - this.lastMouseX;
		const deltaY = event.clientY - this.lastMouseY;

		this.horizontalAngle += deltaX * 0.01;
		this.verticalAngle = GraphScriptManager.clampSceneVerticalAngle(
			this.verticalAngle + deltaY * 0.01
		);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);

		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
	};

	private readonly handleMouseUp = (event: MouseEvent): void => {
		if (
			Math.abs(event.clientX - this.pointerDownX) < 5 &&
			Math.abs(event.clientY - this.pointerDownY) < 5
		) {
			this.selectAtomFromPointer(event);
		}

		this.isDragging = false;
	};

	private readonly handleMouseLeave = (): void => {
		this.isDragging = false;
		this.hoveredAtomId = null;
	};

	private readonly handleWheel = (event: WheelEvent): void => {
		if (!this.camera) {
			return;
		}

		event.preventDefault();
		this.radius = GraphScriptManager.clampSceneRadius(this.radius + event.deltaY * 0.012);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
	};

	private readonly handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === '1') {
			this.applyCameraPreset('iso');
			return;
		}

		if (event.key === '2') {
			this.applyCameraPreset('top');
			return;
		}

		if (event.key === '3') {
			this.applyCameraPreset('front');
			return;
		}

		if (event.key.toLowerCase() === 'f' && event.shiftKey) {
			this.fitSelectionToView();
			return;
		}

		if (event.key.toLowerCase() === 'f') {
			this.fitSceneToView();
		}
	};

	setCameraRadius(radius: number): void {
		if (!this.camera) {
			return;
		}

		this.radius = GraphScriptManager.clampSceneRadius(radius);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
	}

	setCameraTarget(x: number, y: number, z: number = this.focusTarget[2]): void {
		if (!this.camera) {
			return;
		}

		this.focusTarget = [x, y, z];
		this.camera.setTarget(this.focusTarget);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
	}

	getCameraControlInfo() {
		return {
			radius: this.radius,
			minRadius: 2,
			maxRadius: 50,
			sceneFitRadius: this.sceneFitRadius,
			targetX: this.focusTarget[0],
			targetY: this.focusTarget[1],
			targetZ: this.focusTarget[2],
			horizontalAngle: this.horizontalAngle,
			verticalAngle: this.verticalAngle
		};
	}

	private readonly render = (): void => {
		if (
			!this.canvas ||
			!this.gl ||
			!this.camera ||
			this.sceneAtoms.length === 0 ||
			!this.viewLocation ||
			!this.projectionLocation
		) {
			return;
		}

		this.syncCanvasSize();
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.cubeRotation += 0.01;

		const viewMatrix = this.camera.getViewMatrix();
		const projectionMatrix = this.camera.getProjectionMatrix();

		this.gl.uniformMatrix4fv(this.viewLocation, false, viewMatrix.toArray());
		this.gl.uniformMatrix4fv(this.projectionLocation, false, projectionMatrix.toArray());
		this.renderSceneAtoms();
		this.drawCount += 1;

		this.animationFrameId = requestAnimationFrame(this.render);
	};

	private syncCanvasSize(): void {
		if (!this.canvas || !this.gl || !this.camera) {
			return;
		}

		const displayWidth = this.canvas.clientWidth;
		const displayHeight = this.canvas.clientHeight;

		if (displayWidth <= 0 || displayHeight <= 0) {
			return;
		}

		const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
		const bufferWidth = Math.floor(displayWidth * devicePixelRatio);
		const bufferHeight = Math.floor(displayHeight * devicePixelRatio);

		if (this.canvas.width === bufferWidth && this.canvas.height === bufferHeight) {
			if (!this.hasFittedScene) {
				this.fitSceneToView(displayWidth, displayHeight);
			}
			return;
		}

		this.canvas.width = bufferWidth;
		this.canvas.height = bufferHeight;
		this.gl.viewport(0, 0, bufferWidth, bufferHeight);
		this.camera.setAspect(bufferWidth / bufferHeight);
		this.fitSceneToView(displayWidth, displayHeight);
	}

	private fitSceneToView(displayWidth?: number, displayHeight?: number): void {
		const width = displayWidth ?? this.canvas?.clientWidth ?? 1;
		const height = displayHeight ?? this.canvas?.clientHeight ?? 1;
		const bounds = this.sceneGraph?.boundsRadius ?? 12;

		this.radius = this.calculateFitRadius(bounds, width, height, 1.12);
		this.sceneFitRadius = this.radius;
		this.applyCameraPreset(this.cameraPreset, this.focusTarget, this.radius);
		this.hasFittedScene = true;
	}

	private fitSelectionToView(): void {
		const atom = this.getSelectedAtom();

		if (!atom) {
			this.fitSceneToView();
			return;
		}

		const target: [number, number, number] = [
			atom.transform.position.x,
			atom.transform.position.y,
			atom.transform.position.z
		];
		const width = this.canvas?.clientWidth ?? 1;
		const height = this.canvas?.clientHeight ?? 1;
		const bounds = GraphScriptManager.getAtomBoundsRadius(atom);

		this.radius = this.calculateFitRadius(bounds, width, height, 1.55);
		this.applyCameraPreset(this.cameraPreset, target, this.radius);
	}

	private calculateFitRadius(
		boundsRadius: number,
		displayWidth: number,
		displayHeight: number,
		padding: number
	): number {
		const aspect = displayWidth / displayHeight;
		const halfVerticalFov = SceneObjectManager.CAMERA_FOV / 2;
		const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * aspect);
		const limitingHalfFov = Math.min(halfVerticalFov, halfHorizontalFov);

		return GraphScriptManager.clampSceneRadius(
			(boundsRadius / Math.tan(limitingHalfFov)) * padding
		);
	}

	private applyCameraPreset(
		preset: SceneCameraPreset,
		target: [number, number, number] = this.focusTarget,
		radius: number = this.radius
	): void {
		if (!this.camera) {
			return;
		}

		const angles = SceneObjectManager.PRESET_ANGLES[preset];

		this.cameraPreset = preset;
		this.focusTarget = target;
		this.horizontalAngle = angles.horizontal;
		this.verticalAngle = angles.vertical;
		this.radius = radius;
		this.camera.setTarget(target);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
	}

	private renderSceneAtoms(): void {
		if (!this.gl || !this.modelLocation) {
			return;
		}

		for (const atom of this.sceneAtoms) {
			if (atom.visible === false) {
				continue;
			}

			const buffers = this.atomBuffers.get(atom.id);

			if (!buffers) {
				continue;
			}

			const tint = GraphScriptManager.resolveSceneAtomTint(atom, {
				hovered: this.hoveredAtomId === atom.id,
				selected: this.selectedAtomId === atom.id
			});

			GraphScriptManager.drawSceneBuffers(
				this.gl,
				buffers,
				this.modelLocation,
				GraphScriptManager.resolveSceneAtomModelMatrix(atom, this.cubeRotation),
				this.tintColorLocation,
				this.tintStrengthLocation,
				tint.color,
				tint.strength
			);
		}
	}

	private updateHoveredAtom(event: MouseEvent): void {
		const atom = this.pickAtom(event.clientX, event.clientY);
		this.hoveredAtomId = atom?.id ?? null;
	}

	private selectAtomFromPointer(event: MouseEvent): void {
		const atom = this.pickAtom(event.clientX, event.clientY);
		this.selectedAtomId = atom?.id ?? this.selectedAtomId;
	}

	private pickAtom(clientX: number, clientY: number): SceneAtom | null {
		return GraphScriptManager.pickSceneAtom(
			this.sceneAtoms,
			this.camera,
			this.canvas,
			clientX,
			clientY
		);
	}

	private getSelectedAtom(): SceneAtom | null {
		return this.sceneAtoms.find((atom) => atom.id === this.selectedAtomId) ?? null;
	}

	private getAtomDisplayName(atomId: string | null): string {
		if (!atomId) {
			return 'none';
		}

		const atom = this.sceneAtoms.find((item) => item.id === atomId);

		return atom?.metadata?.label ?? atom?.id ?? 'none';
	}

	private getSelectedMoleculeLabel(): string {
		const atom = this.getSelectedAtom();

		if (!atom?.moleculeId || !this.sceneGraph) {
			return 'none';
		}

		return (
			this.sceneGraph.molecules.find((molecule) => molecule.id === atom.moleculeId)?.label ??
			atom.moleculeId
		);
	}

	getDebugInfo(): SceneDebugInfo {
		const viewport = this.gl
			? (this.gl.getParameter(this.gl.VIEWPORT) as Int32Array | number[])
			: null;

		return {
			mounted: true,
			context: this.gl ? 'webgl2' : 'none',
			glVersion: this.gl ? String(this.gl.getParameter(this.gl.VERSION)) : 'none',
			glslVersion: this.gl
				? String(this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION))
				: 'none',
			programLinked: this.program !== null,
			uniformsReady:
				this.modelLocation !== null &&
				this.viewLocation !== null &&
				this.projectionLocation !== null &&
				this.tintColorLocation !== null &&
				this.tintStrengthLocation !== null,
			cubeReady: this.atomBuffers.has('node-graph-core'),
			depthTest: this.gl ? this.gl.isEnabled(this.gl.DEPTH_TEST) : false,
			canvasClient: this.canvas ? `${this.canvas.clientWidth}x${this.canvas.clientHeight}` : 'none',
			canvasBuffer: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'none',
			viewport: viewport ? Array.from(viewport).join(', ') : 'none',
			devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio.toFixed(2) : '1.00',
			drawCount: this.drawCount,
			lastError: this.lastError,
			cameraPosition: this.camera
				? this.camera
						.getPosition()
						.map((value) => value.toFixed(2))
						.join(', ')
				: 'none',
			radius: this.radius.toFixed(2),
			angles: `${this.horizontalAngle.toFixed(2)}, ${this.verticalAngle.toFixed(2)}`,
			cubeRotation: this.cubeRotation.toFixed(2),
			sceneObjects: this.sceneAtoms.length,
			graphNodes: this.sceneGraph?.nodes.length ?? 0,
			graphConnections: this.sceneGraph?.connections.length ?? 0,
			sceneFitRadius: this.sceneFitRadius.toFixed(2),
			sceneMolecules: this.sceneGraph?.molecules.length ?? 0,
			cameraPreset: this.cameraPreset,
			hoveredAtom: this.getAtomDisplayName(this.hoveredAtomId),
			selectedAtom: this.getAtomDisplayName(this.selectedAtomId),
			selectedMolecule: this.getSelectedMoleculeLabel(),
			shaderProfile: 'glsl300es+tint'
		};
	}
}
