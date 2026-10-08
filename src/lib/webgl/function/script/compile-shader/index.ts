export function compileShader(
	gl: WebGLRenderingContext | WebGL2RenderingContext,
	source: string,
	type: number
): WebGLShader {
	const shader = gl.createShader(type);

	if (!shader) {
		throw new Error('Unable to create shader');
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const error = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error(`Unable to compile shader: ${error}`);
	}

	return shader;
}
