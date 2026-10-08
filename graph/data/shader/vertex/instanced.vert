#version 300 es
precision highp float;

// Shared billboard quad geometry (two triangles)
layout(location = 0) in vec2 aPosition;

// Per-instance attributes (divisor = 1)
layout(location = 1) in vec3 aInstancePos;
layout(location = 2) in vec3 aInstanceColor;
layout(location = 3) in float aInstanceSize;
layout(location = 4) in float aInstanceHighlight;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUV;
out vec3 vColor;
out float vHighlight;
out float vDepth;

void main() {
  // Extract camera right/up vectors from view matrix columns
  vec3 camRight = normalize(vec3(uViewMatrix[0][0], uViewMatrix[1][0], uViewMatrix[2][0]));
  vec3 camUp    = normalize(vec3(uViewMatrix[0][1], uViewMatrix[1][1], uViewMatrix[2][1]));

  // Billboard: expand quad in screen-aligned plane
  vec3 worldPos = aInstancePos
    + camRight * aPosition.x * aInstanceSize
    + camUp    * aPosition.y * aInstanceSize;

  vUV        = aPosition + vec2(0.5);
  vColor     = aInstanceColor;
  vHighlight = aInstanceHighlight;

  vec4 clip  = uProjectionMatrix * uViewMatrix * vec4(worldPos, 1.0);
  vDepth     = clip.z / clip.w;

  gl_Position = clip;
}
