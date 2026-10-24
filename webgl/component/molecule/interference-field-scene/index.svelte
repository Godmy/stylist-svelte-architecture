<script lang="ts">
	import GlCanvas from '$stylist/webgl/component/atom/gl-canvas/index.svelte';
	import { createProgram } from '$stylist/webgl/function/script/create-program';
	import { shaderTint } from '$stylist/webgl/function/resolve/shader-tint';
	import vertexSource from '$stylist/webgl/data/shader/vertex/full-screen.vert?raw';
	import fragmentSource from '$stylist/webgl/data/shader/fragment/interference-field.frag?raw';
	import type { RecipeInterferenceFieldScene } from '$stylist/webgl/interface/recipe/interference-field-scene';

	let { speed = 1, color = '#80b7eb', onUnsupported }: RecipeInterferenceFieldScene = $props();

	let program: WebGLProgram;
	let vao: WebGLVertexArrayObject | null = null;
	let resolutionLocation: WebGLUniformLocation | null;
	let timeLocation: WebGLUniformLocation | null;
	let tintLocation: WebGLUniformLocation | null;
	let reducedMotion: MediaQueryList | undefined;
	let elapsed = 0;
	let last = 0;

	const rate = $derived(Number.isFinite(speed) ? Math.max(0, Math.min(3, speed)) : 0);
	const tint = $derived(shaderTint(color));

	function init(gl: WebGL2RenderingContext) {
		program = createProgram(gl, vertexSource, fragmentSource);
		resolutionLocation = gl.getUniformLocation(program, 'uResolution');
		timeLocation = gl.getUniformLocation(program, 'uTime');
		tintLocation = gl.getUniformLocation(program, 'uTint');
		vao = gl.createVertexArray();
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	}

	function frame(gl: WebGL2RenderingContext, timeMs: number) {
		// Clamp the step so a background tab does not jump the field forward.
		const delta = Math.min(0.05, (timeMs - last) / 1000 || 0);
		last = timeMs;
		if (document.hidden) return;
		if (!reducedMotion?.matches) elapsed += delta * rate;

		gl.useProgram(program);
		gl.uniform2f(resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.uniform1f(timeLocation, elapsed);
		gl.uniform3f(tintLocation, ...tint);
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
</script>

<GlCanvas {init} {frame} unsupported={onUnsupported} />
