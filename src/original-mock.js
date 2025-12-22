import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, CheckCircle, Heart, Users, Calendar, Settings, Eye, DollarSign, Shield, ArrowRight, ArrowLeft, Music, Utensils, Gift, Package, Map, User, Flame, Info, Truck, Crown, Sparkles, Sun } from 'lucide-react';

// --- Fallback Component ---
const FallbackViewer = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-8 text-center">
    <p>3Dプレビューを生成できませんでした。</p>
  </div>
);

// --- High Fidelity ThreeJS Viewer (Cinematic Upgrade) ---
const ThreeJSViewer = ({ theme, flowerColor, coffinType, flowerVolume, viewMode, setViewMode, planType }) => {
  const mountRef = useRef(null);
  const [isThreeLoaded, setIsThreeLoaded] = useState(false);
  const rendererRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (window.THREE) { setIsThreeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => setIsThreeLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isThreeLoaded || !mountRef.current) return;
    const THREE = window.THREE;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // --- 1. HIGH-RES TEXTURE GENERATION ---
    const createProceduralTexture = (type, colorHex) => {
        const size = 1024; // High res
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const col = new THREE.Color(colorHex);
        
        // Base Fill
        ctx.fillStyle = `rgb(${col.r*255},${col.g*255},${col.b*255})`;
        ctx.fillRect(0,0,size,size);
        
        // Noise Overlay
        const imageData = ctx.getImageData(0,0,size,size);
        const data = imageData.data;
        for(let i=0; i<data.length; i+=4) {
            const noise = (Math.random()-0.5) * 10;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);

        if (type === 'marble') {
             // Veins
             ctx.globalAlpha = 0.08;
             ctx.strokeStyle = '#ffffff';
             ctx.lineWidth = 3;
             ctx.filter = 'blur(4px)';
             for(let i=0; i<15; i++) {
                 ctx.beginPath();
                 ctx.moveTo(Math.random()*size, Math.random()*size);
                 ctx.bezierCurveTo(Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size, Math.random()*size);
                 ctx.stroke();
             }
             ctx.filter = 'none';
        } else if (type === 'wood') {
            // Grain
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#000000';
            for(let i=0; i<size; i+=2) {
                if(Math.random()>0.5) ctx.fillRect(0, i, size, 1);
            }
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        if (type === 'wood') tex.repeat.set(2,1);
        return tex;
    };

    // --- 2. SCENE & RENDERER SETUP (Cinematic) ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    // Exponential fog for smoother fade
    scene.fog = new THREE.FogExp2(0x050505, 0.02);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100); // 40mm lens for cinematic look

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High DPI
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Filmic color grading
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    if (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 3. CINEMATIC LIGHTING ---
    // Soft Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.2); 
    scene.add(ambient);

    // Main Spot with Volumetric Feel
    const spot = new THREE.SpotLight(0xfff0dd, 2.5);
    spot.position.set(5, 15, 10);
    spot.angle = Math.PI / 6;
    spot.penumbra = 0.5;
    spot.decay = 2;
    spot.distance = 60;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 2048; // Crisp shadows
    spot.shadow.mapSize.height = 2048;
    spot.shadow.bias = -0.0001;
    scene.add(spot);

    // Rim Light (Blue-ish) for separation
    const rim = new THREE.SpotLight(0xaaddff, 1.0);
    rim.position.set(-5, 5, -10);
    rim.lookAt(0, 2, 0);
    scene.add(rim);

    // Fake Volumetric "God Rays" (Transparent Cones)
    const rayGeo = new THREE.ConeGeometry(4, 15, 32, 1, true);
    const rayMat = new THREE.MeshBasicMaterial({
        color: 0xfff0dd,
        transparent: true,
        opacity: 0.03,
        side: THREE.FrontSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(5, 15, 10);
    ray.lookAt(0, 0, 0);
    ray.rotateX(Math.PI/2);
    scene.add(ray);

    // --- 4. ENVIRONMENT & MATERIALS ---
    // High Gloss Floor (Fake Reflection using Roughness)
    const floorMat = new THREE.MeshStandardMaterial({ 
        map: createProceduralTexture('marble', 0x1a1a1a),
        roughness: 0.05, // Mirror-like
        metalness: 0.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Carpet Runner (Red Carpet)
    const carpetGeo = new THREE.PlaneGeometry(2, 40);
    const carpetMat = new THREE.MeshStandardMaterial({ 
        color: 0x880000, 
        roughness: 0.9,
        map: createProceduralTexture('noise', 0x880000)
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.01; // Just above floor
    carpet.receiveShadow = true;
    scene.add(carpet);

    // --- 5. ALTAR & DECOR ---
    const altarGroup = new THREE.Group();
    
    // Altar Base (Wood or Cloth)
    const baseMat = new THREE.MeshStandardMaterial({
        map: createProceduralTexture('wood', theme === 'traditional' ? 0xdcb47e : 0xffffff),
        roughness: 0.6
    });

    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 4), baseMat);
    tier1.position.set(0, 0.4, -2);
    tier1.castShadow = true; tier1.receiveShadow = true;
    altarGroup.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 2.5), baseMat);
    tier2.position.set(0, 1.1, -2.5);
    tier2.castShadow = true; tier2.receiveShadow = true;
    altarGroup.add(tier2);

    // --- 6. FLOWERS (Optimized for Volume & Lighting) ---
    // Using a more complex shape for individual flowers to catch light better
    const flGeo = new THREE.DodecahedronGeometry(0.12, 0); 
    flGeo.scale(1, 0.5, 1); // Flatten
    // Use MeshPhysicalMaterial for better light interaction (translucency feel)
    const flMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff,
        roughness: 0.5,
        clearcoat: 0.1,
        clearcoatRoughness: 0.2
    });

    const flCount = flowerVolume === 'minimal' ? 3000 : (flowerVolume === 'lavish' ? 9000 : 5000);
    const flowerMesh = new THREE.InstancedMesh(flGeo, flMat, flCount);
    flowerMesh.castShadow = true; 
    flowerMesh.receiveShadow = true;

    const _dummy = new THREE.Object3D();
    const _color = new THREE.Color();
    const mainCol = new THREE.Color(flowerColor === 'pink' ? 0xffb7c5 : flowerColor === 'purple' ? 0xe6e6fa : 0xffffdd);
    const accentCol = new THREE.Color(flowerColor === 'pink' ? 0xff69b4 : flowerColor === 'purple' ? 0x9370db : 0xffffaa);
    const whiteCol = new THREE.Color(0xffffff);
    const greenCol = new THREE.Color(0x2e8b57);

    for(let i=0; i<flCount; i++) {
        let x, y, z;
        
        if (theme === 'traditional') {
            // "Fuji" Mountain Shape
            const u = i / flCount;
            const layer = Math.floor(u * 20); // depth layers
            const spread = (u * 20) % 1;
            
            x = (spread - 0.5) * 14;
            // Parabola
            const h = Math.max(0, 2.8 - (x*x)*0.08); 
            z = -1.0 - (layer * 0.15);
            y = h * (1 - layer*0.03) + 0.5 + Math.random()*0.3;
            
            // Bands of color
            const band = Math.abs(x) > 2 && Math.abs(x) < 3.5;
            _color.copy(band ? mainCol : whiteCol);

        } else if (theme === 'modern') {
            // "Flowing River"
            x = (Math.random() - 0.5) * 16;
            const curve = Math.sin(x * 0.4);
            z = curve * 1.5 - 2.0 + (Math.random()*0.5);
            y = (Math.cos(x*0.3)+1) * 1.0 + 0.5 + Math.random()*0.5;
            if(x > 3) y *= 0.7; // Asymmetry
            
            // Gradient
            const mix = (x + 8) / 16;
            _color.copy(whiteCol).lerp(mainCol, mix);
            if(Math.random()>0.8) _color.lerp(accentCol, 0.5);

        } else {
            // Nature
            const r = Math.random() * 7;
            const th = Math.random() * Math.PI * 2;
            x = r * Math.cos(th);
            z = r * Math.sin(th) * 0.5 - 2;
            y = 0.5 + Math.random()*0.5 + (Math.random() < 0.1 ? 1.0 : 0); // Spikes
            _color.copy(Math.random() > 0.6 ? greenCol : mainCol);
        }

        _dummy.position.set(x, y, z);
        _dummy.rotation.set(Math.random(), Math.random(), Math.random());
        const s = 0.6 + Math.random()*0.8;
        _dummy.scale.set(s,s,s);
        _dummy.updateMatrix();
        flowerMesh.setMatrixAt(i, _dummy.matrix);
        flowerMesh.setColorAt(i, _color);
    }
    flowerMesh.instanceMatrix.needsUpdate = true;
    flowerMesh.instanceColor.needsUpdate = true;
    altarGroup.add(flowerMesh);

    // --- 7. PARTICLES (Dust Motes for Atmosphere) ---
    const pGeo = new THREE.BufferGeometry();
    const pCount = 500;
    const pPos = new Float32Array(pCount * 3);
    for(let i=0; i<pCount*3; i++) pPos[i] = (Math.random()-0.5) * 20;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // --- 8. FURNITURE & PROPS ---
    // Coffin
    const coffinMat = new THREE.MeshStandardMaterial({ 
        color: coffinType === 'cloth' ? 0xffffff : 0x5d4037,
        roughness: 0.4,
        metalness: 0.2
    });
    const coffin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 6.5), coffinMat);
    coffin.position.set(0, 0.7, -0.5);
    altarGroup.add(coffin);

    // Photo
    const photoGroup = new THREE.Group();
    photoGroup.position.set(0, 3.8, -2.5);
    photoGroup.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.1), new THREE.MeshStandardMaterial({color: 0x111111})));
    // Glowing photo
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({color: 0xeeeeee}));
    pic.position.z = 0.06;
    photoGroup.add(pic);
    altarGroup.add(photoGroup);

    scene.add(altarGroup);

    // Chairs
    const chairGeo = new THREE.BoxGeometry(0.6, 0.5, 0.6);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const rows = planType === 'family' ? 2 : 5;
    const cols = planType === 'family' ? 4 : 8;
    for(let r=0; r<rows; r++) {
        for(let c=-cols/2; c<cols/2; c++) {
            if(c===-0.5 || c===0) continue;
            const cm = new THREE.Mesh(chairGeo, chairMat);
            cm.position.set((c+0.5)*1.4, 0.25, 4 + r*1.5);
            cm.castShadow = true;
            scene.add(cm);
        }
    }

    // --- ANIMATION ---
    let time = 0;
    let angle = 0;
    let camH = 0, camV = 0;
    let isDrag = false;
    let lastPos = {x:0, y:0};

    const animate = () => {
        requestRef.current = requestAnimationFrame(animate);
        time += 0.005;

        // Gentle particle movement
        particles.rotation.y = time * 0.5;

        if (viewMode === 'orbit') {
            const rad = 14;
            camera.position.x = Math.sin(angle) * rad;
            camera.position.z = Math.cos(angle) * rad + 3;
            camera.position.y = 6;
            camera.lookAt(0, 1.5, 0);
        } else {
            camera.position.set(0, 1.1, 6.0); 
            const tx = Math.sin(camH) * 5;
            const ty = 2 + Math.sin(camV) * 3;
            const tz = -5;
            camera.lookAt(tx, ty, tz);
        }

        renderer.render(scene, camera);
    };
    animate();

    const onDown = e => { isDrag=true; lastPos={x:e.clientX, y:e.clientY}; };
    const onMove = e => {
        if(!isDrag) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        if(viewMode==='orbit') angle -= dx*0.005;
        else {
            camH -= dx*0.003; 
            camV += dy*0.003;
            camH = Math.max(-1, Math.min(1, camH));
            camV = Math.max(-0.5, Math.min(0.5, camV));
        }
        lastPos={x:e.clientX, y:e.clientY};
    };
    const onUp = () => isDrag=false;

    const cvs = renderer.domElement;
    cvs.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
        if(requestRef.current) cancelAnimationFrame(requestRef.current);
        cvs.removeEventListener('mousedown', onDown);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        renderer.dispose();
    };

  }, [theme, flowerColor, coffinType, flowerVolume, viewMode, isThreeLoaded, planType]);

  if (!isThreeLoaded) return <div className="bg-black w-full h-full flex items-center justify-center text-white font-medium">Loading Cinematic Engine...</div>;

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl group border border-gray-800">
      <div ref={mountRef} className="w-full h-full cursor-move" />
      
      {/* Cinematic UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs border border-white/20 flex items-center gap-2 shadow-xl">
         <Sun size={12} className="text-yellow-400 animate-pulse"/>
         {viewMode === 'orbit' ? '全体ビュー' : '参列者ビュー'}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
         <button onClick={() => setViewMode('orbit')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'orbit' ? 'bg-teal-600 text-white shadow-lg border border-teal-500' : 'bg-gray-900/80 text-gray-400 border border-white/10'}`}>
            <Map size={14}/> 全体
         </button>
         <button onClick={() => setViewMode('firstPerson')} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'firstPerson' ? 'bg-teal-600 text-white shadow-lg border border-teal-500' : 'bg-gray-900/80 text-gray-400 border border-white/10'}`}>
            <User size={14}/> 参列席
         </button>
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', religion: 'buddhism', attendees: 50 });
  const [planType, setPlanType] = useState('general');
  const [ritualOptions, setRitualOptions] = useState({ monk: 1, kaimyo: 'shinji', makeup: false, hearse: 'van' });
  const [customization, setCustomization] = useState({ theme: 'modern', flowerColor: 'pink', coffinType: 'cloth', flowerVolume: 'standard', catering: 'standard', returnGift: 'standard' });
  const [viewMode, setViewMode] = useState('orbit');
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeTab, setActiveTab] = useState('venue');

  const prices = {
      base: { general: 800000, family: 450000, oneday: 350000 },
      theme: { traditional: 0, modern: 150000, nature: 200000 },
      coffin: { standard: 0, cloth: 80000, luxury: 350000 },
      flowerVolume: { minimal: -50000, standard: 0, lavish: 300000 },
      monk: { 1: 150000, 2: 250000, 3: 400000 },
      kaimyo: { none: 0, shinji: 300000, koji: 500000, in: 1000000 },
      makeup: 100000,
      hearse: { van: 30000, western: 80000, japanese: 150000 },
      catering: { none: 0, simple: 3000, standard: 6000, premium: 12000 },
      returnGift: { none: 0, simple: 1000, standard: 3000, premium: 5000 },
  };

  const calculateTotal = () => {
    let total = prices.base[planType] + prices.theme[customization.theme] + prices.coffin[customization.coffinType] + prices.flowerVolume[customization.flowerVolume];
    total += prices.monk[ritualOptions.monk] + prices.kaimyo[ritualOptions.kaimyo] + prices.hearse[ritualOptions.hearse];
    if (ritualOptions.makeup) total += prices.makeup;
    total += (prices.catering[customization.catering] + prices.returnGift[customization.returnGift]) * formData.attendees;
    return total;
  };
  
  const totalCost = calculateTotal();
  const insuranceCoverage = 2000000;
  const outOfPocket = Math.max(0, totalCost - insuranceCoverage);
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg text-white"><Heart size={20} fill="currentColor" /></div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Last Wish</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
             {[1, 2, 3].map(i => (
                 <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-teal-600' : ''}`}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">{i}</span>
                    {i===1?'基本情報':i===2?'詳細プランニング':'確認・決済'}
                 </div>
             ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {step === 1 && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">葬儀形式と基本情報</h2>
            <div className="mb-8">
               <label className="block text-sm font-bold text-gray-700 mb-4">ご希望の葬儀形式</label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                      {id: 'general', title: '一般葬', desc: '知人・近所・会社関係も参列する一般的なお葬式。', icon: Users},
                      {id: 'family', title: '家族葬', desc: '家族・親族のみでゆっくりとお見送りする小規模な形式。', icon: User},
                      {id: 'oneday', title: '一日葬', desc: '通夜を行わず、告別式のみを1日で行う負担の少ない形式。', icon: Calendar},
                  ].map(p => (
                      <button key={p.id} onClick={() => setPlanType(p.id)} className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${planType === p.id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200' : 'border-gray-200 hover:border-gray-300'}`}>
                         <p.icon className={`mb-3 ${planType === p.id ? 'text-teal-600' : 'text-gray-400'}`} size={24} />
                         <div className="font-bold text-gray-900">{p.title}</div>
                         <div className="text-xs text-gray-500 mt-2 leading-relaxed">{p.desc}</div>
                      </button>
                  ))}
               </div>
            </div>
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">お名前</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="山田 太郎" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">宗教・宗派</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})}>
                    <option value="buddhism">仏教</option><option value="shinto">神道</option><option value="christianity">キリスト教</option><option value="none">無宗教</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">参列者数</label>
                  <div className="relative"><Users className="absolute left-3 top-3.5 text-gray-400" size={18}/><input type="number" className="w-full p-3 pl-10 border border-gray-300 rounded-lg" value={formData.attendees} onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 0})} /></div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2">次へ：詳細プランニング <ArrowRight size={18}/></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh] animate-fade-in">
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                 {[{id: 'venue', label: '会場・祭壇'}, {id: 'ritual', label: '儀式・お布施'}, {id: 'items', label: '物品・車両'}, {id: 'hospitality', label: 'おもてなし'}].map(t => (
                     <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-3 text-xs font-bold px-2 whitespace-nowrap ${activeTab === t.id ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
                 ))}
              </div>
              <div className="overflow-y-auto flex-1 p-6 pb-20">
                {activeTab === 'venue' && (
                    <div className="space-y-6">
                         <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">祭壇テーマ</label>
                            <div className="grid grid-cols-1 gap-2">
                                {['traditional', 'modern', 'nature'].map(t => (
                                    <button key={t} onClick={() => setCustomization({...customization, theme: t})} className={`p-3 text-left border rounded-lg text-sm flex justify-between ${customization.theme === t ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'}`}>
                                        <span>{t === 'traditional' ? '伝統・厳粛' : t === 'modern' ? 'モダン・洋風' : 'ナチュラル'}</span><span className="text-xs text-gray-500">+{prices.theme[t].toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">花祭壇ボリューム</label>
                            <div className="flex gap-2">
                                {['minimal', 'standard', 'lavish'].map(v => (
                                    <button key={v} onClick={() => setCustomization({...customization, flowerVolume: v})} className={`flex-1 py-2 text-xs border rounded transition-all ${customization.flowerVolume === v ? 'bg-teal-600 text-white border-teal-600' : 'hover:bg-gray-50'}`}>{v === 'minimal' ? '控えめ' : v === 'standard' ? '標準' : '豪華'}</button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">メインカラー</label>
                            <div className="flex gap-3">
                                {['white', 'pink', 'purple', 'yellow'].map(c => (
                                <button key={c} onClick={() => setCustomization({...customization, flowerColor: c})} className={`w-8 h-8 rounded-full border shadow-sm ${customization.flowerColor === c ? 'ring-2 ring-teal-500 scale-110' : ''}`} style={{backgroundColor: c === 'white' ? '#fff' : c === 'pink' ? '#fce7f3' : c === 'purple' ? '#f3e8ff' : '#fef9c3'}} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'ritual' && (
                    <div className="space-y-8">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-xs text-amber-800 flex gap-2"><Info size={16} className="shrink-0"/><span>お布施や戒名料は地域や寺院により異なりますが、ここでは一般的な目安で算出します。</span></div>
                        <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">僧侶の人数</label>
                            <select className="w-full p-2 border rounded-md text-sm" value={ritualOptions.monk} onChange={(e) => setRitualOptions({...ritualOptions, monk: parseInt(e.target.value)})}>
                                <option value={1}>1名 (基本)</option><option value={2}>2名 (手厚く)</option><option value={3}>3名 (導師+脇僧)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">戒名ランク</label>
                            <div className="space-y-2">
                                {[{id: 'none', label: '俗名', price: 0}, {id: 'shinji', label: '信士・信女', price: 300000}, {id: 'koji', label: '居士・大姉', price: 500000}, {id: 'in', label: '院号', price: 1000000}].map(k => (
                                    <button key={k.id} onClick={() => setRitualOptions({...ritualOptions, kaimyo: k.id})} className={`w-full p-3 text-left border rounded-lg text-sm flex justify-between ${ritualOptions.kaimyo === k.id ? 'border-amber-500 bg-amber-50' : 'hover:bg-gray-50'}`}>
                                        <span className="font-medium">{k.label}</span><span className="text-gray-500">+{k.price.toLocaleString()}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'items' && (
                    <div className="space-y-6">
                        <div>
                             <label className="text-sm font-bold text-gray-900 block mb-2">霊柩車</label>
                             <div className="grid grid-cols-1 gap-2">
                                 {[{id: 'van', label: 'バン型', price: 30000}, {id: 'western', label: '洋型', price: 80000}, {id: 'japanese', label: '宮型', price: 150000}].map(h => (
                                    <button key={h.id} onClick={() => setRitualOptions({...ritualOptions, hearse: h.id})} className={`p-3 text-left border rounded-lg text-sm flex justify-between items-center ${ritualOptions.hearse === h.id ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-2"><Truck size={16} className="text-gray-400"/><span>{h.label}</span></div><span className="text-xs text-gray-500">+{h.price.toLocaleString()}</span>
                                    </button>
                                 ))}
                             </div>
                        </div>
                        <div>
                             <label className="text-sm font-bold text-gray-900 block mb-2">柩（ひつぎ）</label>
                             <select className="w-full p-2 border rounded-md text-sm" value={customization.coffinType} onChange={(e) => setCustomization({...customization, coffinType: e.target.value})}>
                                 <option value="standard">木目調プリント</option><option value="cloth">布張りホワイト</option><option value="luxury">高級彫刻・漆調</option>
                             </select>
                        </div>
                        <div className="border-t pt-4">
                             <div className="flex items-center justify-between mb-2">
                                 <label className="text-sm font-bold text-gray-900">湯灌・ラストメイク</label>
                                 <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${ritualOptions.makeup ? 'bg-teal-500' : 'bg-gray-300'}`} onClick={() => setRitualOptions({...ritualOptions, makeup: !ritualOptions.makeup})}>
                                     <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${ritualOptions.makeup ? 'left-5.5' : 'left-0.5'}`}></div>
                                 </div>
                             </div>
                             <div className="text-right text-sm font-medium">+¥100,000</div>
                        </div>
                    </div>
                )}
                {activeTab === 'hospitality' && (
                     <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">参列者の人数 ({formData.attendees}名) に応じて自動計算されます。</div>
                        <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">お料理</label>
                            <select className="w-full p-2 border rounded-md text-sm" value={customization.catering} onChange={(e) => setCustomization({...customization, catering: e.target.value})}>
                                <option value="none">なし</option><option value="simple">軽食 (¥3,000)</option><option value="standard">並 (¥6,000)</option><option value="premium">上 (¥12,000)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-900 block mb-2">返礼品</label>
                            <select className="w-full p-2 border rounded-md text-sm" value={customization.returnGift} onChange={(e) => setCustomization({...customization, returnGift: e.target.value})}>
                                <option value="none">なし</option><option value="simple">¥1,000</option><option value="standard">¥3,000</option><option value="premium">¥5,000</option>
                            </select>
                        </div>
                     </div>
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl -mx-2 mt-2 border-t shrink-0">
                   <div className="flex justify-between items-end mb-2"><span className="text-sm text-gray-600 font-medium">概算お見積り</span><span className="text-2xl font-bold text-teal-700">¥{totalCost.toLocaleString()}</span></div>
                   <div className="flex gap-2 mt-3">
                        <button onClick={handleBack} className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 font-medium">戻る</button>
                        <button onClick={handleNext} className="flex-1 py-3 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-md">プラン確認へ進む</button>
                   </div>
              </div>
            </div>
            <div className="lg:col-span-8 bg-black rounded-2xl overflow-hidden shadow-2xl relative ring-1 ring-gray-900/5 h-full">
               <ThreeJSViewer planType={planType} theme={customization.theme} flowerColor={customization.flowerColor} coffinType={customization.coffinType} flowerVolume={customization.flowerVolume} viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-5xl mx-auto animate-fade-in">
             <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
                <div className="flex-[2] p-8 border-r border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><CheckCircle className="text-teal-600"/> 最終プラン明細</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">1. 基本・会場費</h4>
                                <div className="flex justify-between py-1"><span className="text-gray-500">葬儀形式</span> <span className="font-medium">{planType === 'family' ? '家族葬' : '一般葬'}</span></div>
                                <div className="flex justify-between py-1"><span className="text-gray-500">基本プラン</span> <span>¥{prices.base[planType].toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-gray-500">祭壇デザイン費</span> <span>¥{prices.theme[customization.theme].toLocaleString()}</span></div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">2. 物品・サービス</h4>
                                <div className="flex justify-between py-1"><span className="text-gray-500">柩</span> <span>¥{prices.coffin[customization.coffinType].toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-gray-500">花祭壇追加</span> <span>¥{prices.flowerVolume[customization.flowerVolume].toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-gray-500">霊柩車</span> <span>¥{prices.hearse[ritualOptions.hearse].toLocaleString()}</span></div>
                                {ritualOptions.makeup && <div className="flex justify-between py-1"><span className="text-gray-500">湯灌・メイク</span> <span>¥{prices.makeup.toLocaleString()}</span></div>}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                <h4 className="font-bold text-amber-900 mb-3 border-b border-amber-200 pb-2">3. 儀式費用 (目安)</h4>
                                <div className="flex justify-between py-1"><span className="text-amber-800/70">僧侶お布施</span> <span>¥{prices.monk[ritualOptions.monk].toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-amber-800/70">戒名料</span> <span>¥{prices.kaimyo[ritualOptions.kaimyo].toLocaleString()}</span></div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">4. 変動費 ({formData.attendees}名)</h4>
                                <div className="flex justify-between py-1"><span className="text-blue-800/70">お料理代</span> <span>¥{(prices.catering[customization.catering] * formData.attendees).toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-blue-800/70">返礼品代</span> <span>¥{(prices.returnGift[customization.returnGift] * formData.attendees).toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-80 bg-slate-50 p-8 flex flex-col border-t lg:border-t-0">
                     <h3 className="font-bold text-xl text-gray-800 mb-6">お支払い</h3>
                     <div className="space-y-4 mb-8 flex-1">
                        <div className="flex justify-between text-gray-600 font-medium"><span>見積総額</span><span>¥{totalCost.toLocaleString()}</span></div>
                        <div className="bg-white p-3 rounded border border-gray-200">
                            <div className="flex justify-between text-teal-600 font-bold mb-1"><span className="flex items-center gap-1"><Shield size={14}/> 保険適用</span><span>-¥{Math.min(totalCost, insuranceCoverage).toLocaleString()}</span></div>
                            <div className="text-[10px] text-gray-400">※ご契約の生命保険(上限200万)から直接支払われます</div>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div><span className="block text-sm text-gray-500 mb-1">自己負担額 (本日決済)</span><span className="block text-3xl font-bold text-gray-900">¥{outOfPocket.toLocaleString()}</span></div>
                     </div>
                     <button onClick={() => setShowPayModal(true)} className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"><CreditCard size={20}/> 生前予約を確定する</button>
                     <button onClick={handleBack} className="w-full mt-3 text-gray-400 hover:text-gray-600 text-sm">内容を修正する</button>
                </div>
             </div>
          </div>
        )}
        
        {showPayModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles className="text-green-600" size={40}/></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">ご予約ありがとうございます</h3>
                <p className="text-gray-600 mb-8 text-sm">あなたの「最期の想い」を大切にお預かりします。</p>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800">トップに戻る</button>
             </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}