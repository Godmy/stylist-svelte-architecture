import type { SceneGeometry } from '$stylist/graph/interface/slot/scene-geometry';
import type { SceneBufferSet } from '$stylist/graph/interface/slot/scene-buffer-set';
import { Matrix4 } from '$stylist/graph/class/manager/matrix4';
import type { SceneAtom } from '$stylist/graph/interface/slot/scene-atom';
import type { Camera } from '$stylist/graph/class/manager/camera';
import { MATERIAL_PALETTE } from '$stylist/graph/const/record/material-palette';
import type { SceneGraph } from '$stylist/graph/interface/slot/scene-graph';
import type { SceneMolecule } from '$stylist/graph/interface/slot/scene-molecule';
import type { GraphConnection } from '$stylist/graph/interface/slot/graph-connection';
import type { GraphNode } from '$stylist/graph/interface/slot/graph-scene-node';
import { ZWICKY_LAYOUT_SCALE } from '$stylist/graph/const/value/zwicky-layout-scale';
import type { ZwickyNode } from '$stylist/graph/interface/slot/zwicky-node';
import { ZWICKY_CLUSTER_ORDER } from '$stylist/graph/const/array/zwicky-cluster-order';
import { ZWICKY_CLUSTER_COLOR } from '$stylist/graph/const/record/zwicky-cluster-color';
import type { GraphJsonInput } from '$stylist/graph/interface/slot/graph-json-input';

export class GraphScriptManager {
	static bindSceneAttributeBuffer(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		buffer: WebGLBuffer,
		data: Float32Array | null,
		location: number
	): void {
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

		if (data) {
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		}

		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
	}

	static isWebGL2Context(
		gl: WebGLRenderingContext | WebGL2RenderingContext
	): gl is WebGL2RenderingContext {
		return 'createVertexArray' in gl;
	}

	static compileSceneShader(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		source: string,
		type: number
	): WebGLShader {
		const shader = gl.createShader(type);

		if (!shader) {
			throw new Error('Unable to create scene shader');
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const error = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(`Unable to compile scene shader: ${error}`);
		}

		return shader;
	}

	static createSceneProgram(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		vertexSource: string,
		fragmentSource: string
	): WebGLProgram {
		const vertexShader = GraphScriptManager.compileSceneShader(gl, vertexSource, gl.VERTEX_SHADER);
		const fragmentShader = GraphScriptManager.compileSceneShader(
			gl,
			fragmentSource,
			gl.FRAGMENT_SHADER
		);
		const program = gl.createProgram();

		if (!program) {
			throw new Error('Unable to create scene program');
		}

		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const error = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			throw new Error(`Unable to link scene program: ${error}`);
		}

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		return program;
	}

	static createSceneBoxGeometry(
		width: number,
		height: number,
		depth: number,
		color: readonly [number, number, number]
	): SceneGeometry {
		const hx = width / 2;
		const hy = height / 2;
		const hz = depth / 2;
		const positions = new Float32Array([
			-hx,
			-hy,
			hz,
			hx,
			-hy,
			hz,
			hx,
			hy,
			hz,
			-hx,
			-hy,
			hz,
			hx,
			hy,
			hz,
			-hx,
			hy,
			hz,
			-hx,
			-hy,
			-hz,
			-hx,
			hy,
			-hz,
			hx,
			hy,
			-hz,
			-hx,
			-hy,
			-hz,
			hx,
			hy,
			-hz,
			hx,
			-hy,
			-hz,
			-hx,
			hy,
			-hz,
			-hx,
			hy,
			hz,
			hx,
			hy,
			hz,
			-hx,
			hy,
			-hz,
			hx,
			hy,
			hz,
			hx,
			hy,
			-hz,
			-hx,
			-hy,
			-hz,
			hx,
			-hy,
			-hz,
			hx,
			-hy,
			hz,
			-hx,
			-hy,
			-hz,
			hx,
			-hy,
			hz,
			-hx,
			-hy,
			hz,
			hx,
			-hy,
			-hz,
			hx,
			hy,
			-hz,
			hx,
			hy,
			hz,
			hx,
			-hy,
			-hz,
			hx,
			hy,
			hz,
			hx,
			-hy,
			hz,
			-hx,
			-hy,
			-hz,
			-hx,
			-hy,
			hz,
			-hx,
			hy,
			hz,
			-hx,
			-hy,
			-hz,
			-hx,
			hy,
			hz,
			-hx,
			hy,
			-hz
		]);
		const colors = new Float32Array(Array.from({ length: 36 }, () => color).flat());

		return { positions, colors, vertexCount: 36 };
	}

	static createSceneBuffers(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		geometry: SceneGeometry
	): SceneBufferSet {
		const position = gl.createBuffer();
		const color = gl.createBuffer();

		if (!position || !color) {
			throw new Error('Unable to create scene buffers');
		}

		let vertexArray: WebGLVertexArrayObject | null = null;

		if (GraphScriptManager.isWebGL2Context(gl)) {
			vertexArray = gl.createVertexArray();

			if (vertexArray) {
				gl.bindVertexArray(vertexArray);
				GraphScriptManager.bindSceneAttributeBuffer(gl, position, geometry.positions, 0);
				GraphScriptManager.bindSceneAttributeBuffer(gl, color, geometry.colors, 1);
				gl.bindVertexArray(null);
			}
		} else {
			gl.bindBuffer(gl.ARRAY_BUFFER, position);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, color);
			gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.STATIC_DRAW);
		}

		return {
			position,
			color,
			vertexArray,
			vertexCount: geometry.vertexCount
		};
	}

	static destroySceneBuffers(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		buffers: SceneBufferSet | null
	): void {
		if (!buffers) return;

		gl.deleteBuffer(buffers.position);
		gl.deleteBuffer(buffers.color);

		if (buffers.vertexArray && GraphScriptManager.isWebGL2Context(gl)) {
			gl.deleteVertexArray(buffers.vertexArray);
		}
	}

	static drawSceneBuffers(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		buffers: SceneBufferSet,
		modelLocation: WebGLUniformLocation | null,
		modelMatrix: Matrix4,
		tintColorLocation?: WebGLUniformLocation | null,
		tintStrengthLocation?: WebGLUniformLocation | null,
		tintColor?: readonly [number, number, number],
		tintStrength = 0
	): void {
		if (buffers.vertexArray && GraphScriptManager.isWebGL2Context(gl)) {
			gl.bindVertexArray(buffers.vertexArray);
		} else {
			GraphScriptManager.bindSceneAttributeBuffer(gl, buffers.position, null, 0);
			GraphScriptManager.bindSceneAttributeBuffer(gl, buffers.color, null, 1);
		}

		gl.uniformMatrix4fv(modelLocation, false, modelMatrix.toArray());

		if (tintColorLocation) {
			gl.uniform3fv(tintColorLocation, tintColor ?? [1, 1, 1]);
		}

		if (tintStrengthLocation) {
			gl.uniform1f(tintStrengthLocation, tintStrength);
		}

		gl.drawArrays(gl.TRIANGLES, 0, buffers.vertexCount);
	}

	static getAtomBoundsRadius(atom: SceneAtom): number {
		if (atom.boundsRadius) {
			return atom.boundsRadius;
		}

		if (atom.geometry.type === 'cube') {
			const scale = atom.transform.scale?.x ?? 1;

			return 1.8 * scale;
		}

		const scale = atom.transform.scale;
		const width = (atom.geometry.width ?? 1) * (scale?.x ?? 1);
		const height = (atom.geometry.height ?? 1) * (scale?.y ?? 1);
		const depth = (atom.geometry.depth ?? 1) * (scale?.z ?? 1);

		return Math.hypot(width, height, depth) / 2;
	}

	static multiplyMatrixVector(
		matrix: Float32Array,
		vector: readonly [number, number, number, number]
	): [number, number, number, number] {
		return [
			matrix[0] * vector[0] +
				matrix[4] * vector[1] +
				matrix[8] * vector[2] +
				matrix[12] * vector[3],
			matrix[1] * vector[0] +
				matrix[5] * vector[1] +
				matrix[9] * vector[2] +
				matrix[13] * vector[3],
			matrix[2] * vector[0] +
				matrix[6] * vector[1] +
				matrix[10] * vector[2] +
				matrix[14] * vector[3],
			matrix[3] * vector[0] +
				matrix[7] * vector[1] +
				matrix[11] * vector[2] +
				matrix[15] * vector[3]
		];
	}

	static projectPointToScreen(
		camera: Camera,
		canvas: HTMLCanvasElement,
		point: { x: number; y: number; z: number }
	): { x: number; y: number; depth: number; distance: number } | null {
		const view = camera.getViewMatrix().toArray();
		const projection = camera.getProjectionMatrix().toArray();
		const cameraPosition = camera.getPosition();
		const viewPosition = GraphScriptManager.multiplyMatrixVector(view, [
			point.x,
			point.y,
			point.z,
			1
		]);
		const clipPosition = GraphScriptManager.multiplyMatrixVector(projection, viewPosition);

		if (clipPosition[3] <= 0) {
			return null;
		}

		const ndcX = clipPosition[0] / clipPosition[3];
		const ndcY = clipPosition[1] / clipPosition[3];
		const ndcZ = clipPosition[2] / clipPosition[3];

		return {
			x: (ndcX * 0.5 + 0.5) * canvas.clientWidth,
			y: (1 - (ndcY * 0.5 + 0.5)) * canvas.clientHeight,
			depth: ndcZ,
			distance: Math.hypot(
				cameraPosition[0] - point.x,
				cameraPosition[1] - point.y,
				cameraPosition[2] - point.z
			)
		};
	}

	static projectWorldRadiusToPixels(
		camera: Camera,
		canvas: HTMLCanvasElement,
		worldRadius: number,
		distance: number
	): number {
		if (distance <= 0) {
			return 0;
		}

		return (canvas.clientHeight * worldRadius) / (2 * Math.tan(camera.getFov() / 2) * distance);
	}

	static resolveSceneAtomModelMatrix(atom: SceneAtom, animationTime = 0): Matrix4 {
		const { position, rotation, scale } = atom.transform;
		const spin = atom.motion?.spin;

		const scaleMatrix = Matrix4.scale(scale?.x ?? 1, scale?.y ?? 1, scale?.z ?? 1);
		const rotateX = Matrix4.rotateX((rotation?.x ?? 0) + (spin?.x ?? 0) * animationTime);
		const rotateY = Matrix4.rotateY((rotation?.y ?? 0) + (spin?.y ?? 0) * animationTime);
		const rotateZ = Matrix4.rotateZ((rotation?.z ?? 0) + (spin?.z ?? 0) * animationTime);
		const translate = Matrix4.translate(position.x, position.y, position.z);

		return translate.multiply(rotateZ).multiply(rotateY).multiply(rotateX).multiply(scaleMatrix);
	}

	static resolveSceneAtomTint(
		atom: SceneAtom,
		interaction: {
			hovered: boolean;
			selected: boolean;
		}
	): { color: readonly [number, number, number]; strength: number } {
		if (interaction.selected) {
			return {
				color: atom.kind === 'node' ? [1, 0.83, 0.44] : [1, 0.96, 0.72],
				strength: atom.kind === 'axis' ? 0.2 : 0.5
			};
		}

		if (interaction.hovered) {
			return {
				color: atom.kind === 'node' ? [0.62, 0.94, 1] : [0.76, 0.88, 1],
				strength: atom.kind === 'grid-line' ? 0.08 : 0.28
			};
		}

		return { color: [1, 1, 1], strength: 0 };
	}

	static resolveSceneAtomBaseColor(atom: SceneAtom): readonly [number, number, number] {
		return (
			atom.material?.color ??
			atom.geometry.color ??
			MATERIAL_PALETTE[atom.material?.kind ?? 'solid']
		);
	}

	static createSceneCubeGeometry(): SceneGeometry {
		const positions = new Float32Array([
			-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1,
			-1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1,
			-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1,
			1, 1, -1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1,
			-1
		]);

		const colors = new Float32Array([
			1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
			1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1,
			0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1,
			1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1
		]);

		return { positions, colors, vertexCount: 36 };
	}

	static createSceneAtom(atom: SceneAtom): SceneAtom {
		return {
			selectable: true,
			boundsRadius: 1,
			...atom
		};
	}

	static createSceneAtomBuffers(
		gl: WebGLRenderingContext | WebGL2RenderingContext,
		atom: SceneAtom
	): SceneBufferSet {
		if (atom.geometry.type === 'cube') {
			return GraphScriptManager.createSceneBuffers(
				gl,
				GraphScriptManager.createSceneCubeGeometry()
			);
		}

		return GraphScriptManager.createSceneBuffers(
			gl,
			GraphScriptManager.createSceneBoxGeometry(
				atom.geometry.width ?? 1,
				atom.geometry.height ?? 1,
				atom.geometry.depth ?? 1,
				GraphScriptManager.resolveSceneAtomBaseColor(atom)
			)
		);
	}

	static createDemoSceneGraph(): SceneGraph {
		const nodes: readonly GraphNode[] = [
			{
				id: 'graph-core',
				label: 'Graph Core',
				description: '3D graph runtime',
				position: { x: 0, y: 0.6, z: 0 },
				size: 1.65,
				accent: [0.29, 0.78, 0.94]
			},
			{
				id: 'node-model',
				label: 'Nodes',
				description: 'Spatial entities',
				position: { x: -4.8, y: 0.1, z: -2.2 },
				size: 1.15,
				accent: [0.58, 0.83, 0.46]
			},
			{
				id: 'connection-model',
				label: 'Connections',
				description: 'Typed relations',
				position: { x: 4.7, y: 0.1, z: -2.1 },
				size: 1.15,
				accent: [1, 0.68, 0.3]
			},
			{
				id: 'webgl-runtime',
				label: 'WebGL',
				description: 'Rendering pipeline',
				position: { x: -3.6, y: 0.2, z: 3.6 },
				size: 1.25,
				accent: [0.73, 0.52, 1]
			},
			{
				id: 'interaction',
				label: 'Interaction',
				description: 'Hover and selection',
				position: { x: 3.5, y: 0.2, z: 3.7 },
				size: 1.25,
				accent: [1, 0.42, 0.5]
			},
			{
				id: 'camera',
				label: 'Camera',
				description: '3D viewport controls',
				position: { x: 0, y: -0.25, z: 6.1 },
				size: 0.95,
				accent: [0.45, 0.95, 0.78]
			}
		] as const;
		const connections: readonly GraphConnection[] = [
			{
				id: 'core-to-nodes',
				startId: 'graph-core',
				endId: 'node-model',
				strength: 0.92,
				accent: [0.58, 0.83, 0.46]
			},
			{
				id: 'core-to-connections',
				startId: 'graph-core',
				endId: 'connection-model',
				strength: 0.92,
				accent: [1, 0.68, 0.3]
			},
			{
				id: 'nodes-to-webgl',
				startId: 'node-model',
				endId: 'webgl-runtime',
				strength: 0.68,
				accent: [0.48, 0.7, 1]
			},
			{
				id: 'connections-to-interaction',
				startId: 'connection-model',
				endId: 'interaction',
				strength: 0.68,
				accent: [1, 0.42, 0.5]
			},
			{
				id: 'webgl-to-camera',
				startId: 'webgl-runtime',
				endId: 'camera',
				strength: 0.58,
				accent: [0.73, 0.52, 1]
			},
			{
				id: 'interaction-to-camera',
				startId: 'interaction',
				endId: 'camera',
				strength: 0.58,
				accent: [0.45, 0.95, 0.78]
			},
			{
				id: 'nodes-to-connections',
				startId: 'node-model',
				endId: 'connection-model',
				strength: 0.42,
				accent: [0.34, 0.79, 0.92]
			}
		] as const;
		const nodeMap = new Map(nodes.map((node) => [node.id, node]));
		const atoms: SceneAtom[] = [];

		atoms.push(
			GraphScriptManager.createSceneAtom({
				id: 'graph-floor',
				kind: 'surface',
				geometry: {
					type: 'box',
					width: 13.8,
					height: 0.08,
					depth: 10.8,
					color: [0.055, 0.07, 0.105]
				},
				material: { kind: 'surface' },
				transform: { position: { x: 0, y: -0.72, z: 1.65 } },
				selectable: false,
				boundsRadius: 6.8,
				metadata: { label: 'Graph surface' }
			})
		);

		for (const connection of connections) {
			const start = nodeMap.get(connection.startId);
			const end = nodeMap.get(connection.endId);

			if (!start || !end) {
				continue;
			}

			const dx = end.position.x - start.position.x;
			const dz = end.position.z - start.position.z;
			const length = Math.hypot(dx, dz);
			const strength = connection.strength ?? 0.5;
			const y = Math.min(start.position.y, end.position.y) - 0.18;

			atoms.push(
				GraphScriptManager.createSceneAtom({
					id: `connection-${connection.id}`,
					kind: 'connection',
					geometry: {
						type: 'box',
						width: length,
						height: 0.07 + strength * 0.05,
						depth: 0.07 + strength * 0.05,
						color: connection.accent ?? [0.28, 0.58, 0.72]
					},
					material: {
						kind: strength > 0.75 ? 'connection-strong' : 'connection',
						color: connection.accent
					},
					transform: {
						position: {
							x: (start.position.x + end.position.x) / 2,
							y,
							z: (start.position.z + end.position.z) / 2
						},
						rotation: { y: -Math.atan2(dz, dx) }
					},
					selectable: false,
					boundsRadius: Math.max(0.35, length / 2),
					metadata: { label: connection.label ?? `${start.label} -> ${end.label}` }
				})
			);
		}

		for (const node of nodes) {
			const size = node.size ?? 1;
			const accent = node.accent ?? [0.34, 0.79, 0.92];

			atoms.push(
				GraphScriptManager.createSceneAtom({
					id: `halo-${node.id}`,
					kind: 'node-halo',
					geometry: {
						type: 'box',
						width: size * 1.7,
						height: 0.12,
						depth: size * 1.7,
						color: accent
					},
					material: { kind: 'node-halo', color: accent },
					transform: {
						position: { x: node.position.x, y: node.position.y - 0.36, z: node.position.z },
						rotation: { y: 0.18 }
					},
					selectable: false,
					boundsRadius: size,
					metadata: { label: `${node.label} halo` }
				}),
				GraphScriptManager.createSceneAtom({
					id: `node-${node.id}`,
					kind: 'node',
					geometry: {
						type: 'box',
						width: size * 1.05,
						height: size * 0.72,
						depth: size * 1.05,
						color: [0.84, 0.88, 0.94]
					},
					material: { kind: 'node-core' },
					transform: {
						position: node.position,
						rotation: { y: node.id === 'graph-core' ? 0.78 : 0.38 },
						scale: { x: 1, y: node.id === 'graph-core' ? 1.14 : 1, z: 1 }
					},
					motion: node.id === 'graph-core' ? { spin: { y: 0.18 } } : undefined,
					moleculeId: 'graph-runtime',
					boundsRadius: size * 0.85,
					metadata: {
						label: node.label,
						description: node.description,
						tags: ['graph', 'webgl']
					}
				})
			);
		}

		const molecules: readonly SceneMolecule[] = [
			{
				id: 'graph-runtime',
				label: 'Standalone WebGL Graph',
				atoms
			}
		];

		return {
			id: 'standalone-graph',
			label: 'Standalone WebGL graph',
			nodes,
			connections,
			molecules,
			atoms,
			boundsRadius: 8.4,
			focusTarget: { x: 0, y: 0.05, z: 1.35 },
			defaultPreset: 'iso'
		};
	}

	static pickSceneAtom(
		atoms: readonly SceneAtom[],
		camera: Camera | null,
		canvas: HTMLCanvasElement | null,
		clientX: number,
		clientY: number
	): SceneAtom | null {
		if (!canvas || !camera) {
			return null;
		}

		const canvasRect = canvas.getBoundingClientRect();
		const localX = clientX - canvasRect.left;
		const localY = clientY - canvasRect.top;
		let bestAtom: SceneAtom | null = null;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const atom of atoms) {
			if (atom.visible === false || atom.selectable === false) {
				continue;
			}

			const projection = GraphScriptManager.projectPointToScreen(
				camera,
				canvas,
				atom.transform.position
			);

			if (!projection) {
				continue;
			}

			const dx = projection.x - localX;
			const dy = projection.y - localY;
			const distanceToPointer = Math.hypot(dx, dy);
			const projectedRadius = GraphScriptManager.projectWorldRadiusToPixels(
				camera,
				canvas,
				GraphScriptManager.getAtomBoundsRadius(atom),
				projection.distance
			);
			const threshold = Math.min(20, Math.max(8, projectedRadius * 0.45));

			if (distanceToPointer > threshold) {
				continue;
			}

			const score = distanceToPointer + Math.max(0, projection.depth) * 8;

			if (score < bestScore) {
				bestScore = score;
				bestAtom = atom;
			}
		}

		return bestAtom;
	}

	static clampSceneRadius(radius: number): number {
		return Math.max(2, Math.min(50, radius));
	}

	static clampSceneVerticalAngle(angle: number): number {
		return Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, angle));
	}

	static clampZwickyRadius(radius: number): number {
		return Math.max(
			ZWICKY_LAYOUT_SCALE.cameraMinRadius,
			Math.min(ZWICKY_LAYOUT_SCALE.cameraMaxRadius, radius)
		);
	}

	static buildInstancedNodeBuffers(
		nodes: readonly ZwickyNode[],
		hoveredId: string | null,
		selectedId: string | null,
		domainFilter: ReadonlySet<string>,
		clusterFilter: ReadonlySet<string>
	): {
		instancePositions: Float32Array;
		instanceColors: Float32Array;
		instanceSizes: Float32Array;
		instanceHighlights: Float32Array;
		count: number;
	} {
		const count = nodes.length;
		const instancePositions = new Float32Array(count * 3);
		const instanceColors = new Float32Array(count * 3);
		const instanceSizes = new Float32Array(count);
		const instanceHighlights = new Float32Array(count);
		const hasDomainFilter = domainFilter.size > 0;
		const hasClusterFilter = clusterFilter.size > 0;

		for (let i = 0; i < count; i++) {
			const node = nodes[i];
			const base3 = i * 3;

			instancePositions[base3] = node.x;
			instancePositions[base3 + 1] = node.y;
			instancePositions[base3 + 2] = node.z;

			const domainOk = !hasDomainFilter || domainFilter.has(node.domain);
			const clusterOk = !hasClusterFilter || clusterFilter.has(node.cluster);
			const visible = domainOk && clusterOk;

			const isSelected = node.id === selectedId;
			const isHovered = node.id === hoveredId;

			if (visible) {
				instanceColors[base3] = node.color[0];
				instanceColors[base3 + 1] = node.color[1];
				instanceColors[base3 + 2] = node.color[2];
				instanceSizes[i] = node.size * (isSelected ? 1.8 : isHovered ? 1.3 : 1.0);
				instanceHighlights[i] = isSelected ? 1.0 : isHovered ? 0.6 : 0.0;
			} else {
				instanceColors[base3] = 0.18;
				instanceColors[base3 + 1] = 0.2;
				instanceColors[base3 + 2] = 0.26;
				instanceSizes[i] = node.size * 0.22;
				instanceHighlights[i] = 0.0;
			}
		}

		return { instancePositions, instanceColors, instanceSizes, instanceHighlights, count };
	}

	static buildInstancedEdgeBuffers(
		nodes: readonly ZwickyNode[],
		edges: readonly [string, string][],
		selectedId: string | null,
		domainFilter: ReadonlySet<string>,
		clusterFilter: ReadonlySet<string>
	): Float32Array {
		const nodeIndex = new Map<string, ZwickyNode>();
		for (const node of nodes) nodeIndex.set(node.id, node);

		const hasDomainFilter = domainFilter.size > 0;
		const hasClusterFilter = clusterFilter.size > 0;

		const data = new Float32Array(edges.length * 12);
		let written = 0;

		for (const [fromId, toId] of edges) {
			const from = nodeIndex.get(fromId);
			const to = nodeIndex.get(toId);
			if (!from || !to) continue;

			const fromDomainOk = !hasDomainFilter || domainFilter.has(from.domain);
			const toDomainOk = !hasDomainFilter || domainFilter.has(to.domain);
			const fromClusterOk = !hasClusterFilter || clusterFilter.has(from.cluster);
			const toClusterOk = !hasClusterFilter || clusterFilter.has(to.cluster);

			if (!fromDomainOk || !toDomainOk || !fromClusterOk || !toClusterOk) continue;

			const isActive = selectedId !== null && (fromId === selectedId || toId === selectedId);
			const brightness = isActive ? 1.0 : 0.2;
			const r = from.color[0] * brightness;
			const g = from.color[1] * brightness;
			const b = from.color[2] * brightness;

			const base = written * 12;
			data[base] = from.x;
			data[base + 1] = from.y;
			data[base + 2] = from.z;
			data[base + 3] = r;
			data[base + 4] = g;
			data[base + 5] = b;
			data[base + 6] = to.x;
			data[base + 7] = to.y;
			data[base + 8] = to.z;
			data[base + 9] = r;
			data[base + 10] = g;
			data[base + 11] = b;
			written++;
		}

		return written < edges.length ? data.slice(0, written * 12) : data;
	}

	// X position for each cluster lane — follows assembly direction left→right
	private static readonly CLUSTER_X: Record<string, number> = Object.fromEntries(
		ZWICKY_CLUSTER_ORDER.map((c, i) => [
			c,
			ZWICKY_LAYOUT_SCALE.clusterXFirst + i * ZWICKY_LAYOUT_SCALE.clusterXSpacing
		])
	);

	static layoutZwickyNodes(nodes: ZwickyNode[]): void {
		const { domainZStep, laneScatterX, laneScatterY, laneScatterZ, goldenAngle } =
			ZWICKY_LAYOUT_SCALE;

		// Group: cluster → domain → [nodes]
		const clusterMap = new Map<string, Map<string, ZwickyNode[]>>();
		const domainSet = new Set<string>();

		for (const node of nodes) {
			if (!clusterMap.has(node.cluster)) clusterMap.set(node.cluster, new Map());
			const domMap = clusterMap.get(node.cluster)!;
			if (!domMap.has(node.domain)) domMap.set(node.domain, []);
			domMap.get(node.domain)!.push(node);
			domainSet.add(node.domain);
		}

		const domains = Array.from(domainSet).sort();
		const nDomains = domains.length;
		// Center domains along Z axis
		const domainZ = new Map(domains.map((d, i) => [d, (i - (nDomains - 1) / 2) * domainZStep]));

		for (const [cluster, domMap] of clusterMap) {
			const baseX = GraphScriptManager.CLUSTER_X[cluster] ?? 0;

			for (const [domain, families] of domMap) {
				const baseZ = domainZ.get(domain) ?? 0;
				const n = families.length;

				for (let i = 0; i < n; i++) {
					const node = families[i];

					// Golden phyllotaxis gives uniform coverage, no overlaps
					const r = Math.sqrt((i + 0.5) / n);
					const theta = i * goldenAngle;

					// Constrain X scatter to stay within lane; spread Y vertically
					node.x = baseX + r * laneScatterX * Math.cos(theta);
					node.y = r * laneScatterY * Math.sin(theta);
					node.z = baseZ + r * laneScatterZ * Math.cos(theta + Math.PI / 3);

					node.size = 0.42 + Math.min(node.dependencyIds.length * 0.045, 0.45);
				}
			}
		}
	}

	static parseZwickyGraph(input: GraphJsonInput): {
		nodes: ZwickyNode[];
		edges: readonly [string, string][];
	} {
		const paths = Object.keys(input.dependencies);
		const allPaths = new Set<string>(paths);

		for (const deps of Object.values(input.dependencies)) {
			for (const dep of deps) {
				allPaths.add(dep);
			}
		}

		const nodes: ZwickyNode[] = Array.from(allPaths).map((path) => {
			const parts = path.split('\\');
			const domain = parts[0] ?? '';
			const cluster = parts[1] ?? '';
			const joint = parts[2] ?? '';
			const family = parts[3] ?? '';
			// Color encodes cluster (assembly layer), not domain
			const color = ZWICKY_CLUSTER_COLOR[cluster] ?? [0.5, 0.5, 0.5];

			return {
				id: path,
				path,
				domain,
				cluster,
				joint,
				family,
				level: 'family',
				x: 0,
				y: 0,
				z: 0,
				size: 0.5,
				color,
				dependencyIds: input.dependencies[path] ?? []
			};
		});

		const edges: [string, string][] = [];

		for (const [from, deps] of Object.entries(input.dependencies)) {
			for (const to of deps) {
				if (allPaths.has(to)) {
					edges.push([from, to]);
				}
			}
		}

		return { nodes, edges };
	}

	static pickZwickyNodeFromScreen(
		nodes: readonly ZwickyNode[],
		camera: Camera | null,
		canvas: HTMLCanvasElement | null,
		clientX: number,
		clientY: number
	): ZwickyNode | null {
		if (!camera || !canvas) {
			return null;
		}

		const rect = canvas.getBoundingClientRect();
		const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
		const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

		const view = Array.from(camera.getViewMatrix().toArray());
		const proj = Array.from(camera.getProjectionMatrix().toArray());

		// Unproject two points to get ray (near and far plane)
		const invVP = GraphScriptManager.invertMat4(GraphScriptManager.multiplyMat4(proj, view));
		if (!invVP) return null;

		const near = GraphScriptManager.transformVec4(invVP, [ndcX, ndcY, -1, 1]);
		const far = GraphScriptManager.transformVec4(invVP, [ndcX, ndcY, 1, 1]);

		const rayOrigin = [near[0] / near[3], near[1] / near[3], near[2] / near[3]] as const;
		const farWorld = [far[0] / far[3], far[1] / far[3], far[2] / far[3]] as const;
		const rayDir = GraphScriptManager.normalize([
			farWorld[0] - rayOrigin[0],
			farWorld[1] - rayOrigin[1],
			farWorld[2] - rayOrigin[2]
		]);

		let closestNode: ZwickyNode | null = null;
		let closestT = Infinity;

		for (const node of nodes) {
			const ox = node.x - rayOrigin[0];
			const oy = node.y - rayOrigin[1];
			const oz = node.z - rayOrigin[2];

			const b = ox * rayDir[0] + oy * rayDir[1] + oz * rayDir[2];
			const c = ox * ox + oy * oy + oz * oz - node.size * node.size;
			const disc = b * b - c;

			if (disc < 0) continue;

			const t = b - Math.sqrt(disc);
			if (t > 0 && t < closestT) {
				closestT = t;
				closestNode = node;
			}
		}

		return closestNode;
	}

	private static multiplyMat4(a: number[], b: number[]): number[] {
		const out = new Array<number>(16).fill(0);
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 4; col++) {
				let sum = 0;
				for (let k = 0; k < 4; k++) {
					sum += a[row + k * 4] * b[k + col * 4];
				}
				out[row + col * 4] = sum;
			}
		}
		return out;
	}

	private static invertMat4(m: number[]): number[] | null {
		const det =
			m[0] *
				(m[5] * m[10] * m[15] +
					m[9] * m[14] * m[7] +
					m[13] * m[6] * m[11] -
					m[13] * m[10] * m[7] -
					m[9] * m[6] * m[15] -
					m[5] * m[14] * m[11]) -
			m[4] *
				(m[1] * m[10] * m[15] +
					m[9] * m[14] * m[3] +
					m[13] * m[2] * m[11] -
					m[13] * m[10] * m[3] -
					m[9] * m[2] * m[15] -
					m[1] * m[14] * m[11]) +
			m[8] *
				(m[1] * m[6] * m[15] +
					m[5] * m[14] * m[3] +
					m[13] * m[2] * m[7] -
					m[13] * m[6] * m[3] -
					m[5] * m[2] * m[15] -
					m[1] * m[14] * m[7]) -
			m[12] *
				(m[1] * m[6] * m[11] +
					m[5] * m[10] * m[3] +
					m[9] * m[2] * m[7] -
					m[9] * m[6] * m[3] -
					m[5] * m[2] * m[11] -
					m[1] * m[10] * m[7]);

		if (Math.abs(det) < 1e-8) return null;

		const inv = 1 / det;
		return [
			inv *
				(m[5] * m[10] * m[15] -
					m[5] * m[14] * m[11] -
					m[9] * m[6] * m[15] +
					m[9] * m[14] * m[7] +
					m[13] * m[6] * m[11] -
					m[13] * m[10] * m[7]),
			inv *
				(-m[1] * m[10] * m[15] +
					m[1] * m[14] * m[11] +
					m[9] * m[2] * m[15] -
					m[9] * m[14] * m[3] -
					m[13] * m[2] * m[11] +
					m[13] * m[10] * m[3]),
			inv *
				(m[1] * m[6] * m[15] -
					m[1] * m[14] * m[7] -
					m[5] * m[2] * m[15] +
					m[5] * m[14] * m[3] +
					m[13] * m[2] * m[7] -
					m[13] * m[6] * m[3]),
			inv *
				(-m[1] * m[6] * m[11] +
					m[1] * m[10] * m[7] +
					m[5] * m[2] * m[11] -
					m[5] * m[10] * m[3] -
					m[9] * m[2] * m[7] +
					m[9] * m[6] * m[3]),
			inv *
				(-m[4] * m[10] * m[15] +
					m[4] * m[14] * m[11] +
					m[8] * m[6] * m[15] -
					m[8] * m[14] * m[7] -
					m[12] * m[6] * m[11] +
					m[12] * m[10] * m[7]),
			inv *
				(m[0] * m[10] * m[15] -
					m[0] * m[14] * m[11] -
					m[8] * m[2] * m[15] +
					m[8] * m[14] * m[3] +
					m[12] * m[2] * m[11] -
					m[12] * m[10] * m[3]),
			inv *
				(-m[0] * m[6] * m[15] +
					m[0] * m[14] * m[7] +
					m[4] * m[2] * m[15] -
					m[4] * m[14] * m[3] -
					m[12] * m[2] * m[7] +
					m[12] * m[6] * m[3]),
			inv *
				(m[0] * m[6] * m[11] -
					m[0] * m[10] * m[7] -
					m[4] * m[2] * m[11] +
					m[4] * m[10] * m[3] +
					m[8] * m[2] * m[7] -
					m[8] * m[6] * m[3]),
			inv *
				(m[4] * m[9] * m[15] -
					m[4] * m[13] * m[11] -
					m[8] * m[5] * m[15] +
					m[8] * m[13] * m[7] +
					m[12] * m[5] * m[11] -
					m[12] * m[9] * m[7]),
			inv *
				(-m[0] * m[9] * m[15] +
					m[0] * m[13] * m[11] +
					m[8] * m[1] * m[15] -
					m[8] * m[13] * m[3] -
					m[12] * m[1] * m[11] +
					m[12] * m[9] * m[3]),
			inv *
				(m[0] * m[5] * m[15] -
					m[0] * m[13] * m[7] -
					m[4] * m[1] * m[15] +
					m[4] * m[13] * m[3] +
					m[12] * m[1] * m[7] -
					m[12] * m[5] * m[3]),
			inv *
				(-m[0] * m[5] * m[11] +
					m[0] * m[9] * m[7] +
					m[4] * m[1] * m[11] -
					m[4] * m[9] * m[3] -
					m[8] * m[1] * m[7] +
					m[8] * m[5] * m[3]),
			inv *
				(-m[4] * m[9] * m[14] +
					m[4] * m[13] * m[10] +
					m[8] * m[5] * m[14] -
					m[8] * m[13] * m[6] -
					m[12] * m[5] * m[10] +
					m[12] * m[9] * m[6]),
			inv *
				(m[0] * m[9] * m[14] -
					m[0] * m[13] * m[10] -
					m[8] * m[1] * m[14] +
					m[8] * m[13] * m[2] +
					m[12] * m[1] * m[10] -
					m[12] * m[9] * m[2]),
			inv *
				(-m[0] * m[5] * m[14] +
					m[0] * m[13] * m[6] +
					m[4] * m[1] * m[14] -
					m[4] * m[13] * m[2] -
					m[12] * m[1] * m[6] +
					m[12] * m[5] * m[2]),
			inv *
				(m[0] * m[5] * m[10] -
					m[0] * m[9] * m[6] -
					m[4] * m[1] * m[10] +
					m[4] * m[9] * m[2] +
					m[8] * m[1] * m[6] -
					m[8] * m[5] * m[2])
		];
	}

	private static transformVec4(
		m: number[],
		v: readonly [number, number, number, number]
	): [number, number, number, number] {
		return [
			m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
			m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
			m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
			m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
		];
	}

	private static normalize(v: [number, number, number]): [number, number, number] {
		const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		if (len < 1e-8) return [0, 0, 1];
		return [v[0] / len, v[1] / len, v[2] / len];
	}
}
