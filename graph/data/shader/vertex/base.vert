#version 300 es

// Базовый вершинный шейдер — передача позиции и текстурных координат
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uTintColor;
uniform float uTintStrength;

out vec3 vColor;

void main() {
  vColor = mix(aColor, uTintColor, uTintStrength);
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
