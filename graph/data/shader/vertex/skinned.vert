#version 300 es

// Вершинный шейдер с поддержкой скелетной анимации
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in vec4 aBoneIds;
layout(location = 4) in vec4 aBoneWeights;

uniform mat4 uModelViewProjection;
uniform mat4 uBoneMatrices[64];

out vec3 vNormal;
out vec2 vTexCoord;
out vec3 vWorldPos;

void main() {
  // Смешивание матриц костей
  mat4 skinMatrix = 
      aBoneWeights.x * uBoneMatrices[int(aBoneIds.x)] +
      aBoneWeights.y * uBoneMatrices[int(aBoneIds.y)] +
      aBoneWeights.z * uBoneMatrices[int(aBoneIds.z)] +
      aBoneWeights.w * uBoneMatrices[int(aBoneIds.w)];

  vec4 skinnedPos = skinMatrix * vec4(aPosition, 1.0);
  vWorldPos = skinnedPos.xyz;
  vNormal = mat3(skinMatrix) * aNormal;
  vTexCoord = aTexCoord;
  gl_Position = uModelViewProjection * skinnedPos;
}
