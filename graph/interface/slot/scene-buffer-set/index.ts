export interface SceneBufferSet {
	position: WebGLBuffer;
	color: WebGLBuffer;
	vertexArray: WebGLVertexArrayObject | null;
	vertexCount: number;
}
