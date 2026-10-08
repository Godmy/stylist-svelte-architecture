import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import { Camera } from '$stylist/graph/class/manager/camera';
import { ZWICKY_LAYOUT_SCALE } from '$stylist/graph/const/value/zwicky-layout-scale';
import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';
import instancedVert from '$stylist/graph/data/shader/vertex/instanced.vert?raw';
import instancedFrag from '$stylist/graph/data/shader/fragment/instanced.frag?raw';
import edgeVert from '$stylist/graph/data/shader/vertex/edge.vert?raw';
import edgeFrag from '$stylist/graph/data/shader/fragment/edge.frag?raw';

// Billboard quad: 2 triangles covering [-0.5, 0.5] in XY
const QUAD_VERTICES = new Float32Array([
	-0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5
]);

export class InstancedGraphManager {
	private canvas: HTMLCanvasElement | null = null;
	private gl: WebGL2RenderingContext | null = null;
	private animFrameId: number | null = null;
	private time = 0;

	// Node instanced rendering
	private nodeProgram: WebGLProgram | null = null;
	private nodeVAO: WebGLVertexArrayObject | null = null;
	private quadVBO: WebGLBuffer | null = null;
	private instancePosVBO: WebGLBuffer | null = null;
	private instanceColorVBO: WebGLBuffer | null = null;
	private instanceSizeVBO: WebGLBuffer | null = null;
	private instanceHighlightVBO: WebGLBuffer | null = null;
	private instanceCount = 0;

	// Edge line rendering
	private edgeProgram: WebGLProgram | null = null;
	private edgeVAO: WebGLVertexArrayObject | null = null;
	private edgeVBO: WebGLBuffer | null = null;
	private edgeVertexCount = 0;

	// Graph data
	private nodes: ZwickyNode[] = [];
	private edges: readonly [string, string][] = [];
	private hoveredId: string | null = null;
	private selectedId: string | null = null;
	private domainFilter = new Set<string>();
	private clusterFilter = new Set<string>();
	private needsNodeRebuild = false;
	private needsEdgeRebuild = false;

	// Hover tracking for tooltip
	private hoverX = 0;
	private hoverY = 0;
	private hoverLastMs = 0;

	// Camera
	private camera: Camera | null = null;
	private horizontalAngle = 0.72;
	private verticalAngle = 0.42;
	private radius: number = ZWICKY_LAYOUT_SCALE.cameraInitRadius;
	private isDragging = false;
	private lastX = 0;
	private lastY = 0;
	private downX = 0;
	private downY = 0;
	private hasFitted = false;

	// Uniform locations — node program
	private uViewNode: WebGLUniformLocation | null = null;
	private uProjNode: WebGLUniformLocation | null = null;
	private uTimeNode: WebGLUniformLocation | null = null;
	private uFogStart: WebGLUniformLocation | null = null;
	private uFogEnd: WebGLUniformLocation | null = null;

	// Uniform locations — edge program
	private uViewEdge: WebGLUniformLocation | null = null;
	private uProjEdge: WebGLUniformLocation | null = null;
	private uAlphaEdge: WebGLUniformLocation | null = null;

	onSelect: ((node: ZwickyNode) => void) | null = null;

	start(canvas: HTMLCanvasElement): void {
		this.stop();
		this.canvas = canvas;

		const gl = canvas.getContext('webgl2');
		if (!gl) throw new Error('WebGL2 is required');
		this.gl = gl;

		this.nodeProgram = GraphScriptManager.createSceneProgram(gl, instancedVert, instancedFrag);
		this.edgeProgram = GraphScriptManager.createSceneProgram(gl, edgeVert, edgeFrag);

		this.uViewNode = gl.getUniformLocation(this.nodeProgram, 'uViewMatrix');
		this.uProjNode = gl.getUniformLocation(this.nodeProgram, 'uProjectionMatrix');
		this.uTimeNode = gl.getUniformLocation(this.nodeProgram, 'uTime');
		this.uFogStart = gl.getUniformLocation(this.nodeProgram, 'uFogStart');
		this.uFogEnd = gl.getUniformLocation(this.nodeProgram, 'uFogEnd');

		this.uViewEdge = gl.getUniformLocation(this.edgeProgram, 'uViewMatrix');
		this.uProjEdge = gl.getUniformLocation(this.edgeProgram, 'uProjectionMatrix');
		this.uAlphaEdge = gl.getUniformLocation(this.edgeProgram, 'uAlpha');

		this.camera = new Camera([0, 0, this.radius], [0, 16, 0], [0, 1, 0]);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);

		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(0.02, 0.025, 0.04, 1);

		this.setupNodeVAO();
		this.setupEdgeVAO();

		canvas.addEventListener('mousedown', this.onMouseDown);
		canvas.addEventListener('mousemove', this.onMouseMove);
		canvas.addEventListener('mouseup', this.onMouseUp);
		canvas.addEventListener('mouseleave', this.onMouseLeave);
		canvas.addEventListener('wheel', this.onWheel, { passive: false });
		window.addEventListener('keydown', this.onKeyDown);

		this.renderLoop();
	}

	stop(): void {
		if (this.animFrameId != null) {
			cancelAnimationFrame(this.animFrameId);
			this.animFrameId = null;
		}

		if (this.canvas) {
			this.canvas.removeEventListener('mousedown', this.onMouseDown);
			this.canvas.removeEventListener('mousemove', this.onMouseMove);
			this.canvas.removeEventListener('mouseup', this.onMouseUp);
			this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
			this.canvas.removeEventListener('wheel', this.onWheel);
		}

		window.removeEventListener('keydown', this.onKeyDown);

		const gl = this.gl;
		if (gl) {
			if (this.nodeVAO) gl.deleteVertexArray(this.nodeVAO);
			if (this.edgeVAO) gl.deleteVertexArray(this.edgeVAO);
			if (this.quadVBO) gl.deleteBuffer(this.quadVBO);
			if (this.instancePosVBO) gl.deleteBuffer(this.instancePosVBO);
			if (this.instanceColorVBO) gl.deleteBuffer(this.instanceColorVBO);
			if (this.instanceSizeVBO) gl.deleteBuffer(this.instanceSizeVBO);
			if (this.instanceHighlightVBO) gl.deleteBuffer(this.instanceHighlightVBO);
			if (this.edgeVBO) gl.deleteBuffer(this.edgeVBO);
			if (this.nodeProgram) gl.deleteProgram(this.nodeProgram);
			if (this.edgeProgram) gl.deleteProgram(this.edgeProgram);
		}

		this.canvas = null;
		this.gl = null;
		this.camera = null;
		this.hasFitted = false;
	}

	setGraph(nodes: ZwickyNode[], edges: readonly [string, string][]): void {
		this.nodes = nodes;
		this.edges = edges;
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
		this.hasFitted = false;
	}

	setHovered(id: string | null): void {
		if (this.hoveredId === id) return;
		this.hoveredId = id;
		this.needsNodeRebuild = true;
	}

	setSelected(id: string | null): void {
		if (this.selectedId === id) return;
		this.selectedId = id;
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
	}

	getSelectedId(): string | null {
		return this.selectedId;
	}

	getHoveredId(): string | null {
		return this.hoveredId;
	}

	getCameraInfo() {
		return {
			radius: this.radius,
			minRadius: ZWICKY_LAYOUT_SCALE.cameraMinRadius,
			maxRadius: ZWICKY_LAYOUT_SCALE.cameraMaxRadius,
			horizontalAngle: this.horizontalAngle,
			verticalAngle: this.verticalAngle
		};
	}

	setCameraRadius(radius: number): void {
		this.radius = GraphScriptManager.clampZwickyRadius(radius);
		this.camera?.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
	}

	setDomainFilter(domains: Set<string>): void {
		this.domainFilter = new Set(domains);
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
	}

	getDomainFilter(): ReadonlySet<string> {
		return this.domainFilter;
	}

	setClusterFilter(clusters: Set<string>): void {
		this.clusterFilter = new Set(clusters);
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
	}

	getClusterFilter(): ReadonlySet<string> {
		return this.clusterFilter;
	}

	getHoveredNode(): ZwickyNode | null {
		return this.nodes.find((n) => n.id === this.hoveredId) ?? null;
	}

	getHoverPos(): { x: number; y: number } | null {
		if (!this.hoveredId || !this.canvas) return null;
		const rect = this.canvas.getBoundingClientRect();
		return { x: this.hoverX - rect.left, y: this.hoverY - rect.top };
	}

	private setupNodeVAO(): void {
		const gl = this.gl!;

		this.nodeVAO = gl.createVertexArray();
		gl.bindVertexArray(this.nodeVAO);

		// Quad geometry (shared, divisor=0)
		this.quadVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
		gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		// Instance buffers (placeholder, filled by uploadNodeData)
		this.instancePosVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instancePosVBO);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(1, 1);

		this.instanceColorVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorVBO);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(2, 1);

		this.instanceSizeVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceSizeVBO);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(3);
		gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(3, 1);

		this.instanceHighlightVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceHighlightVBO);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(4);
		gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(4, 1);

		gl.bindVertexArray(null);
	}

	private setupEdgeVAO(): void {
		const gl = this.gl!;

		this.edgeVAO = gl.createVertexArray();
		gl.bindVertexArray(this.edgeVAO);

		this.edgeVBO = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeVBO);
		gl.bufferData(gl.ARRAY_BUFFER, 0, gl.DYNAMIC_DRAW);

		// stride: 6 floats (xyz + rgb)
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

		gl.bindVertexArray(null);
	}

	private uploadNodeData(): void {
		const gl = this.gl;
		if (!gl) return;

		const draw = GraphScriptManager.buildInstancedNodeBuffers(
			this.nodes,
			this.hoveredId,
			this.selectedId,
			this.domainFilter,
			this.clusterFilter
		);
		this.instanceCount = draw.count;

		const upload = (vbo: WebGLBuffer | null, data: Float32Array) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		};

		// Re-bind VAO to keep attribute associations
		gl.bindVertexArray(this.nodeVAO);
		upload(this.instancePosVBO, draw.instancePositions);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(1, 1);

		upload(this.instanceColorVBO, draw.instanceColors);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(2, 1);

		upload(this.instanceSizeVBO, draw.instanceSizes);
		gl.enableVertexAttribArray(3);
		gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(3, 1);

		upload(this.instanceHighlightVBO, draw.instanceHighlights);
		gl.enableVertexAttribArray(4);
		gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(4, 1);

		gl.bindVertexArray(null);
		this.needsNodeRebuild = false;
	}

	private uploadEdgeData(): void {
		const gl = this.gl;
		if (!gl) return;

		const data = GraphScriptManager.buildInstancedEdgeBuffers(
			this.nodes,
			this.edges,
			this.selectedId,
			this.domainFilter,
			this.clusterFilter
		);
		this.edgeVertexCount = data.length / 6;

		gl.bindVertexArray(this.edgeVAO);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeVBO);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
		gl.bindVertexArray(null);

		this.needsEdgeRebuild = false;
	}

	private readonly renderLoop = (): void => {
		if (!this.canvas || !this.gl || !this.camera) return;

		const gl = this.gl;
		this.syncCanvasSize();

		if (this.needsNodeRebuild) this.uploadNodeData();
		if (this.needsEdgeRebuild) this.uploadEdgeData();

		this.time += 0.016;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const view = this.camera.getViewMatrix().toArray();
		const proj = this.camera.getProjectionMatrix().toArray();

		// Draw edges first (behind nodes)
		if (this.edgeVertexCount > 0 && this.edgeProgram && this.edgeVAO) {
			gl.useProgram(this.edgeProgram);
			gl.uniformMatrix4fv(this.uViewEdge, false, view);
			gl.uniformMatrix4fv(this.uProjEdge, false, proj);
			gl.uniform1f(this.uAlphaEdge, this.selectedId ? 0.65 : 0.15);
			gl.bindVertexArray(this.edgeVAO);
			gl.drawArrays(gl.LINES, 0, this.edgeVertexCount);
			gl.bindVertexArray(null);
		}

		// Draw nodes (instanced billboard quads)
		if (this.instanceCount > 0 && this.nodeProgram && this.nodeVAO) {
			gl.useProgram(this.nodeProgram);
			gl.uniformMatrix4fv(this.uViewNode, false, view);
			gl.uniformMatrix4fv(this.uProjNode, false, proj);
			gl.uniform1f(this.uTimeNode, this.time);
			gl.uniform1f(this.uFogStart, 0.6);
			gl.uniform1f(this.uFogEnd, 1.0);
			gl.bindVertexArray(this.nodeVAO);
			gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.instanceCount);
			gl.bindVertexArray(null);
		}

		this.animFrameId = requestAnimationFrame(this.renderLoop);
	};

	private syncCanvasSize(): void {
		const canvas = this.canvas;
		const gl = this.gl;
		const camera = this.camera;
		if (!canvas || !gl || !camera) return;

		const dpr = window.devicePixelRatio || 1;
		const w = Math.floor(canvas.clientWidth * dpr);
		const h = Math.floor(canvas.clientHeight * dpr);

		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w;
			canvas.height = h;
			gl.viewport(0, 0, w, h);
			camera.setAspect(w / h);

			if (!this.hasFitted && this.nodes.length > 0) {
				this.fitToScene();
			}
		}
	}

	private fitToScene(): void {
		const canvas = this.canvas;
		if (!canvas || !this.camera) return;

		const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
		const halfFov = Math.PI / 4 / 2;
		const halfH = Math.tan(halfFov);
		const halfW = halfH * aspect;
		const limiting = Math.min(halfH, halfW);
		const bounds = ZWICKY_LAYOUT_SCALE.domainRadius + ZWICKY_LAYOUT_SCALE.familyMaxRadius + 5;

		this.radius = GraphScriptManager.clampZwickyRadius((bounds / limiting) * 1.15);
		this.camera.setTarget([0, 16, 0]);
		this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
		this.hasFitted = true;
	}

	private readonly onMouseDown = (e: MouseEvent): void => {
		this.isDragging = true;
		this.downX = e.clientX;
		this.downY = e.clientY;
		this.lastX = e.clientX;
		this.lastY = e.clientY;
	};

	private readonly onMouseMove = (e: MouseEvent): void => {
		// Camera orbit when dragging
		if (this.isDragging && this.camera) {
			const dx = e.clientX - this.lastX;
			const dy = e.clientY - this.lastY;
			this.horizontalAngle += dx * 0.008;
			this.verticalAngle = GraphScriptManager.clampSceneVerticalAngle(
				this.verticalAngle + dy * 0.008
			);
			this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
			this.lastX = e.clientX;
			this.lastY = e.clientY;
		}

		// Hover picking — throttled to 60ms to stay cheap on 4k+ nodes
		const now = performance.now();
		if (now - this.hoverLastMs < 60) return;
		this.hoverLastMs = now;
		this.hoverX = e.clientX;
		this.hoverY = e.clientY;

		const hit = GraphScriptManager.pickZwickyNodeFromScreen(
			this.nodes,
			this.camera,
			this.canvas,
			e.clientX,
			e.clientY
		);
		const newId = hit?.id ?? null;
		if (newId !== this.hoveredId) {
			this.hoveredId = newId;
			this.needsNodeRebuild = true;
		}
	};

	private readonly onMouseUp = (e: MouseEvent): void => {
		const moved = Math.abs(e.clientX - this.downX) < 5 && Math.abs(e.clientY - this.downY) < 5;

		if (moved) {
			const hit = GraphScriptManager.pickZwickyNodeFromScreen(
				this.nodes,
				this.camera,
				this.canvas,
				e.clientX,
				e.clientY
			);
			this.setSelected(hit?.id ?? null);
			if (hit) this.onSelect?.(hit);
		}

		this.isDragging = false;
	};

	private readonly onMouseLeave = (): void => {
		this.isDragging = false;
		if (this.hoveredId !== null) {
			this.hoveredId = null;
			this.needsNodeRebuild = true;
		}
	};

	private readonly onWheel = (e: WheelEvent): void => {
		e.preventDefault();
		this.setCameraRadius(this.radius + e.deltaY * 0.06);
	};

	private readonly onKeyDown = (e: KeyboardEvent): void => {
		if (e.key.toLowerCase() === 'f') {
			this.hasFitted = false;
			this.fitToScene();
		}
	};
}
