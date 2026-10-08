#version 300 es
precision mediump float;

in vec2 vUV;
in vec3 vColor;
in float vHighlight;
in float vDepth;

uniform float uTime;
uniform float uFogStart;
uniform float uFogEnd;

out vec4 fragColor;

void main() {
  // Circular mask from billboard quad
  vec2 uv = vUV * 2.0 - 1.0;
  float d  = length(uv);
  if (d > 1.0) discard;

  // Core bright center + soft edge
  float core  = 1.0 - smoothstep(0.0, 0.55, d);
  float rim   = smoothstep(0.55, 0.92, d);
  float alpha = smoothstep(1.0, 0.82, d) * 0.95;

  // Highlight pulse (sin wave)
  float pulse = vHighlight * (0.5 + 0.5 * sin(uTime * 4.0));

  vec3 color = vColor * (core * 1.3 + 0.25);
  color     += vColor * rim  * pulse * 1.8;
  color     += vec3(pulse * 0.35);

  // Depth-based fog (linear)
  float fog = 1.0 - clamp((vDepth - uFogStart) / max(uFogEnd - uFogStart, 0.001), 0.0, 0.78);

  fragColor = vec4(color * fog, alpha);
}
