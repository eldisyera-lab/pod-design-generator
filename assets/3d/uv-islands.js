/**
 * Groups triangles into UV islands by shared UV edges.
 *
 * This helper is deliberately independent from Three.js so it can be tested
 * without a WebGL context. It does not infer semantic body-part names.
 *
 * @param {ArrayLike<number>|{array:ArrayLike<number>,itemSize?:number}} uvAttribute
 * @param {ArrayLike<number>|{array:ArrayLike<number>}|null} indexAttribute
 * @param {{epsilon?:number}} options
 * @returns {{faceToIsland:Int32Array,islands:Array,faceCount:number,vertexCount:number}|null}
 */
export function buildUvIslands(uvAttribute, indexAttribute = null, options = {}) {
  const uv = uvAttribute?.array || uvAttribute;
  const indices = indexAttribute?.array || indexAttribute;
  const itemSize = uvAttribute?.itemSize || 2;
  const epsilon = Number.isFinite(options.epsilon) && options.epsilon > 0
    ? options.epsilon
    : 1e-6;

  if (!uv || itemSize < 2 || uv.length < itemSize * 3 || uv.length % itemSize !== 0) {
    return null;
  }

  const vertexCount = uv.length / itemSize;
  const elementCount = indices ? indices.length : vertexCount;
  if (elementCount < 3 || elementCount % 3 !== 0) return null;

  const faceCount = elementCount / 3;
  const parent = new Int32Array(faceCount);
  const rank = new Uint8Array(faceCount);
  for (let i = 0; i < faceCount; i++) parent[i] = i;

  const find = value => {
    let root = value;
    while (parent[root] !== root) root = parent[root];
    while (parent[value] !== value) {
      const next = parent[value];
      parent[value] = root;
      value = next;
    }
    return root;
  };

  const unite = (a, b) => {
    let ra = find(a), rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) [ra, rb] = [rb, ra];
    parent[rb] = ra;
    if (rank[ra] === rank[rb]) rank[ra]++;
  };

  const uvKey = vertex => {
    if (!Number.isInteger(vertex) || vertex < 0 || vertex >= vertexCount) return null;
    const u = Number(uv[vertex * itemSize]);
    const v = Number(uv[vertex * itemSize + 1]);
    if (!Number.isFinite(u) || !Number.isFinite(v)) return null;
    return Math.round(u / epsilon) + "," + Math.round(v / epsilon);
  };

  const edgeOwners = new Map();
  for (let face = 0; face < faceCount; face++) {
    const offset = face * 3;
    const vertices = indices
      ? [Number(indices[offset]), Number(indices[offset + 1]), Number(indices[offset + 2])]
      : [offset, offset + 1, offset + 2];
    const keys = vertices.map(uvKey);
    if (keys.some(key => key === null)) return null;

    for (let edge = 0; edge < 3; edge++) {
      const a = keys[edge], b = keys[(edge + 1) % 3];
      const edgeKey = a < b ? a + "|" + b : b + "|" + a;
      const owner = edgeOwners.get(edgeKey);
      if (owner === undefined) edgeOwners.set(edgeKey, face);
      else unite(face, owner);
    }
  }

  const groups = new Map();
  for (let face = 0; face < faceCount; face++) {
    const root = find(face);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(face);
  }

  const ordered = Array.from(groups.values()).sort((a, b) => a[0] - b[0]);
  const faceToIsland = new Int32Array(faceCount);
  const islands = ordered.map((faces, id) => {
    let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity;
    for (const face of faces) {
      const offset = face * 3;
      const vertices = indices
        ? [Number(indices[offset]), Number(indices[offset + 1]), Number(indices[offset + 2])]
        : [offset, offset + 1, offset + 2];
      for (const vertex of vertices) {
        const u = Number(uv[vertex * itemSize]);
        const v = Number(uv[vertex * itemSize + 1]);
        minU = Math.min(minU, u);
        minV = Math.min(minV, v);
        maxU = Math.max(maxU, u);
        maxV = Math.max(maxV, v);
      }
      faceToIsland[face] = id;
    }
    return {
      id,
      faceIndices: faces,
      triangleCount: faces.length,
      bounds: { minU, minV, maxU, maxV }
    };
  });

  return { faceToIsland, islands, faceCount, vertexCount };
}
