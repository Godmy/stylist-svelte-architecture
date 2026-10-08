#version 300 es

precision mediump float;

// Фрагментный шейдер с фонгов освещением
in vec3 vNormal;
in vec3 vWorldPos;
in vec2 vTexCoord;

uniform vec3 uLightDir;
uniform vec3 uViewPos;
uniform vec3 uMaterialColor;
uniform float uShininess;

out vec4 fragColor;

void main() {
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(uLightDir);
  vec3 viewDir = normalize(uViewPos - vWorldPos);
  vec3 reflectDir = reflect(-lightDir, norm);

  // Ambient
  float ambient = 0.2;
  // Diffuse
  float diff = max(dot(norm, lightDir), 0.0);
  // Specular
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), uShininess);

  vec3 color = uMaterialColor * (ambient + diff * 0.7 + spec * 0.5);
  fragColor = vec4(color, 1.0);
}
