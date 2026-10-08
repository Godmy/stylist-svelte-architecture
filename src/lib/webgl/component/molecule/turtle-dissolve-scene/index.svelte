<script lang="ts">
	import GlCanvas from '$stylist/webgl/component/atom/gl-canvas/index.svelte';
	import { createProgram } from '$stylist/webgl/function/script/create-program';
	import vertexSource from '$stylist/webgl/data/shader/vertex/full-screen.vert?raw';
	import fragmentSource from '$stylist/webgl/data/shader/fragment/turtle-dissolve.frag?raw';

	type Props = {
		progress?: number;
	};

	let { progress = 0 }: Props = $props();

	let program: WebGLProgram;
	let vao: WebGLVertexArrayObject | null = null;
	let resolutionLocation: WebGLUniformLocation | null;
	let timeLocation: WebGLUniformLocation | null;
	let progressLocation: WebGLUniformLocation | null;

	function init(gl: WebGL2RenderingContext) {
		program = createProgram(gl, vertexSource, fragmentSource);
		resolutionLocation = gl.getUniformLocation(program, 'uResolution');
		timeLocation = gl.getUniformLocation(program, 'uTime');
		progressLocation = gl.getUniformLocation(program, 'uProgress');
		vao = gl.createVertexArray();
	}

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		gl.useProgram(program);
		gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.uniform1f(timeLocation, timeMs * 0.001);
		gl.uniform1f(progressLocation, progress);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
</script>

<div class="c-turtle-dissolve-scene" aria-hidden="true">
	<GlCanvas {init} {frame} />
</div>

<style>
	.c-turtle-dissolve-scene {
		position: absolute;
		inset: 0;
		mix-blend-mode: screen;
		pointer-events: none;
	}
</style>
