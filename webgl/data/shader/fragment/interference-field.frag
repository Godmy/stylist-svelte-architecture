#version 300 es
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uTint;

out vec4 outColor;

// Animated interference field: a pulsing ring modulated by radial waves.
void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
	float r = length(p);
	float a = atan(p.y, p.x);
	float wave = sin(r * 30.0 - uTime * 2.0 + sin(a * 5.0 + uTime) * 2.0);
	float ring = exp(-abs(r - 0.28) * 12.0);
	vec3 color = uTint * (0.12 + ring * (0.55 + 0.45 * wave)) + vec3(0.03, 0.05, 0.10);
	outColor = vec4(color, 1.0);
}
