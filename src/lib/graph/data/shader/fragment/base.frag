#version 300 es

precision mediump float;

// Базовый фрагментный шейдер — вывод цвета с текстурой
in vec3 vColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(vColor, 1.0);
}
