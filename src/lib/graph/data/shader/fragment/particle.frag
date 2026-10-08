#version 300 es

precision mediump float;

// Фрагментный шейдер для частиц с затуханием
in float vLife;
in float vSize;

uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform sampler2D uPointSprite;

out vec4 fragColor;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist = length(coord);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.1, dist);
  vec3 color = mix(uColorStart, uColorEnd, vLife);
  float brightness = 1.0 - vLife * 0.5;

  fragColor = vec4(color * brightness, alpha);
}
