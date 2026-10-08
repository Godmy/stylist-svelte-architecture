<script lang="ts">
	import GlCanvas from '$stylist/webgl/component/atom/gl-canvas/index.svelte';
	import { createProgram } from '$stylist/webgl/function/script/create-program';
	import vertexSource from '$stylist/webgl/data/shader/vertex/full-screen.vert?raw';
	import fragmentSource from '$stylist/webgl/data/shader/fragment/hyperspace.frag?raw';

	let program: WebGLProgram;
	let vao: WebGLVertexArrayObject | null = null;
	let resolutionLocation: WebGLUniformLocation | null;
	let timeLocation: WebGLUniformLocation | null;

	function init(gl: WebGL2RenderingContext) {
		program = createProgram(gl, vertexSource, fragmentSource);
		resolutionLocation = gl.getUniformLocation(program, 'uResolution');
		timeLocation = gl.getUniformLocation(program, 'uTime');
		vao = gl.createVertexArray();
	}

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		const width = gl.drawingBufferWidth;
		const height = gl.drawingBufferHeight;

		gl.useProgram(program);
		gl.uniform2f(resolutionLocation, width, height);
		gl.uniform1f(timeLocation, timeMs * 0.001);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
</script>

<GlCanvas {init} {frame} />
