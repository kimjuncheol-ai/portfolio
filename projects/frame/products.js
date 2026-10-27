import * as THREE from 'three';

// Remove only an approximately uniform border-connected backdrop. Interior label
// whites are preserved. Complex backgrounds should be removed before importing.
export async function readProductPhoto(file, removeBackground = true) {
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('JPG, PNG, WEBP 사진을 선택해주세요.');
  if (file.size > 20 * 1024 * 1024) throw new Error('20 MB 이하의 사진을 선택해주세요.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const ratio = Math.min(1, 1024 / Math.max(img.width, img.height));
    const source = document.createElement('canvas'); source.width = Math.max(1, Math.round(img.width * ratio)); source.height = Math.max(1, Math.round(img.height * ratio));
    const ctx = source.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, source.width, source.height);
    const w = source.width, h = source.height, image = ctx.getImageData(0, 0, w, h), data = image.data;
    if (removeBackground) {
      const corners = [0, w - 1, (h - 1) * w, h * w - 1];
      const colors = corners.filter(i => data[i * 4 + 3] > 245).map(i => Array.from(data.slice(i * 4, i * 4 + 3)));
      const uniform = colors.length >= 3 && colors.every(c => c.every((v, i) => Math.abs(v - colors[0][i]) < 28));
      if (uniform) {
        const color = colors[0], visited = new Uint8Array(w * h), queue = new Int32Array(w * h); let head = 0, tail = 0;
        const add = i => { if (visited[i]) return; visited[i] = 1; const p = i * 4; if (data[p + 3] < 20 || Math.hypot(data[p] - color[0], data[p + 1] - color[1], data[p + 2] - color[2]) < 55) queue[tail++] = i; };
        for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
        for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
        while (head < tail) { const i = queue[head++], x = i % w, y = Math.floor(i / w); data[i * 4 + 3] = 0; if (x) add(i - 1); if (x < w - 1) add(i + 1); if (y) add(i - w); if (y < h - 1) add(i + w); }
      }
    }
    let x0 = w, y0 = h, x1 = -1, y1 = -1; const sum = [0, 0, 0]; let count = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = (y * w + x) * 4; if (data[p + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); if ((x + y) % 8 === 0) { for (let k = 0; k < 3; k++) sum[k] += data[p + k]; count++; } } }
    if (x1 < x0 || y1 < y0 || (x1 - x0 + 1) * (y1 - y0 + 1) < 16) throw new Error('제품 윤곽을 찾지 못했어요. 배경 제거를 끄거나 다른 사진을 선택해주세요.');
    ctx.putImageData(image, 0, 0);
    const cropped = document.createElement('canvas'); cropped.width = x1 - x0 + 1; cropped.height = y1 - y0 + 1;
    cropped.getContext('2d').drawImage(source, x0, y0, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
    const color = '#' + sum.map(v => Math.round(v / Math.max(1, count)).toString(16).padStart(2, '0')).join('');
    return { canvas: cropped, color, name: file.name, thumbnail: cropped.toDataURL('image/png') };
  } finally { URL.revokeObjectURL(url); }
}

function profile(photo) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(photo.canvas, 0, 0, 128, 128);
  const data = ctx.getImageData(0, 0, 128, 128).data, rows = [];
  for (let y = 0; y < 128; y += 2) { let left = 128, right = -1; for (let x = 0; x < 128; x++) if (data[(y * 128 + x) * 4 + 3] > 40) { left = Math.min(left, x); right = Math.max(right, x); } if (right >= left) rows.push({ y: 1 - y / 127, left: left / 127 - .5, right: right / 127 - .5 }); }
  if (rows.length < 2) return [{ y: 1, left: -.5, right: .5 }, { y: 0, left: -.5, right: .5 }];
  rows[0].y = 1; rows[rows.length - 1].y = 0; return rows;
}

function setFaceUVs(geometry, width, height) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  if (g !== geometry) geometry.dispose();
  const p = g.attributes.position, n = g.attributes.normal;
  const batches = Array.from({length:3},()=>({positions:[],normals:[],uvs:[]}));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), normal = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2); normal.crossVectors(b.sub(a), c.sub(a)).normalize();
    const front = normal.z > .15, back = normal.z < -.15, mat = front ? 0 : back ? 1 : 2;
    for (let j = 0; j < 3; j++) { const k=i+j,batch=batches[mat];batch.positions.push(p.getX(k),p.getY(k),p.getZ(k));batch.normals.push(n.getX(k),n.getY(k),n.getZ(k));batch.uvs.push(.5+p.getX(k)/width*(back?-1:1),p.getY(k)/height); }
  }
  const result=new THREE.BufferGeometry(),positions=[],normals=[],uvs=[];let start=0;
  batches.forEach((batch,i)=>{positions.push(...batch.positions);normals.push(...batch.normals);uvs.push(...batch.uvs);const count=batch.positions.length/3;if(count)result.addGroup(start,count,i);start+=count;});
  result.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));result.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));result.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.dispose();return result;
}

export function rebuildProduct(obj) {
  obj.group.traverse(n => { n.geometry?.dispose(); if (n.material) for (const m of Array.isArray(n.material) ? n.material : [n.material]) m.dispose(); }); obj.group.clear();
  const { width: w, height: h, depth: d, shape } = obj.product;
  let geometry;
  if (shape === 'box') { geometry = new THREE.BoxGeometry(w, h, d); geometry.translate(0, h / 2, 0); }
  else if (shape === 'round') {
    const rows = profile(obj.front).slice().reverse();
    const points = [new THREE.Vector2(0, 0), ...rows.map(r => new THREE.Vector2(Math.max(.015, (r.right - r.left) / 2) * w, r.y * h)), new THREE.Vector2(0, h)];
    geometry = new THREE.LatheGeometry(points, 64); geometry.scale(1, 1, d / w);
  } else {
    const rows = profile(obj.front), outline = new THREE.Shape();
    outline.moveTo(rows[0].left * w, rows[0].y * h);
    for (let i = 1; i < rows.length; i++) outline.lineTo(rows[i].left * w, rows[i].y * h);
    for (let i = rows.length - 1; i >= 0; i--) outline.lineTo(rows[i].right * w, rows[i].y * h);
    outline.closePath(); geometry = new THREE.ExtrudeGeometry(outline, { depth: d, bevelEnabled: false, steps: 1 }); geometry.translate(0, 0, -d / 2);
  }
  geometry = setFaceUVs(geometry, w, h);
  // Solid materials keep the mesh closed. Source alpha is composited over the
  // side color so a transparent photo cannot punch holes through its back.
  for (const side of ['front', 'back']) {
    obj[side + 'Texture']?.dispose(); const source = obj[side].canvas;
    const c = document.createElement('canvas'); c.width = source.width; c.height = source.height;
    const ctx = c.getContext('2d'); ctx.fillStyle = obj.color; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(source, 0, 0);
    obj[side + 'Texture'] = new THREE.CanvasTexture(c); obj[side + 'Texture'].colorSpace = THREE.SRGBColorSpace;
  }
  const mats = [new THREE.MeshStandardMaterial({ map: obj.frontTexture, roughness: .7 }), new THREE.MeshStandardMaterial({ map: obj.backTexture, roughness: .7 }), new THREE.MeshStandardMaterial({ color: obj.color, roughness: .7 })];
  const mesh = new THREE.Mesh(geometry, mats); mesh.castShadow = mesh.receiveShadow = true; obj.group.add(mesh);
}

export function disposeProduct(obj) {
  obj.group.traverse(n => { n.geometry?.dispose(); if (n.material) for (const m of Array.isArray(n.material) ? n.material : [n.material]) m.dispose(); });
  obj.frontTexture?.dispose(); obj.backTexture?.dispose();
}
