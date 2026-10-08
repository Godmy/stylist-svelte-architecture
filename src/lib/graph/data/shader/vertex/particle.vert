#version 300 es

// Вершинный шейдер для частиц (point sprites)
layout(location = 0) in vec2 aPosition;
layout(location = 1) in float aSize;
layout(location = 2) in float aLife;

uniform mat4 uViewProjection;
uniform float uTime;

out float vLife;
out float vSize;

void main() {
  vLife = aLife;
  vSize = aSize;
  gl_Position = uViewProjection * vec4(aPosition, 0.0, 1.0);
  gl_PointSize = aSize * (1.0 + sin(uTime + aLife * 6.28) * 0.3);
}
