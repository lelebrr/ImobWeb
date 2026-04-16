'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Camera, 
  PenTool, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Smartphone,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/design-system/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/design-system/card';
import { Badge } from '@/components/design-system/badge';
import { cn } from '@/lib/utils';
import { finalizeSignature } from '@/app/actions/signing';
import { toast } from 'sonner';

interface SignatureWizardProps {
  party: any;
  token: string;
}

type Step = 'welcome' | 'document' | 'biometric' | 'signature' | 'success';

export default function SignatureWizard({ party, token }: SignatureWizardProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  // Setup Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  // Signature Pad Logic
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const pos = getPointerPos(e);
    lastPos.current = pos;
  };

  const draw = (e: any) => {
    if (!isDrawing || !sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const pos = getPointerPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
  };

  const getPointerPos = (e: any) => {
    if (!sigCanvasRef.current) return { x: 0, y: 0 };
    const rect = sigCanvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearSignature = () => {
    if (!sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    setSignatureImage(null);
  };

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      setSignatureImage(sigCanvasRef.current.toDataURL('image/png'));
    }
  };

  // Final Action
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('faceImage', capturedImage || '');
      formData.append('signatureImage', signatureImage || '');
      formData.append('ipAddress', '0.0.0.0'); // Ideally fetch real IP or handle server-side
      formData.append('userAgent', navigator.userAgent);

      const result = await finalizeSignature(formData);
      if (result.success) {
        setStep('success');
        toast.success('Assinatura realizada com sucesso!');
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error('Erro ao finalizar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col p-6 bg-slate-50 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary border border-primary/20 shadow-2xl">
              <ShieldCheck className="h-12 w-12 fill-current opacity-20 absolute" />
              <ShieldCheck className="h-12 w-12 relative" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tighter leading-none">
                Assinatura <span className="text-primary italic">Digital</span>
              </h1>
              <p className="text-muted-foreground font-medium text-lg leading-tight px-4">
                Olá, <span className="text-slate-900 font-bold">{party.name}</span>. Você foi convidado para assinar o contrato <span className="text-slate-900 font-bold">#{party.contract.id.slice(-6)}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-sm border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Lock className="h-5 w-5" /></div>
                  <p className="text-xs font-bold text-left text-muted-foreground uppercase leading-tight">Validade jurídica total <br/><span className="text-[10px] opacity-60">MP 2.200-2 / Lei 14.063</span></p>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-3xl bg-white shadow-sm border border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600"><Smartphone className="h-5 w-5" /></div>
                  <p className="text-xs font-bold text-left text-muted-foreground uppercase leading-tight">100% Mobile <br/><span className="text-[10px] opacity-60">Seguro e sem apps</span></p>
               </div>
            </div>

            <Button 
              className="w-full h-16 rounded-[2rem] bg-slate-900 hover:bg-black text-white text-lg font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02]"
              onClick={() => setStep('document')}
            >
              Começar Assinatura <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        )}

        {step === 'document' && (
          <motion.div 
            key="document"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex-1 flex flex-col space-y-6"
          >
             <div className="flex items-center justify-between">
                <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={() => setStep('welcome')}>
                   <ChevronLeft className="h-6 w-6" />
                </Button>
                <Badge variant="outline" className="font-black uppercase tracking-widest bg-slate-100 border-none px-4 py-1 text-[10px]">Etapa 1 de 3</Badge>
             </div>

             <div className="space-y-4">
               <h2 className="text-3xl font-black tracking-tighter leading-none">Revise o <span className="text-primary italic">Documento</span></h2>
               <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Tipo de Contrato</p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{party.contract.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {party.contract.clauses.map((clause: any) => (
                      <div key={clause.id} className="space-y-1">
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Cláusula {clause.order}: {clause.title}</h4>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{clause.content}</p>
                      </div>
                    ))}
                  </div>
               </div>
             </div>

             <Button 
               className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white text-lg font-black uppercase tracking-widest shadow-2xl mt-auto"
               onClick={() => { setStep('biometric'); startCamera(); }}
             >
               Confirmar e Continuar <ArrowRight className="ml-2 h-6 w-6" />
             </Button>
          </motion.div>
        )}

        {step === 'biometric' && (
          <motion.div 
            key="biometric"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col space-y-6"
          >
             <div className="flex items-center justify-between">
                <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={() => { setStep('document'); stopCamera(); }}>
                   <ChevronLeft className="h-6 w-6" />
                </Button>
                <Badge className="font-black uppercase tracking-widest bg-orange-500 border-none px-4 py-1 text-[10px]">Etapa 2 de 3: Identidade</Badge>
             </div>

             <div className="space-y-4">
               <h2 className="text-3xl font-black tracking-tighter leading-none">Verificação <span className="text-orange-500 italic">Biométrica</span></h2>
               
               <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-900 border-4 border-white shadow-2xl">
                  {capturedImage ? (
                    <img src={capturedImage} className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                      <div className="absolute inset-0 border-[40px] border-slate-900/40 pointer-events-none">
                         <div className="w-full h-full border-2 border-dashed border-white/60 rounded-[4rem] relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/40 font-black uppercase tracking-widest text-[10px]">Posicione seu rosto</div>
                         </div>
                      </div>
                    </>
                  )}
               </div>

               <div className="p-4 rounded-3xl bg-orange-500/5 border border-orange-500/20 text-orange-700 flex items-start gap-4">
                  <Info className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold uppercase leading-snug tracking-tight">Sua foto será anexada com segurança ao contrato como prova de identidade legal.</p>
               </div>
             </div>

             <div className="mt-auto space-y-4">
                {capturedImage ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl font-black uppercase" onClick={() => { setCapturedImage(null); startCamera(); }}>Tentar de Novo</Button>
                    <Button className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase" onClick={() => setStep('signature')}>Próximo Passo</Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full h-16 rounded-[2rem] bg-orange-600 hover:bg-orange-700 text-white text-lg font-black uppercase tracking-widest shadow-2xl"
                    onClick={captureFace}
                  >
                    Capturar Biometria <Camera className="ml-2 h-6 w-6" />
                  </Button>
                )}
             </div>
             <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {step === 'signature' && (
          <motion.div 
            key="signature"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col space-y-6"
          >
             <div className="flex items-center justify-between">
                <Button variant="ghost" className="h-10 w-10 rounded-xl p-0" onClick={() => setStep('biometric')}>
                   <ChevronLeft className="h-6 w-6" />
                </Button>
                <Badge className="font-black uppercase tracking-widest bg-emerald-500 border-none px-4 py-1 text-[10px]">Etapa 3 de 3: Finalização</Badge>
             </div>

             <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tighter leading-none">Sua <span className="text-emerald-500 italic">Assinatura</span></h2>
                <div className="relative rounded-[3rem] bg-white border-2 border-slate-200 overflow-hidden shadow-2xl">
                  <canvas 
                    ref={sigCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={() => { setIsDrawing(false); saveSignature(); }}
                    onMouseLeave={() => setIsDrawing(false)}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={() => { setIsDrawing(false); saveSignature(); }}
                    width={400}
                    height={300}
                    className="w-full touch-none cursor-crosshair h-[300px]"
                  />
                  <div className="absolute bottom-4 right-4 group">
                    <Button variant="ghost" size="sm" onClick={clearSignature} className="h-10 w-10 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      <RefreshCwIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
                    <PenTool className="h-40 w-40 text-slate-900" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase text-center text-muted-foreground opacity-60">Assine dentro do quadro branco acima</p>
             </div>

             <Button 
               className="w-full h-16 rounded-[2rem] bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-black uppercase tracking-widest shadow-2xl mt-auto disabled:opacity-50"
               disabled={!signatureImage || loading}
               onClick={handleSubmit}
             >
               {loading ? 'Processando...' : 'Finalizar Assinatura'} <CheckCircle2 className="ml-2 h-6 w-6" />
             </Button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
          >
             <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                <div className="relative h-32 w-32 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-600 border-2 border-emerald-200 shadow-2xl">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
             </div>
             
             <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tighter leading-none text-emerald-700">Documento <br/><span className="text-slate-900">Assinado!</span></h2>
                <p className="text-muted-foreground font-medium text-lg px-4 leading-tight">
                  Tudo pronto, <span className="text-slate-900 font-bold">{party.name}</span>! Sua assinatura digital foi registrada com sucesso e validada biometricamente.
                </p>
             </div>

             <div className="grid grid-cols-1 w-full gap-3">
                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Protocolo</span>
                   <span className="text-xs font-black text-slate-900">#SIG-{Math.random().toString(36).toUpperCase().slice(2, 10)}</span>
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Horário</span>
                   <span className="text-xs font-black text-slate-900">{new Date().toLocaleString('pt-BR')}</span>
                </div>
             </div>

             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight max-w-[200px]">Uma cópia deste contrato assinado será enviada para o seu e-mail.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RefreshCwIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
