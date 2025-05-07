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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);

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
        setIsCameraAvailable(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setIsCameraAvailable(false);
      toast({
        title: "Camera Access Error",
        description: "Unable to access your camera. Please check permissions or try uploading an image instead.",
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

  const confirmCapture = async () => {
    if (capturedImage) {
      setIsProcessing(true);
      try {
        // Apply image enhancement
        const enhancedImage = await enhanceReceiptImage(capturedImage);
        toast({
          title: "Image Enhanced",
          description: "Receipt quality improved for better text extraction",
        });
        
        // Pass the enhanced image back
        onCapture(enhancedImage);
        setCapturedImage(null);
      } catch (error) {
        console.error("Error enhancing image:", error);
        // If enhancement fails, use original
        onCapture(capturedImage);
        setCapturedImage(null);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const enhanceReceiptImage = async (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      // Create a new image element to load the captured image
      const img = new Image();
      img.onload = () => {
        // Create a canvas to manipulate the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageData); // Return original if context creation fails
          return;
        }
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Apply contrast enhancement and binarization for better OCR
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale first
          const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          
          // Apply contrast enhancement
          const contrast = 1.5; // Increase contrast
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const enhancedValue = factor * (brightness - 128) + 128;
          
          // Apply threshold for better text/background separation
          const threshold = 160;
          const finalValue = enhancedValue > threshold ? 255 : 0;
          
          // Set RGB channels to the same value (black or white)
          data[i] = finalValue;     // R
          data[i + 1] = finalValue; // G
          data[i + 2] = finalValue; // B
          // Keep alpha channel as is
        }
        
        // Put the processed image back on the canvas
        ctx.putImageData(imgData, 0, 0);
        
        // Convert canvas to data URL
        const enhancedImageData = canvas.toDataURL('image/png');
        resolve(enhancedImageData);
      };
      
      img.src = imageData;
    });
  };

  // Handle file upload directly from this component
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Create a FileReader to read the image file
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setCapturedImage(event.target.result);
        stopCamera(); // Stop camera if it was running
      }
    };
    
    reader.readAsDataURL(file);
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
            {isCameraAvailable ? (
              <video 
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover" 
                autoPlay 
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center p-4">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Camera access denied or not available</p>
                  <p className="text-sm text-gray-400 mt-2">Please check camera permissions or use the upload option below</p>
                </div>
              </div>
            )}
            
            {/* Camera guides overlay */}
            {isCameraAvailable && (
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
            )}
            
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
          <>
            {isCameraAvailable && (
              <Button 
                onClick={captureImage}
                className="bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2 py-6"
                disabled={!isStreamActive || isCapturing}
              >
                <Camera className="h-6 w-6" />
                <span className="text-lg">Capture Receipt</span>
              </Button>
            )}
            
            <div className="relative">
              <Button 
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <FileImage className="h-4 w-4" />
                <span>Upload from gallery</span>
              </Button>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
            </div>
          </>
        ) : (
          <div className="flex gap-3">
            <Button 
              onClick={resetCapture}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              Retake
            </Button>
            
            <Button 
              onClick={confirmCapture}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <motion.div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Enhancing...</span>
                </motion.div>
              ) : (
                "Use This Image"
              )}
            </Button>
          </div>
        )}
        
        <p className="text-sm text-center text-gray-500 mt-2">
          Position your receipt or bank statement within the frame and ensure all text is clearly visible
        </p>
      </div>
    </div>
  );
};

export default CameraCapturePanel;
