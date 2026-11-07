import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Scan, 
  Flashlight, 
  FlashlightOff, 
  Upload, 
  Check, 
  RefreshCw, 
  History, 
  Sparkles,
  QrCode,
  Barcode
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (scannedData: { code: string; type: 'vin' | 'part' | 'station'; label?: string }) => void;
  defaultMode?: 'vin' | 'part';
}

const PRESET_AUTOMOTIVE_CODES = [
  { code: 'VIN-WAUZZZ-89104', type: 'vin' as const, label: 'Platform-E01 BEV Chassis #89104', station: 'Station 14' },
  { code: 'VIN-WAUZZZ-89112', type: 'vin' as const, label: 'Platform-E01 BEV Chassis #89112', station: 'Station 22' },
  { code: 'VIN-WAUZZZ-89129', type: 'vin' as const, label: 'Platform-E01 BEV Chassis #89129', station: 'Station 08' },
  { code: 'VIN-5YJ3E1EB-7741', type: 'vin' as const, label: 'Sedan Dual Motor Unit #7741', station: 'Station 31' },
  { code: 'N-911-470-01', type: 'part' as const, label: 'M14 Flange Subframe Bolt', station: 'Station 14' },
  { code: 'HV-800V-CONN-A', type: 'part' as const, label: 'Inverter High Voltage Busbar Connector', station: 'Station 22' },
  { code: 'BRK-RR-CAL-RH', type: 'part' as const, label: 'Rear Right Brake Caliper Assembly', station: 'Station 18' },
  { code: 'DR-LH-PNL-04', type: 'part' as const, label: 'Driver Door Outer Stamped Panel', station: 'Station 08' },
];

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  defaultMode = 'vin',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'presets' | 'upload'>('camera');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([
    'VIN-WAUZZZ-89104',
    'HV-800V-CONN-A',
  ]);
  const [manualCode, setManualCode] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {}
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) setHasCamera(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);

        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'data_matrix', 'ean_13'],
          });

          const detectFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  handleCodeDetected(rawValue);
                  return;
                }
              } catch {}
            }
            animationFrameRef.current = requestAnimationFrame(detectFrame);
          };
          animationFrameRef.current = requestAnimationFrame(detectFrame);
        }
      } catch (err) {
        console.warn('Camera access not granted or not available:', err);
        if (isMounted) setHasCamera(false);
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCodeDetected = (code: string) => {
    playBeep();
    setScannedResult(code);
    setScanHistory((prev) => [code, ...prev.filter((c) => c !== code)].slice(0, 5));

    const isPart = !code.startsWith('VIN-') && (code.includes('-') || code.length < 15);
    const type = isPart ? 'part' : 'vin';

    setTimeout(() => {
      onScanComplete({ code, type });
      onClose();
    }, 400);
  };

  const handleSelectPreset = (item: typeof PRESET_AUTOMOTIVE_CODES[0]) => {
    handleCodeDetected(item.code);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeDetected(manualCode.trim().toUpperCase());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const simulatedCode = file.name.toUpperCase().includes('PART')
      ? 'HV-800V-CONN-A'
      : `VIN-WAUZZZ-${Math.floor(10000 + Math.random() * 90000)}`;

    handleCodeDetected(simulatedCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Optical QR & Barcode Scanner
              </h2>
              <p className="text-[11px] text-slate-400">
                Scan vehicle chassis VIN or component part tag
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('camera')}
            className={`py-2.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'camera'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-2.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'presets'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Factory VIN Presets</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-4">
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {hasCamera ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-700 shadow-inner max-w-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>IATF 16949 COMPLIANT TAG</span>
                        <span>QR CODE 2D</span>
                      </div>
                      <div className="py-2 flex items-center justify-center gap-3">
                        <QrCode className="w-12 h-12 text-amber-400" />
                        <div className="text-left font-mono">
                          <p className="text-xs font-bold text-white">VIN-WAUZZZ-89104</p>
                          <p className="text-[10px] text-slate-400">BEV SEDAN CHASSIS</p>
                          <p className="text-[10px] text-emerald-400">STATION 14 BOLTING</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCodeDetected('VIN-WAUZZZ-89104')}
                        className="w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded transition-all shadow"
                      >
                        Simulate Optical Read
                      </button>
                    </div>
                  </div>
                )}

                {/* Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />

                  <div className="w-56 h-40 border-2 border-amber-400/80 rounded-lg relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTorchOn(!torchOn)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
                  title="Toggle Inspection Torch"
                >
                  {torchOn ? (
                    <Flashlight className="w-4 h-4 text-amber-400" />
                  ) : (
                    <FlashlightOff className="w-4 h-4" />
                  )}
                </button>

                {scannedResult && (
                  <div className="absolute bottom-3 px-3 py-1 bg-emerald-600 text-white font-mono text-xs font-bold rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce">
                    <Check className="w-3.5 h-3.5" />
                    <span>DECODED: {scannedResult}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-center text-slate-400">
                Align the red scan line with the vehicle chassis QR code or part barcode.
              </p>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Tap any pre-registered production chassis VIN or part tag from current Shift A:
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {PRESET_AUTOMOTIVE_CODES.map((item) => (
                  <div
                    key={item.code}
                    onClick={() => handleSelectPreset(item)}
                    className="p-3 bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/80 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        {item.type === 'vin' ? (
                          <Barcode className="w-4 h-4" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white">
                            {item.code}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded uppercase">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.label} · {item.station}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 font-bold text-xs rounded transition-colors">
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-3 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-6">
              <QrCode className="w-10 h-10 text-amber-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Upload Barcode / QR Image</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Upload a photo of a vehicle sticker, shipping label, or chassis engraving to automatically decode.
                </p>
              </div>

              <label className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or type VIN or Part # manually..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-lg transition-colors"
            >
              Apply
            </button>
          </form>

          {scanHistory.length > 0 && (
            <div className="pt-1 flex items-center gap-2 overflow-x-auto text-[10px] text-slate-400 font-mono">
              <span className="shrink-0 text-slate-500">Recent:</span>
              {scanHistory.map((code) => (
                <button
                  key={code}
                  onClick={() => handleCodeDetected(code)}
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shrink-0"
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
