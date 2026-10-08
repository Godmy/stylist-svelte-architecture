#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 outColor;

float hash(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

	float angle = atan(uv.y, uv.x);
	float radius = length(uv);

	const float LANE_COUNT = 180.0;
	const float TWO_PI = 6.28318530718;
	float laneSize = TWO_PI / LANE_COUNT;
	float laneIndex = floor(angle / laneSize + 0.5);
	float laneCenter = laneIndex * laneSize;

	// arc length to the lane centerline stays constant width regardless of radius
	float tangentialDist = abs(angle - laneCenter) * radius;

	float rndPhase = hash(laneIndex);
	float rndSpeed = hash(laneIndex + 17.0);
	float rndWidth = hash(laneIndex + 53.0);

	float speed = 0.25 + rndSpeed * 0.55;
	float maxRadius = 1.3;
	float head = mod(uTime * speed + rndPhase * 8.0, maxRadius);

	float trailLength = 0.12 + rndWidth * 0.1;
	float distBehindHead = head - radius;

	float trail = 0.0;
	if (distBehindHead >= 0.0 && distBehindHead <= trailLength) {
		trail = pow(1.0 - distBehindHead / trailLength, 1.5);
	}

	float lineWidth = mix(0.0018, 0.0035, rndWidth);
	float lineMask = smoothstep(lineWidth, 0.0, tangentialDist);

	float brightness = lineMask * trail;
	float centerGlow = smoothstep(0.25, 0.0, radius) * 0.5;

	vec3 baseColor = mix(vec3(0.5, 0.75, 1.0), vec3(1.0, 1.0, 1.0), rndPhase);
	vec3 color = baseColor * brightness + vec3(0.6, 0.8, 1.0) * centerGlow;

	outColor = vec4(color, 1.0);
}
