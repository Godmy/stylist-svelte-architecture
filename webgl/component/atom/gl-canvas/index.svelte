<script lang="ts">
	type Props = {
		init?: (gl: WebGL2RenderingContext) => void;
		frame?: (gl: WebGL2RenderingContext, timeMs: number) => void;
		resize?: (gl: WebGL2RenderingContext, width: number, height: number) => void;
	};

	let { init, frame, resize }: Props = $props();

	let canvas: HTMLCanvasElement;
	let gl: WebGL2RenderingContext | null = null;
	let rafId = 0;
	let resizeObserver: ResizeObserver | undefined;

	function resizeToDisplaySize() {
		if (!gl || !canvas) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
		const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
			resize?.(gl, width, height);
		}
	}

	function loop(timeMs: number) {
		if (!gl) return;
		resizeToDisplaySize();
		frame?.(gl, timeMs);
		rafId = requestAnimationFrame(loop);
	}

	function setup(node: HTMLCanvasElement) {
		canvas = node;
		gl = canvas.getContext('webgl2');
		if (!gl) {
			console.error('WebGL2 is not supported in this browser.');
			return;
		}
		resizeToDisplaySize();
		init?.(gl);
		rafId = requestAnimationFrame(loop);

		resizeObserver = new ResizeObserver(() => resizeToDisplaySize());
		resizeObserver.observe(canvas);

		return {
			destroy() {
				cancelAnimationFrame(rafId);
				resizeObserver?.disconnect();
			}
		};
	}
</script>

<canvas use:setup class="gl-canvas"></canvas>

<style>
	.gl-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
