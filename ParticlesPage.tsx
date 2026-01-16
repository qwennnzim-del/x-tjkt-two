
import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MousePointer2, Move, Camera, Video, VideoOff, Activity, ScanFace } from 'lucide-react';

const ParticlesPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const motionCanvasRef = useRef<HTMLCanvasElement>(null); // Canvas tersembunyi untuk analisis video
  
  const [hintVisible, setHintVisible] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [motionIntensity, setMotionIntensity] = useState(0);

  // Posisi interaksi (bisa dari mouse ATAU kamera)
  const interactionPos = useRef({ x: -1000, y: -1000 });
  const prevFrameData = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let hue = 0;

    // --- 1. SETUP CANVAS & PARTICLES ---
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      color: string;
      velocity: { x: number; y: number };

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 3 + 1;
        this.density = (Math.random() * 30) + 1;
        this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`; // Cyan-Blue range
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
      }

      update() {
        // Gunakan posisi interaksi global (Mouse atau Kamera)
        const targetX = interactionPos.current.x;
        const targetY = interactionPos.current.y;
        const radius = cameraActive ? 250 : 150; // Radius lebih besar untuk kamera

        if (targetX !== -1000) {
            let dx = targetX - this.x;
            let dy = targetY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            
            const maxDistance = radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < radius) {
                this.x -= directionX * 3;
                this.y -= directionY * 3;
                this.x += this.velocity.y * 2;
                this.y -= this.velocity.x * 2;
                this.color = `hsl(${hue}, 100%, 60%)`;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 20;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 20;
                }
            }
        }
        
        this.x += Math.sin(Date.now() * 0.001 * this.density) * 0.5;
        this.y += Math.cos(Date.now() * 0.001 * this.density) * 0.5;
      }
    }

    const initParticles = () => {
      particles = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    // --- 2. MOTION DETECTION LOGIC ---
    const processVideoFrame = () => {
        if (!cameraActive || !videoRef.current || !motionCanvasRef.current) return;
        
        const video = videoRef.current;
        const mCanvas = motionCanvasRef.current;
        const mCtx = mCanvas.getContext('2d');
        if (!mCtx) return;

        // Skala kecil untuk performa (misal 50x50 px cukup untuk deteksi gerakan kasar)
        const scale = 20; 
        const w = mCanvas.width;
        const h = mCanvas.height;

        // Gambar frame video ke canvas kecil
        mCtx.drawImage(video, 0, 0, w, h);
        
        // Ambil data piksel
        const frameData = mCtx.getImageData(0, 0, w, h);
        const data = frameData.data;
        const prevData = prevFrameData.current;

        let motionX = 0;
        let motionY = 0;
        let motionCount = 0;
        let totalDiff = 0;

        // Bandingkan dengan frame sebelumnya
        if (prevData) {
            for (let i = 0; i < data.length; i += 4) {
                // Hitung perbedaan rata-rata RGB
                const rDiff = Math.abs(data[i] - prevData[i]);
                const gDiff = Math.abs(data[i + 1] - prevData[i + 1]);
                const bDiff = Math.abs(data[i + 2] - prevData[i + 2]);
                const diff = (rDiff + gDiff + bDiff) / 3;

                // Threshold sensitivitas gerakan
                if (diff > 20) {
                    const index = i / 4;
                    const x = index % w;
                    const y = Math.floor(index / w);

                    // Mirroring X coordinate karena webcam biasanya mirrored
                    motionX += (w - x); 
                    motionY += y;
                    motionCount++;
                    totalDiff += diff;
                }
            }
        }

        // Simpan frame saat ini untuk loop berikutnya
        // Kita harus clone array karena Uint8ClampedArray adalah reference
        prevFrameData.current = new Uint8ClampedArray(data);

        // Update posisi interaksi jika ada gerakan signifikan
        if (motionCount > 5) { // Minimal pixel bergerak
            const avgX = (motionX / motionCount) * (window.innerWidth / w);
            const avgY = (motionY / motionCount) * (window.innerHeight / h);
            
            // Smooth movement (Lerp)
            interactionPos.current.x += (avgX - interactionPos.current.x) * 0.1;
            interactionPos.current.y += (avgY - interactionPos.current.y) * 0.1;
            
            setMotionIntensity(Math.min(100, motionCount / 2));
        } else {
            setMotionIntensity(0);
            // Jika tidak ada gerakan, jangan reset posisi seketika agar smooth
            // interactionPos.current = { x: -1000, y: -1000 }; 
        }
    };


    // --- 3. ANIMATION LOOP ---
    const animate = () => {
      if (!ctx) return;
      
      // Proses video setiap frame jika kamera aktif
      if (cameraActive) {
          processVideoFrame();
      }

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw();
        particles[i].update();
      }
      
      connectParticles();
      
      // Visualisasi Cursor (Opsional: Tampilkan titik interaksi saat kamera aktif)
      if (cameraActive && interactionPos.current.x > 0) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
          ctx.arc(interactionPos.current.x, interactionPos.current.y, 30, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
          ctx.arc(interactionPos.current.x, interactionPos.current.y, 5, 0, Math.PI * 2);
          ctx.fill();
      }

      hue += 2;
      animationFrameId = requestAnimationFrame(animate);
    };

    const connectParticles = () => {
        if (!ctx) return;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < 3600) {
                    let opacityValue = 1 - (distance / 3600);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    // --- 4. EVENT LISTENERS ---
    window.addEventListener('resize', resizeCanvas);
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!cameraActive) {
            interactionPos.current.x = e.clientX;
            interactionPos.current.y = e.clientY;
            setHintVisible(false);
        }
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!cameraActive) {
            interactionPos.current.x = e.touches[0].clientX;
            interactionPos.current.y = e.touches[0].clientY;
            setHintVisible(false);
        }
    }
    
    const handleLeave = () => {
        if (!cameraActive) {
            interactionPos.current.x = -1000;
            interactionPos.current.y = -1000;
        }
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseout', handleLeave);
    window.addEventListener('touchend', handleLeave);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseout', handleLeave);
      window.removeEventListener('touchend', handleLeave);
      cancelAnimationFrame(animationFrameId);
      stopCamera(); // Cleanup camera
    };
  }, [cameraActive]); // Re-run effect if camera mode changes

  // --- CAMERA CONTROLS ---
  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                  width: { ideal: 320 }, // Low resolution is enough for motion detection
                  height: { ideal: 240 },
                  facingMode: "user"
              } 
          });
          
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
          }
          setCameraActive(true);
          setCameraError(null);
          setHintVisible(false);
      } catch (err) {
          console.error("Camera Error:", err);
          setCameraError("Gagal akses kamera. Pastikan diizinkan ya!");
      }
  };

  const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setCameraActive(false);
      interactionPos.current = { x: -1000, y: -1000 };
  };

  const toggleCamera = () => {
      if (cameraActive) stopCamera();
      else startCamera();
  };

  return (
    <section className="fixed inset-0 z-[40] bg-slate-950 overflow-hidden cursor-none">
       {/* MAIN CANVAS */}
       <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
       
       {/* HIDDEN ELEMENTS FOR PROCESSING */}
       <video ref={videoRef} className="hidden" muted playsInline />
       <canvas ref={motionCanvasRef} width="50" height="40" className="hidden" />

       {/* UI OVERLAY */}
       <div className="absolute top-32 left-0 w-full pointer-events-none z-50 flex flex-col items-center justify-center">
            <h2 className="font-artist text-6xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 font-black tracking-tighter opacity-20 mix-blend-overlay">
                ENERGY FLOW
            </h2>
       </div>

       {/* CAMERA CONTROL PANEL */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
            
            {/* Status Indicator */}
            {cameraActive && (
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md rounded-full border border-emerald-500/30 text-emerald-400 animate-in fade-in slide-in-from-bottom">
                    <ScanFace size={16} className={motionIntensity > 10 ? "animate-pulse" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        Motion Tracking: {motionIntensity > 10 ? "Detected" : "Idle"}
                    </span>
                    <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden ml-2">
                        <div className="h-full bg-emerald-500 transition-all duration-100" style={{ width: `${motionIntensity}%` }}></div>
                    </div>
                 </div>
            )}

            {cameraError && (
                <div className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl text-xs font-bold mb-2">
                    {cameraError}
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={toggleCamera}
                className={`group flex items-center gap-3 px-8 py-4 rounded-full border-2 transition-all duration-300 pointer-events-auto ${
                    cameraActive 
                    ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500 hover:text-white' 
                    : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                }`}
            >
                {cameraActive ? <VideoOff size={20} /> : <Camera size={20} />}
                <span className="text-xs font-black uppercase tracking-[0.2em]">
                    {cameraActive ? 'Matikan Kamera' : 'Aktifkan Hand Control'}
                </span>
            </button>

            {hintVisible && !cameraActive && (
               <div className="animate-pulse text-center mt-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500/80">
                        Klik tombol di atas untuk mengendalikan partikel dengan tanganmu!
                    </p>
               </div>
            )}
       </div>
       
       <div className="absolute bottom-6 right-6 pointer-events-none">
          <div className="flex items-center gap-2 opacity-30">
            <Activity size={14} className="text-white" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
                {cameraActive ? "Computer Vision Active" : "Interactive WebGL"}
            </span>
          </div>
       </div>
    </section>
  );
};

export default ParticlesPage;
