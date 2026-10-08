#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;

out vec4 outColor;

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;

	// Intensity peaks while the turtle is actively morphing, and fades out
	// once the graphic mark has fully formed (spec §11 morph window).
	float envelope = smoothstep(0.28, 0.5, uProgress) * (1.0 - smoothstep(0.78, 0.98, uProgress));

	vec2 flow = uv * vec2(5.0, 3.2) + vec2(uTime * 0.05, -uTime * 0.035);
	float n1 = noise(flow);
	float n2 = noise(flow * 2.1 + 4.0);
	float caustic = pow(n1 * 0.6 + n2 * 0.4, 2.0);

	vec3 teal = vec3(0.09, 0.55, 0.55);
	vec3 white = vec3(0.92, 0.98, 0.97);
	vec3 color = mix(teal, white, caustic);

	float alpha = caustic * envelope * 0.55;
	outColor = vec4(color * alpha, alpha);
}
