<script lang="ts">
	import GlCanvas from '$stylist/webgl/component/atom/gl-canvas/index.svelte';
	import { createProgram } from '$stylist/webgl/function/script/create-program';
	import vertexSource from '$stylist/webgl/data/shader/vertex/full-screen.vert?raw';
	import fragmentSource from '$stylist/webgl/data/shader/fragment/concentric-circles.frag?raw';

	type Props = {
		ringCount?: number;
	};

	let { ringCount = 100 }: Props = $props();

	let program: WebGLProgram;
	let vao: WebGLVertexArrayObject | null = null;
	let resolutionLocation: WebGLUniformLocation | null;
	let ringCountLocation: WebGLUniformLocation | null;
	let maxRadiusLocation: WebGLUniformLocation | null;
	let timeLocation: WebGLUniformLocation | null;

	function init(gl: WebGL2RenderingContext) {
		program = createProgram(gl, vertexSource, fragmentSource);
		resolutionLocation = gl.getUniformLocation(program, 'uResolution');
		ringCountLocation = gl.getUniformLocation(program, 'uRingCount');
		maxRadiusLocation = gl.getUniformLocation(program, 'uMaxRadius');
		timeLocation = gl.getUniformLocation(program, 'uTime');
		vao = gl.createVertexArray();
	}

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		const width = gl.drawingBufferWidth;
		const height = gl.drawingBufferHeight;
		const maxRadius = Math.hypot(width, height) * 0.5;

		gl.useProgram(program);
		gl.uniform2f(resolutionLocation, width, height);
		gl.uniform1f(ringCountLocation, ringCount);
		gl.uniform1f(maxRadiusLocation, maxRadius);
		gl.uniform1f(timeLocation, timeMs * 0.001);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
</script>

<GlCanvas {init} {frame} />
