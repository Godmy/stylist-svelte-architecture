import { GraphScriptManager } from '$stylist/graph/class/manager/graph-script';
import { Camera } from '$stylist/graph/class/manager/camera';
import { ZWICKY_LAYOUT_SCALE } from '$stylist/graph/const/value/zwicky-layout-scale';
import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';
import type { GraphTheme } from '$stylist/graph/type/alias/graph-theme';
import type { ZwickyScheme } from '$stylist/graph/interface/slot/zwicky-scheme';
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
	private background: readonly [number, number, number] = [0.02, 0.025, 0.04];
	private theme: GraphTheme = 'dark';
	private edgeTint: readonly [number, number, number] = [1, 1, 1];
	private edgeFilter: 'both' | 'any' = 'both';
	private edgeOpacity: number | undefined;
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
	private graphEdgeVertexCount = 0;

	// Graph data
	private nodes: ZwickyNode[] = [];
	private edges: readonly [string, string][] = [];
	private visibleNodes: ZwickyNode[] = [];
	private visibleEdges: readonly [string, string][] = [];
	private nodeFilter: ReadonlySet<string> | null = null;
	private includeRelated = true;
	private facetMode = false;
	private linksVisible = true;
	private referenceLines: NonNullable<ZwickyScheme['referenceLines']> = [];
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
	private maxRadius: number = ZWICKY_LAYOUT_SCALE.cameraMaxRadius;
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

	onSelect: ((node: ZwickyNode | null) => void) | null = null;

	/** Canvas clear colour (RGB 0..1); applies at once when the scene is running. */
	setBackground(color: readonly [number, number, number]): void {
		this.background = color;
		this.gl?.clearColor(...color, 1);
	}

	/** Light: a paper canvas and source-to-target gradient edges mixed with `edgeTint`. */
	setTheme(theme: GraphTheme, edgeTint?: readonly [number, number, number]): void {
		this.theme = theme;
		if (edgeTint) this.edgeTint = edgeTint;
		this.setBackground(theme === 'light' ? [0.965, 0.957, 0.94] : [0.02, 0.025, 0.04]);
		this.needsEdgeRebuild = true;
	}

	/** 'any' keeps an edge under a filter when one of its ends passes (default 'both'). */
	setEdgeFilter(mode: 'both' | 'any'): void {
		this.edgeFilter = mode;
		this.needsEdgeRebuild = true;
	}

	start(canvas: HTMLCanvasElement): void {
		this.stop();
		this.canvas = canvas;

		const gl = canvas.getContext('webgl2', { alpha: false });
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
		gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.clearColor(...this.background, 1);

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
		this.refreshVisibility();
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
		this.hasFitted = false;
	}

	private refreshVisibility(): void {
		const view = GraphScriptManager.resolveZwickyView(
			this.nodes,
			this.edges,
			this.nodeFilter,
			this.includeRelated
		);
		this.visibleNodes = view.nodes;
		this.visibleEdges = view.edges;
		this.needsNodeRebuild = true;
		this.needsEdgeRebuild = true;
	}

	setNodeFilter(ids: ReadonlySet<string> | null, includeRelated: boolean): void {
		this.facetMode = true;
		this.nodeFilter = ids;
		this.includeRelated = includeRelated;
		this.hoveredId = null;
		this.setSelected(null);
		this.refreshVisibility();
	}

	setLinksVisible(visible: boolean): void {
		this.linksVisible = visible;
		this.needsEdgeRebuild = true;
	}

	getViewCounts(): { nodes: number; edges: number; matched: number; related: number } {
		const edges = !this.linksVisible
			? 0
			: this.facetMode && this.selectedId
				? this.visibleEdges.filter(
						([from, to]) => from === this.selectedId || to === this.selectedId
					).length
				: this.visibleEdges.length;
		const matched = this.nodeFilter?.size ?? this.nodes.length;
		return {
			nodes: this.visibleNodes.length,
			edges,
			matched,
			related: this.visibleNodes.length - matched
		};
	}

	setReferenceLines(lines: NonNullable<ZwickyScheme['referenceLines']>, scale = 1): void {
		this.referenceLines = lines.map((line) => ({
			color: line.color,
			points: line.points.map(([x, y, z]) => [x * scale, y * scale, z * scale] as const)
		}));
		this.needsEdgeRebuild = true;
	}

	setCameraOrbit(orbit: NonNullable<ZwickyScheme['camera']>): void {
		this.horizontalAngle = orbit.horizontalAngle;
		this.verticalAngle = GraphScriptManager.clampSceneVerticalAngle(orbit.verticalAngle);
		this.camera?.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
		this.hasFitted = false;
	}

	setEdgeOpacity(opacity: number): void {
		this.edgeOpacity = Math.max(0, Math.min(1, opacity));
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
			maxRadius: this.maxRadius,
			horizontalAngle: this.horizontalAngle,
			verticalAngle: this.verticalAngle
		};
	}

	setCameraRadius(radius: number): void {
		this.radius = Math.max(ZWICKY_LAYOUT_SCALE.cameraMinRadius, Math.min(this.maxRadius, radius));
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
		return this.visibleNodes.find((n) => n.id === this.hoveredId) ?? null;
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
			this.visibleNodes,
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

		const edges = GraphScriptManager.buildInstancedEdgeBuffers(
			this.visibleNodes,
			this.linksVisible ? this.visibleEdges : [],
			this.selectedId,
			this.domainFilter,
			this.clusterFilter,
			this.theme,
			this.edgeTint,
			this.edgeFilter,
			this.facetMode
		);
		const extraLength = this.referenceLines.reduce(
			(sum, line) => sum + Math.max(0, line.points.length - 1) * 12,
			0
		);
		const data = new Float32Array(edges.length + extraLength);
		this.graphEdgeVertexCount = edges.length / 6;
		data.set(edges);
		let offset = edges.length;
		for (const line of this.referenceLines)
			for (let i = 1; i < line.points.length; i++) {
				data.set([...line.points[i - 1], ...line.color, ...line.points[i], ...line.color], offset);
				offset += 12;
			}
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
		if (!this.hasFitted && this.nodes.length > 0) this.fitToScene();

		if (this.needsNodeRebuild) this.uploadNodeData();
		if (this.needsEdgeRebuild) this.uploadEdgeData();

		this.time += 0.016;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const view = this.camera.getViewMatrix().toArray();
		const proj = this.camera.getProjectionMatrix().toArray();

		// Draw edges first (behind nodes)
		if (this.edgeVertexCount > 0 && this.edgeProgram && this.edgeVAO) {
			gl.depthMask(false);
			gl.useProgram(this.edgeProgram);
			gl.uniformMatrix4fv(this.uViewEdge, false, view);
			gl.uniformMatrix4fv(this.uProjEdge, false, proj);
			// Pastel lines on a light canvas need more opacity than dimmed ones on the dark.
			gl.uniform1f(
				this.uAlphaEdge,
				this.selectedId
					? this.theme === 'light'
						? 0.95
						: 0.65
					: (this.edgeOpacity ?? (this.theme === 'light' ? 0.85 : 0.15))
			);
			gl.bindVertexArray(this.edgeVAO);
			gl.drawArrays(gl.LINES, 0, this.graphEdgeVertexCount);
			if (this.edgeVertexCount > this.graphEdgeVertexCount) {
				gl.uniform1f(this.uAlphaEdge, 0.85);
				gl.drawArrays(
					gl.LINES,
					this.graphEdgeVertexCount,
					this.edgeVertexCount - this.graphEdgeVertexCount
				);
			}
			gl.bindVertexArray(null);
			gl.depthMask(true);
		}

		// Draw nodes (instanced billboard quads)
		if (this.instanceCount > 0 && this.nodeProgram && this.nodeVAO) {
			gl.useProgram(this.nodeProgram);
			gl.uniformMatrix4fv(this.uViewNode, false, view);
			gl.uniformMatrix4fv(this.uProjNode, false, proj);
			gl.uniform1f(this.uTimeNode, this.time);
			gl.uniform1f(this.uFogStart, this.theme === 'light' ? 1 : 0.6);
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

			if ((!this.hasFitted || this.referenceLines.length > 0) && this.nodes.length > 0) {
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
		if (this.referenceLines.length) {
			const points = [
				...this.nodes.map((node) => [node.x, node.y, node.z] as const),
				...this.referenceLines.flatMap((line) => line.points)
			];
			const target = [0, 0, 0] as [number, number, number];
			for (let axis = 0; axis < 3; axis++) {
				const values = points.map((point) => point[axis]);
				target[axis] = (Math.min(...values) + Math.max(...values)) / 2;
			}
			const sh = Math.sin(this.horizontalAngle),
				ch = Math.cos(this.horizontalAngle);
			const sv = Math.sin(this.verticalAngle),
				cv = Math.cos(this.verticalAngle);
			let radius: number = ZWICKY_LAYOUT_SCALE.cameraMinRadius;
			for (const point of points) {
				const x = point[0] - target[0],
					y = point[1] - target[1],
					z = point[2] - target[2];
				const right = x * ch - z * sh;
				const up = -x * sh * sv + y * cv - z * ch * sv;
				const depth = x * sh * cv + y * sv + z * ch * cv;
				radius = Math.max(radius, depth + Math.max(Math.abs(right) / halfW, Math.abs(up) / halfH));
			}
			this.radius = radius * 1.12;
			this.maxRadius = Math.max(ZWICKY_LAYOUT_SCALE.cameraMaxRadius, this.radius * 1.5);
			this.camera.setTarget(target);
			this.camera.rotateAroundTarget(this.horizontalAngle, this.verticalAngle, this.radius);
			this.hasFitted = true;
			return;
		}
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
			this.visibleNodes,
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
				this.visibleNodes,
				this.camera,
				this.canvas,
				e.clientX,
				e.clientY
			);
			this.setSelected(hit?.id ?? null);
			this.onSelect?.(hit);
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
