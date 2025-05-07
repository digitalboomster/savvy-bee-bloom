
import React, { useRef, useState } from 'react';
import { Camera, FileImage, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from "@/hooks/use-toast";

interface CameraCapturePanelProps {
  onCapture: (imageData: string) => void;
}

const CameraCapturePanel: React.FC<CameraCapturePanelProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Access Error",
        description: "Unable to access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsCapturing(true);
      
      setTimeout(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (canvas && video) {
          const context = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/png');
          setCapturedImage(imageData);
          stopCamera();
          setIsCapturing(false);
        }
      }, 500); // Small delay for flash effect
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  // Start camera automatically when component mounts
  React.useEffect(() => {
    startCamera();
    
    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-lg overflow-hidden mb-4">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover" 
              autoPlay 
              playsInline
            />
            
            {/* Camera guides overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Receipt outline guide */}
              <div className="absolute inset-0 border-2 border-amber-400 border-opacity-70 m-8 rounded-md"></div>
              
              {/* Corner markers */}
              <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-amber-400"></div>
              <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-amber-400"></div>
              <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-amber-400"></div>
              <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-amber-400"></div>
              
              <div className="absolute top-0 left-0 right-0 text-center bg-black bg-opacity-50 text-white p-2 text-sm">
                Position receipt in frame
              </div>
            </div>
            
            {/* Flash effect */}
            {isCapturing && (
              <motion.div 
                className="absolute inset-0 bg-white" 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5 }}
              />
            )}
          </>
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured receipt" 
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex flex-col w-full max-w-md gap-3">
        {!capturedImage ? (
          <Button 
            onClick={captureImage}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 py-6"
            disabled={!isStreamActive || isCapturing}
          >
            <Camera className="h-6 w-6" />
            <span className="text-lg">Capture Receipt</span>
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button 
              onClick={resetCapture}
              variant="outline"
              className="flex-1"
            >
              Retake
            </Button>
            
            <Button 
              onClick={confirmCapture}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              Use This Image
            </Button>
          </div>
        )}
        
        <p className="text-sm text-center text-gray-500 mt-2">
          Position your receipt or bank statement within the frame and ensure all text is clearly visible
        </p>
        
        <div className="flex items-center justify-center mt-4">
          <div className="relative">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileImage className="h-4 w-4" />
              <span>Upload from gallery</span>
            </Button>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapturePanel;
