/** WebGL2 canvas hooks: called once with the context, on every animation frame and on resize. */
export interface RecipeGlCanvas {
	init?: (gl: WebGL2RenderingContext) => void;
	frame?: (gl: WebGL2RenderingContext, timeMs: number) => void;
	resize?: (gl: WebGL2RenderingContext, width: number, height: number) => void;
}
