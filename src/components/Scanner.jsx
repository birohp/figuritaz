import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, RefreshCw, CheckCircle, X, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../lib/stickers';

function Scanner({ user, collection, onUpdate, onDone }) {
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  // Lista plana de todos os códigos válidos para busca rápida
  const allValidCodes = CATEGORIES.flatMap(cat => cat.stickers);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      let s;
      try {
        s = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      } catch (e) {
        s = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
      setError(null);
    } catch (err) {
      setError(`Erro: ${err.message}. Certifique-se de dar permissão de câmera.`);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Câmera não está pronta.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    processImage(imageData);
  };

  const processImage = async (imageData) => {
    setScanning(true);
    setProgress(0);
    setError(null);
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const normalizedText = text.toUpperCase()
        .replace(/\|/g, 'I')
        .replace(/O/g, '0')
        .replace(/S/g, '5');
        
      const codeRegex = /\b([A-Z]{0,3})\s*(\d{1,3})\b/g;
      const detectedCodes = [];
      let match;

      while ((match = codeRegex.exec(normalizedText)) !== null) {
        const prefix = match[1] || '';
        const number = match[2];
        const code = prefix + number;
        
        if (allValidCodes.includes(code)) {
          detectedCodes.push(code);
        } else {
          const variations = [
            code.replace(/I/g, '1'),
            code.replace(/L/g, '1'),
            code.replace(/G/g, '6'),
            code.replace(/B/g, '8'),
            code.replace(/O/g, '0')
          ];
          
          for (const v of variations) {
            if (allValidCodes.includes(v)) {
              detectedCodes.push(v);
              break;
            }
          }
        }
      }

      const uniqueCodes = [...new Set(detectedCodes)];
      
      if (uniqueCodes.length === 0) {
        const words = normalizedText.split(/[^A-Z0-9]/);
        words.forEach(w => {
          if (allValidCodes.includes(w)) uniqueCodes.push(w);
        });
      }

      const finalCodes = [...new Set(uniqueCodes)];
      setResults(finalCodes);
      
      if (finalCodes.length === 0) {
        setError("Nenhuma figurinha detectada.");
      }
    } catch (err) {
      setError("Erro no processamento da imagem.");
    } finally {
      setScanning(false);
    }
  };

  const saveResults = () => {
    const newCollection = { ...collection };
    results.forEach(num => {
      if (!newCollection[num]) {
        newCollection[num] = { status: 'collected', repeated: 0 };
      } else if (newCollection[num].status !== 'collected') {
        newCollection[num].status = 'collected';
      }
    });

    onUpdate(newCollection);
    onDone();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedFile(ev.target.result);
        setResults([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const processSelectedFile = () => {
    if (selectedFile) processImage(selectedFile);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10 items-center w-full">
      <div className="scanner-container">
        {selectedFile ? (
          <img src={selectedFile} className="scanner-media scanner-img" alt="Preview" />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="scanner-media scanner-video"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {!selectedFile && (
          <div className="absolute inset-0 border-2 border-primary/30 m-8 rounded-2xl pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
          </div>
        )}

        {scanning && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="font-bold">Analisando página...</p>
            {progress > 0 && (
              <p className="text-primary font-mono mt-2 text-xl">{progress}%</p>
            )}
          </div>
        )}

        {selectedFile && !scanning && (
          <button 
            onClick={() => setSelectedFile(null)} 
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl text-accent flex items-center gap-3">
          <X size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {results.length > 0 ? (
        <div className="glass-card p-6 space-y-4 w-full max-w-[280px]">
          <h3 className="font-bold flex items-center gap-2">
            <CheckCircle className="text-green-400" />
            Detectadas:
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.map(n => (
              <span key={n} className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold text-xs">
                #{n}
              </span>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveResults} className="btn-primary flex-1 text-xs">Salvar</button>
            <button onClick={() => setResults([])} className="p-3 bg-surface-color rounded-xl hover:bg-white/10 transition-colors">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          {selectedFile ? (
            <button 
              onClick={processSelectedFile} 
              disabled={scanning}
              className="btn-primary py-3 text-base justify-center"
            >
              <RefreshCw className={scanning ? "animate-spin" : ""} size={18} />
              Processar Imagem
            </button>
          ) : (
            <>
              <button 
                onClick={captureAndScan} 
                disabled={scanning}
                className="btn-primary py-3 text-base justify-center"
              >
                <Camera size={20} />
                Escanear Câmera
              </button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button className="w-full py-3 rounded-2xl border-2 border-dashed border-surface-border text-text-dim hover:border-primary hover:text-primary transition-all text-xs">
                  Selecionar foto
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Scanner;
