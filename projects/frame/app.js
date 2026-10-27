import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { readProductPhoto, rebuildProduct, disposeProduct } from './products.js';
export { scene, objects };

const $ = id => document.getElementById(id);
const radians = THREE.MathUtils.degToRad;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true, preserveDrawingBuffer: true }); }
catch (e) { $('fatal').hidden = false; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d5d5cb');
scene.fog = new THREE.Fog('#d5d5cb', 16, 45);
const camera = new THREE.PerspectiveCamera(40, 1.5, .05, 150);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.minDistance = 1; controls.maxDistance = 18;
controls.minPolarAngle = radians(1); controls.maxPolarAngle = radians(110);
controls.target.set(0, 1, 0);
const hemi = new THREE.HemisphereLight('#ffffff', '#8c927f', 2.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff7e5', 3.2); sun.position.set(-3, 7, 4); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10; sun.shadow.normalBias = .025; scene.add(sun);
const fill = new THREE.DirectionalLight('#edf2ff', 1); fill.position.set(5, 3, -4); scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#cacbbf', roughness: .93 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = -.015; scene.add(floor);
const grid = new THREE.GridHelper(40, 80, '#a5ab99', '#b6bbab'); grid.position.y = -.009;
grid.material.transparent = true; grid.material.opacity = .38; scene.add(grid);
const selection = new THREE.Mesh(new THREE.RingGeometry(.36, .38, 64), new THREE.MeshBasicMaterial({ color:'#849755', side:THREE.DoubleSide, transparent:true, opacity:.8 }));
selection.rotation.x = -Math.PI / 2; selection.position.y = .005; scene.add(selection);
const objects = []; let selected = null, serial = 0, photoMesh = null, photoImage = null, photoTexture = null, aspect = 1.5, busy = false;
const materials = new Map();
function material(color) { if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({color, roughness:.66})); return materials.get(color); }
const sphereGeo = new THREE.SphereGeometry(1, 24, 18);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
function ellipsoid(parent, pos, size, mat) { const m = new THREE.Mesh(sphereGeo, mat); m.position.set(...pos); m.scale.set(...size); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function bone(parent, a, b, radius, mat) { const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b); const m = new THREE.Mesh(cylinderGeo, mat); m.position.copy(av).add(bv).multiplyScalar(.5); m.scale.set(radius, av.distanceTo(bv), radius); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), bv.sub(av).normalize()); m.castShadow = true; m.receiveShadow = true; parent.add(m); ellipsoid(parent,a,[radius,radius,radius],mat); ellipsoid(parent,b,[radius,radius,radius],mat); }
function makePerson(obj) {
  obj.group.traverse(n=>{if(n.geometry?.type==='BoxGeometry')n.geometry.dispose();});
  obj.group.clear(); const mat = material(obj.color), joint = material('#8c9085');
  const breadth = obj.body === 'broad' ? 1.2 : obj.body === 'slim' ? .83 : 1;
  const sitting = obj.pose === 'sit', base = sitting ? -.42 : 0;
  ellipsoid(obj.group,[0,1.25+base,0],[.235*breadth,.33,.14],mat);
  ellipsoid(obj.group,[0,.93+base,0],[.19*breadth,.15,.14],mat);
  bone(obj.group,[0,1.49+base,0],[0,1.57+base,0],.065,joint);
  ellipsoid(obj.group,[0,1.70+base,0],[.115,.155,.105],mat);
  ellipsoid(obj.group,[0,1.69+base,.104],[.03,.035,.025],mat);
  const arms = obj.pose === 'arms', reach = obj.pose === 'reach', walk = obj.pose === 'walk';
  const holding = ['palm','grip','present'].includes(obj.pose);
  const held=objects.find(o=>o.type==='product'&&o.ownerId===obj.id);
  const heldWidth=held?held.product.width*held.scale:.12,heldDepth=held?held.product.depth*held.scale:.08;
  for(const sign of [-1,1]) {
    const shoulder = [sign*.235*breadth,1.44+base,0];
    let elbow = [sign*.29*breadth,1.14+base,.015], hand = [sign*.32*breadth,.88+base,.055];
    if(arms){elbow=[sign*.49,1.43,0];hand=[sign*.73,1.43,0];}
    if(reach&&sign===1){elbow=[.35,1.7,0];hand=[.39,1.96,.02];}
    if(sitting){elbow=[sign*.3,.8,.05];hand=[sign*.22,.61,.32];}
    if(walk){elbow[2]=sign*.16;hand[2]=sign*.28;}
    const activeHand=holding&&(sign===1||obj.pose==='present');
    if(activeHand){elbow=[sign*.29*breadth,1.07,.12];hand=obj.pose==='grip'?[.25+heldWidth/2+.02,1.24,.425]:obj.pose==='present'?[sign*Math.max(.028,heldWidth*.32),1.1,.40]:[.34,1.12,.40];}
    bone(obj.group,shoulder,elbow,.065*breadth,mat); bone(obj.group,elbow,hand,.048*breadth,mat);
    if(activeHand){
      if(obj.pose==='grip'){
        ellipsoid(obj.group,hand,[.023,.068,.04],mat);
        for(let f=0;f<4;f++){const y=hand[1]-.045+f*.027,edge=hand[0]-.02,front=.425+heldDepth/2+.014;bone(obj.group,[hand[0],y,.445],[edge,y,front],.012,mat);bone(obj.group,[edge,y,front],[edge-Math.min(.085,heldWidth*.65),y,front],.011,mat);}
        bone(obj.group,[hand[0],hand[1]-.035,.405],[hand[0]-.05,hand[1]+.025,.425-heldDepth/2-.017],.017,mat);
      }else{
        ellipsoid(obj.group,hand,[.060,.025,.075],mat);
        for(let f=0;f<4;f++){const x=hand[0]-.04+f*.025;bone(obj.group,[x,hand[1],hand[2]+.055],[x,hand[1]+.009,hand[2]+.12],.011,mat);}
        bone(obj.group,[hand[0]-.04,hand[1],hand[2]],[hand[0]-.078,hand[1]+.015,hand[2]+.05],.015,mat);
      }
    }else ellipsoid(obj.group,hand,[.049,.078,.04],mat);
    const hip=[sign*.105,.92+base,0];
    let knee=[sign*.12,.5,0],ankle=[sign*.14,.09,.02];
    if(sitting){knee=[sign*.13,.51,.39];ankle=[sign*.13,.09,.41];}
    if(walk){knee=[sign*.12,.49,sign*.19];ankle=[sign*.14,.09,sign*.37];}
    bone(obj.group,hip,knee,.089*breadth,mat); bone(obj.group,knee,ankle,.063*breadth,mat);
    ellipsoid(obj.group,[ankle[0],.055,ankle[2]+.06],[.07,.055,.14],mat);
  }
  if(sitting){const seat=new THREE.Mesh(new THREE.BoxGeometry(.5,.48,.43),material('#9b9d8e'));seat.position.set(0,.24,-.03);seat.castShadow=true;seat.receiveShadow=true;obj.group.add(seat);}
}
function addObject(type) {
  if(objects.length>=20){toast('한 장면에 오브젝트를 최대 20개까지 배치할 수 있어요.');return;}
  const obj={id:++serial,type,name:`${type==='person'?'인물':'박스'} ${String(serial).padStart(2,'0')}`,group:new THREE.Group(),color:type==='person'?'#bbbcb5':'#b3b9a1',pose:'stand',body:'regular',scale:1};
  if(type==='person')makePerson(obj);else{const m=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.7),material(obj.color));m.position.y=.35;m.castShadow=true;m.receiveShadow=true;obj.group.add(m);}
  obj.group.position.x = objects.length ? Math.min(3,objects.length*.85) : 0;
  scene.add(obj.group);objects.push(obj);selectObject(obj);return obj;
}
function listObjects(){
  $('object-list').replaceChildren();
  objects.forEach(obj=>{const b=document.createElement('button');b.className='object-item'+(obj===selected?' selected':'');b.setAttribute('aria-pressed',String(obj===selected));const dot=document.createElement('i');dot.style.background=obj.color;const name=document.createElement('span');name.textContent=obj.name;const tag=document.createElement('span');tag.textContent='3D';b.append(dot,name,tag);b.onclick=()=>selectObject(obj);$('object-list').append(b);});
  if(!objects.length){const p=document.createElement('p');p.className='hint';p.textContent='인물이나 박스를 추가해 장면을 구성하세요.';$('object-list').append(p);}
}
function selectObject(obj){
  selected=obj;$('object-settings').hidden=!obj;selection.visible=!!obj;listObjects();
  if(obj){$('selection-name').textContent=obj.name;$('person-options').hidden=obj.type!=='person';$('product-options').hidden=obj.type!=='product';$('pose').value=obj.pose;$('body').value=obj.body;$('color').value=obj.color;for(const axis of ['x','y','z']){$('pos-'+axis).value=obj.group.position[axis].toFixed(2);$('pos-'+axis).disabled=!!obj.ownerId;}$('rotation').value=obj.type==='product'?obj.turn:Math.round(THREE.MathUtils.radToDeg(obj.group.rotation.y));$('scale').value=obj.scale;if(obj.type==='product')syncProductPanel(obj);syncObjectOutputs();}
  render();
}
function syncObjectOutputs(){if(!selected)return;$('rotation-value').textContent=`${$('rotation').value}°`;$('scale-value').textContent=`${Number($('scale').value).toFixed(2)}×`;selection.position.set(selected.group.position.x,.006,selected.group.position.z);selection.scale.setScalar(selected.scale);}
function render(){updateAttachments();renderer.render(scene,camera);}
function fit(){const area=$('viewport-area'),w=area.clientWidth-56,h=area.clientHeight-40;let fw=w,fh=w/aspect;if(fh>h){fh=h;fw=h*aspect;}$('frame').style.width=`${Math.max(1,fw)}px`;$('frame').style.height=`${Math.max(1,fh)}px`;renderer.setSize(Math.max(1,Math.round(fw)),Math.max(1,Math.round(fh)),false);camera.aspect=aspect;camera.updateProjectionMatrix();render();}
new ResizeObserver(fit).observe($('viewport-area'));
function cameraFromInputs(){const az=radians(Number($('azimuth').value)),el=radians(Number($('elevation').value)),d=Number($('distance').value);controls.target.y=Number($('target-height').value);camera.position.set(controls.target.x+d*Math.cos(el)*Math.sin(az),controls.target.y+d*Math.sin(el),controls.target.z+d*Math.cos(el)*Math.cos(az));camera.setFocalLength(Number($('lens').value));controls.update();syncCamera();render();}
function syncCamera(){const v=camera.position.clone().sub(controls.target),d=v.length();$('azimuth').value=Math.round(THREE.MathUtils.radToDeg(Math.atan2(v.x,v.z)));$('elevation').value=Math.round(THREE.MathUtils.radToDeg(Math.asin(v.y/d)));$('distance').value=d.toFixed(1);$('target-height').value=controls.target.y;$('azimuth-value').textContent=`${$('azimuth').value}°`;$('elevation-value').textContent=`${$('elevation').value}°`;$('distance-value').textContent=`${d.toFixed(1)} m`;$('lens-value').textContent=`${$('lens').value} mm`;$('target-height-value').textContent=`${controls.target.y.toFixed(2)} m`;document.querySelectorAll('[data-lens]').forEach(b=>b.classList.toggle('selected',b.dataset.lens===$('lens').value));}
controls.addEventListener('change',()=>{syncCamera();render();});
for(const id of ['azimuth','elevation','distance','lens','target-height'])$(id).addEventListener('input',()=>{clearPreset();cameraFromInputs();});
function clearPreset(){document.querySelectorAll('[data-shot]').forEach(b=>b.classList.remove('selected'));}
controls.addEventListener('start',clearPreset);
const shots={front:[0,8,6,1],three:[35,12,6,1],low:[-15,-10,5.5,1],high:[25,35,6,1],top:[0,89,6,0]};
function preset(name){const values=shots[name];if(!values)return;['azimuth','elevation','distance','target-height'].forEach((id,i)=>$(id).value=values[i]);controls.target.set(0,values[3],0);clearPreset();document.querySelector(`[data-shot="${name}"]`).classList.add('selected');cameraFromInputs();}
document.querySelectorAll('[data-shot]').forEach(b=>b.onclick=()=>preset(b.dataset.shot));
document.querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{$('lens').value=b.dataset.lens;cameraFromInputs();});
$('reset-camera').onclick=()=>{$('lens').value=50;preset('front');};
$('aspect').onchange=()=>{aspect=Number($('aspect').value);$('frame-ratio').textContent=$('aspect').selectedOptions[0].text;fit();};
$('grid-toggle').onclick=()=>{grid.visible=!grid.visible;$('grid-toggle').classList.toggle('active',grid.visible);$('grid-toggle').setAttribute('aria-pressed',String(grid.visible));render();};
$('guide-toggle').onclick=()=>{$('thirds').hidden=!$('thirds').hidden;$('guide-toggle').classList.toggle('active',!$('thirds').hidden);$('guide-toggle').setAttribute('aria-pressed',String(!$('thirds').hidden));};
$('add-person').onclick=()=>addObject('person');$('add-box').onclick=()=>addObject('box');
$('delete-object').onclick=()=>{if(!selected)return;const index=objects.indexOf(selected);for(const p of objects.filter(o=>o.ownerId===selected.id))detachProduct(p);scene.remove(selected.group);if(selected.type==='product')disposeProduct(selected);else selected.group.traverse(n=>{if(n.geometry&&!['SphereGeometry','CylinderGeometry'].includes(n.geometry.type))n.geometry.dispose();});objects.splice(index,1);selectObject(objects[Math.min(index,objects.length-1)]??null);};
for(const id of ['pose','body','color'])$(id).addEventListener('input',()=>{if(!selected)return;selected[id]=$(id).value;if(selected.type==='person'){if(id==='pose'&&!['palm','grip','present'].includes(selected.pose))for(const p of objects.filter(o=>o.ownerId===selected.id))detachProduct(p);makePerson(selected);}else if(selected.type==='product')rebuildProduct(selected);else selected.group.children[0].material=material(selected.color);listObjects();render();});
for(const axis of ['x','y','z'])$('pos-'+axis).addEventListener('input',()=>{if(!selected||selected.ownerId)return;const n=Number($('pos-'+axis).value);if(!Number.isFinite(n))return;selected.group.position[axis]=THREE.MathUtils.clamp(n,axis==='y'?0:-8,8);syncObjectOutputs();render();});
$('rotation').oninput=()=>{if(selected){if(selected.type==='product')selected.turn=Number($('rotation').value);else selected.group.rotation.y=radians(Number($('rotation').value));syncObjectOutputs();render();}};
$('scale').oninput=()=>{if(selected){selected.scale=Number($('scale').value);selected.group.scale.setScalar(selected.scale);if(selected.type==='product')refreshOwnerHands(selected);syncObjectOutputs();render();}};
const palettes={warm:['#d5d5cb','#cacbbf'],light:['#f0f0ec','#e5e5df'],dark:['#333b36','#404940'],sage:['#c7cdbc','#b6c1aa']};
$('environment').onchange=()=>{const [bg,ground]=palettes[$('environment').value];scene.background.set(bg);scene.fog.color.set(bg);floor.material.color.set(ground);render();};
$('light').oninput=()=>{const v=Number($('light').value)/100;sun.intensity=3.2*v;hemi.intensity=2.1*v;$('light-value').textContent=`${$('light').value}%`;render();};

function createPhoto(){
  if(!photoImage)return;
  if(photoMesh){scene.remove(photoMesh);photoMesh.geometry.dispose();photoMesh.material.dispose();}
  const width=6,height=width/(photoImage.width/photoImage.height),segments=128;
  const geometry=new THREE.PlaneGeometry(width,height,segments,segments);
  const sample=document.createElement('canvas');sample.width=segments+1;sample.height=segments+1;
  const ctx=sample.getContext('2d',{willReadFrequently:true});ctx.filter='blur(2px)';ctx.drawImage(photoImage,0,0,sample.width,sample.height);
  const pixels=ctx.getImageData(0,0,sample.width,sample.height).data,positions=geometry.attributes.position;
  const depth=$('photo-mode').value==='flat'?0:Number($('depth').value),sign=$('invert').checked?-1:1;
  for(let i=0;i<positions.count;i++){const p=i*4;const brightness=(.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2])/255;positions.setZ(i,(brightness-.5)*depth*sign);}
  geometry.computeVertexNormals();
  photoMesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:photoTexture,side:THREE.DoubleSide,transparent:true}));
  const photoScale=Number($('photo-scale').value);
  photoMesh.position.set(0,height/2*photoScale,-2.2);photoMesh.scale.setScalar(photoScale);scene.add(photoMesh);render();
}
async function loadPhoto(file){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('JPG, PNG, WEBP 사진을 선택해주세요.');return;}
  if(file.size>20*1024*1024){toast('20 MB 이하의 사진을 선택해주세요.');return;}
  const token=++photoLoadToken;
  const url=URL.createObjectURL(file);
  try{
    const img=new Image();img.src=url;await img.decode();if(token!==photoLoadToken)return;
    const canvas=document.createElement('canvas'),ratio=Math.min(1,2048/Math.max(img.width,img.height));canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    if(photoTexture)photoTexture.dispose();photoImage=canvas;photoTexture=new THREE.CanvasTexture(canvas);photoTexture.colorSpace=THREE.SRGBColorSpace;createPhoto();
    $('photo-thumb').src=canvas.toDataURL('image/jpeg',.8);$('photo-name').textContent=file.name;$('photo-card').hidden=false;$('photo').value='';toast('사진을 입체 배경으로 불러왔어요. 깊이와 카메라를 조정해보세요.');
  }catch{toast('사진을 읽지 못했어요. 다른 이미지 파일을 선택해주세요.');}finally{URL.revokeObjectURL(url);}
}
let photoLoadToken=0;
$('photo').onchange=e=>loadPhoto(e.target.files[0]);
$('dropzone').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('photo').click();}};
for(const event of ['dragenter','dragover'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.add('dragover');});
for(const event of ['dragleave','drop'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.remove('dragover');if(event==='drop')loadPhoto(e.dataTransfer.files[0]);});
$('remove-photo').onclick=()=>{photoLoadToken++;if(photoMesh){scene.remove(photoMesh);photoMesh.geometry.dispose();photoMesh.material.dispose();}photoTexture?.dispose();photoMesh=photoTexture=photoImage=null;$('photo-thumb').removeAttribute('src');$('photo-card').hidden=true;render();};
for(const id of ['depth','photo-mode','invert'])$(id).addEventListener('input',()=>{$('depth-value').textContent=Number($('depth').value).toFixed(2);createPhoto();});
$('photo-scale').oninput=()=>{$('photo-scale-value').textContent=`${Number($('photo-scale').value).toFixed(2)}×`;if(photoMesh){const s=Number($('photo-scale').value);photoMesh.scale.setScalar(s);photoMesh.position.y=photoImage.height/photoImage.width*3*s;render();}};

let down=null;const raycaster=new THREE.Raycaster();
$('scene').addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
$('scene').addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>5||e.button!==0)return;const rect=$('scene').getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hits=raycaster.intersectObjects(objects.map(o=>o.group),true);if(hits.length){let node=hits[0].object;while(node&&node.parent!==scene)node=node.parent;const obj=objects.find(o=>o.group===node);if(obj)selectObject(obj);}});
$('scene').addEventListener('keydown',e=>{const map={ArrowLeft:['azimuth',-5],ArrowRight:['azimuth',5],ArrowUp:['elevation',5],ArrowDown:['elevation',-5],'+':['distance',-.2],'-':['distance',.2]};if(map[e.key]){e.preventDefault();const [id,delta]=map[e.key];$(id).value=Number($(id).value)+delta;cameraFromInputs();}});
const productDraft={front:null,back:null},productFiles={front:null,back:null},productTokens={front:0,back:0};
let productReading=0;
function draftStatus(){const ready=productDraft.front&&productDraft.back&&!productReading;$('create-product').disabled=!ready;$('create-product').textContent=productReading?'사진 처리 중…':ready?'3D 제품 추가':'앞·뒤 사진을 넣어주세요';}
async function loadProductSide(side,file){
  if(!file)return;productFiles[side]=file;const token=++productTokens[side];productReading++;productDraft[side]=null;draftStatus();$('product-create-status').textContent='사진의 배경과 윤곽을 정리하고 있어요.';
  try{const photo=await readProductPhoto(file,$('product-cutout').checked);if(token!==productTokens[side])return;productDraft[side]=photo;$(side+'-preview').src=photo.thumbnail;$(side+'-preview').hidden=false;$(side+'-status').textContent=photo.name;$('product-create-status').textContent='앞·뒤 사진을 제품의 각 면에 적용합니다.';}
  catch(e){if(token!==productTokens[side])return;$(side+'-preview').hidden=true;$(side+'-status').textContent='다시 선택';$('product-create-status').textContent=e.message;toast(e.message);}
  finally{productReading--;draftStatus();$('product-'+side).value='';}
}
for(const side of ['front','back'])$('product-'+side).onchange=e=>loadProductSide(side,e.target.files[0]);
document.querySelectorAll('.product-upload').forEach(label=>label.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();label.querySelector('input').click();}});
$('product-cutout').onchange=()=>{for(const side of ['front','back'])if(productFiles[side])loadProductSide(side,productFiles[side]);};
$('create-product').onclick=()=>{
  if(!productDraft.front||!productDraft.back||productReading)return;if(objects.length>=20){toast('한 장면에 오브젝트는 최대 20개까지 추가할 수 있어요.');return;}
  const front=productDraft.front,back=productDraft.back,height=.24,width=THREE.MathUtils.clamp(height*front.canvas.width/front.canvas.height,.03,.8);
  const owner=selected?.type==='person'?selected:objects.find(o=>o.type==='person');
  const obj={id:++serial,type:'product',name:`제품 ${String(serial).padStart(2,'0')}`,group:new THREE.Group(),color:front.color,front,back,scale:1,turn:0,tilt:0,ownerId:null,offset:{x:0,y:0,z:0},product:{shape:$('new-product-shape').value,width,height,depth:Math.min(width,.08)}};
  rebuildProduct(obj);scene.add(obj.group);objects.push(obj);obj.group.position.set(.55,0,.3);
  if(owner)attachProduct(obj,owner,'palm');selectObject(obj);toast(owner?'앞·뒤 사진을 적용한 제품을 손바닥에 올렸어요.':'앞·뒤 사진을 적용한 3D 제품을 추가했어요.');
};
function syncProductPanel(obj){
  $('product-shape').value=obj.product.shape;
  for(const key of ['width','height','depth'])$('product-'+key).value=(obj.product[key]*100).toFixed(1);
  $('product-owner').replaceChildren(new Option('바닥에 독립 배치',''));
  objects.filter(o=>o.type==='person').forEach(o=>$('product-owner').add(new Option(o.name,String(o.id))));$('product-owner').value=obj.ownerId?String(obj.ownerId):'';
  const owner=objects.find(o=>o.id===obj.ownerId);$('product-hold').value=owner?.pose||'palm';$('product-hold').disabled=!owner;
  for(const axis of ['x','y','z']){$('offset-'+axis).value=Math.round(obj.offset[axis]*100);$('offset-'+axis).disabled=!owner;}
  $('product-tilt').value=obj.tilt;$('product-tilt-value').textContent=`${obj.tilt}°`;
}
function attachProduct(obj,owner,pose){
  for(const other of objects.filter(o=>o.type==='product'&&o.ownerId===owner.id&&o!==obj))detachProduct(other);
  obj.ownerId=owner.id;obj.offset={x:0,y:0,z:0};owner.pose=pose;makePerson(owner);updateAttachments();
}
function refreshOwnerHands(obj){const owner=objects.find(o=>o.id===obj.ownerId);if(owner)makePerson(owner);}
function detachProduct(obj){obj.ownerId=null;obj.group.position.y=0;obj.group.rotation.set(radians(obj.tilt),radians(obj.turn),0);obj.group.scale.setScalar(obj.scale);obj.offset={x:0,y:0,z:0};}
function updateAttachments(){
  for(const obj of objects){if(obj.type!=='product')continue;
    const owner=objects.find(o=>o.id===obj.ownerId&&o.type==='person');
    obj.group.rotation.set(radians(obj.tilt),radians(obj.turn)+(owner?.group.rotation.y||0),0);obj.group.scale.setScalar(obj.scale*(owner?.scale||1));
    if(owner){
      let anchor=owner.pose==='grip'?new THREE.Vector3(.25,1.24,.425):owner.pose==='present'?new THREE.Vector3(0,1.128,.445):new THREE.Vector3(.34,1.148,.445);
      anchor.add(new THREE.Vector3(obj.offset.x,obj.offset.y,obj.offset.z));owner.group.updateMatrixWorld(true);owner.group.localToWorld(anchor);
      if(owner.pose==='grip')anchor.sub(new THREE.Vector3(0,obj.product.height*obj.scale*owner.scale/2,0).applyEuler(obj.group.rotation));obj.group.position.copy(anchor);
    }
  }
  if(selected){selection.position.x=selected.group.position.x;selection.position.z=selected.group.position.z;}
}
$('product-owner').onchange=()=>{if(selected?.type!=='product')return;const owner=objects.find(o=>o.id===Number($('product-owner').value));if(owner)attachProduct(selected,owner,'palm');else detachProduct(selected);selectObject(selected);};
$('product-hold').onchange=()=>{if(selected?.type!=='product')return;const owner=objects.find(o=>o.id===selected.ownerId);if(owner){owner.pose=$('product-hold').value;makePerson(owner);render();}};
$('product-shape').onchange=()=>{if(selected?.type==='product'){selected.product.shape=$('product-shape').value;rebuildProduct(selected);render();}};
for(const key of ['width','height','depth'])$('product-'+key).onchange=()=>{if(selected?.type!=='product')return;const el=$('product-'+key),value=Number(el.value);if(!Number.isFinite(value)||value<1||value>Number(el.max)){el.value=(selected.product[key]*100).toFixed(1);toast('제품 치수는 표시된 범위 안에서 입력해주세요.');return;}selected.product[key]=value/100;rebuildProduct(selected);refreshOwnerHands(selected);render();};
for(const axis of ['x','y','z'])$('offset-'+axis).oninput=()=>{if(selected?.type!=='product'||!selected.ownerId)return;const value=Number($('offset-'+axis).value);if(Number.isFinite(value)){selected.offset[axis]=THREE.MathUtils.clamp(value,-50,50)/100;render();}};
$('product-tilt').oninput=()=>{if(selected?.type==='product'){selected.tilt=Number($('product-tilt').value);$('product-tilt-value').textContent=`${selected.tilt}°`;render();}};
document.querySelectorAll('[data-product-view]').forEach(button=>button.onclick=()=>{
  if(selected?.type!=='product')return;updateAttachments();selected.group.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(selected.group),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const view=button.dataset.productView,direction=new THREE.Vector3(view==='side'?1:0,0,view==='front'?1:view==='back'?-1:0).applyEuler(selected.group.rotation);controls.target.copy(center);$('lens').value=85;camera.setFocalLength(85);camera.position.copy(center).addScaledVector(direction,Math.max(1.05,Math.max(size.x,size.y,size.z)*4.7));controls.update();clearPreset();syncCamera();render();
});
$('frame-person').onclick=()=>{if(selected?.type!=='product')return;const owner=objects.find(o=>o.id===selected.ownerId);preset('front');if(owner){const move=owner.group.position.clone();controls.target.add(move);camera.position.add(move);controls.update();render();}};

let toastTimer;
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
async function exportImage(){
  if(busy)return;busy=true;$('export').disabled=$('export-bottom').disabled=true;
  const previousSize=renderer.getSize(new THREE.Vector2()),pixelRatio=renderer.getPixelRatio(),gv=grid.visible,sv=selection.visible;
  try{
    const longest=Number($('resolution').value),w=Math.round(aspect>=1?longest:longest*aspect),h=Math.round(aspect>=1?longest/aspect:longest);
    grid.visible=selection.visible=false;renderer.setPixelRatio(1);renderer.setSize(w,h,false);render();
    const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG 생성 실패');
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`FRAME-${new Date().toISOString().replace(/[:.]/g,'-')}-${w}x${h}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);toast(`${w} × ${h} PNG 이미지를 저장했어요.`);
  }catch{toast('이미지 저장에 실패했어요. 해상도를 낮추고 다시 시도해주세요.');}
  finally{grid.visible=gv;selection.visible=sv;renderer.setPixelRatio(pixelRatio);renderer.setSize(previousSize.x,previousSize.y,false);render();busy=false;$('export').disabled=$('export-bottom').disabled=false;}
}
$('export').onclick=exportImage;$('export-bottom').onclick=exportImage;
addObject('person');preset('front');fit();

// Optional browser-native tools share the same camera controls as the UI.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({name:'set_previsualization_camera',title:'프리비즈 카메라 설정',description:'장면 카메라의 좌우 및 상하 각도, 거리, 초점거리를 설정합니다.',inputSchema:{type:'object',properties:{azimuth:{type:'number',minimum:-180,maximum:180},elevation:{type:'number',minimum:-20,maximum:89},distance:{type:'number',minimum:1,maximum:18},lens:{type:'number',minimum:18,maximum:120}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('설정 객체가 필요합니다.');const bounds={azimuth:[-180,180],elevation:[-20,89],distance:[1,18],lens:[18,120]};for(const [key,value]of Object.entries(input)){if(!bounds[key]||!Number.isFinite(value)||value<bounds[key][0]||value>bounds[key][1])throw new Error('허용 범위를 벗어난 카메라 설정입니다.');}for(const[key,value]of Object.entries(input))$(key).value=value;cameraFromInputs();return Object.fromEntries(Object.keys(bounds).map(key=>[key,Number($(key).value)]));}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
