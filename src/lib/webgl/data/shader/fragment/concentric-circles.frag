#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uRingCount;
uniform float uMaxRadius;
uniform float uTime;

out vec4 outColor;

vec3 hsv2rgb(vec3 c) {
	vec4 k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
	return c.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), c.y);
}

void main() {
	vec2 center = uResolution * 0.5;
	float dist = distance(gl_FragCoord.xy, center);
	float ringWidth = uMaxRadius / uRingCount;
	float ringIndex = floor(dist / ringWidth);
	float hue = mod(ringIndex / uRingCount + uTime * 0.02, 1.0);
	outColor = vec4(hsv2rgb(vec3(hue, 0.8, 0.95)), 1.0);
}
