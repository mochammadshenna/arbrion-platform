
import React, { useState, useRef, useCallback } from 'react';
import { ModernButton } from './ui/modern-button';
import { Card, CardContent } from './ui/card';
import { Camera, Upload, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  images: string[];
  maxImages?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesChange,
  images = [],
  maxImages = 5,
  className
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' 
        } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        const newImages = [...images, imageData];
        onImagesChange(newImages);
        stopCamera();
      }
    }
  }, [images, onImagesChange, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          const newImages = [...images, imageData];
          onImagesChange(newImages.slice(0, maxImages));
        };
        reader.readAsDataURL(file);
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, onImagesChange, maxImages]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const downloadImage = useCallback((imageData: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `purchase-order-image-${index + 1}.jpg`;
    link.click();
  }, []);

  if (showCamera) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Take a Photo</h3>
              <ModernButton
                variant="outline"
                size="sm"
                onClick={stopCamera}
                icon={X}
              >
                Cancel
              </ModernButton>
            </div>
            
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/60"></div>
                <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/60"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/60"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/60"></div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <ModernButton
                variant="primary"
                size="lg"
                onClick={capturePhoto}
                icon={Camera}
                className="px-8"
              >
                Capture Photo
              </ModernButton>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <ModernButton
              variant="primary"
              onClick={startCamera}
              icon={Camera}
              className="flex-1"
              disabled={images.length >= maxImages}
            >
              Take Photo
            </ModernButton>
            
            <ModernButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              icon={Upload}
              className="flex-1"
              disabled={images.length >= maxImages}
            >
              Upload Files
            </ModernButton>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <ModernButton
                      variant="success"
                      size="sm"
                      onClick={() => downloadImage(image, index)}
                      icon={Download}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                    />
                    <ModernButton
                      variant="danger"
                      size="sm"
                      onClick={() => removeImage(index)}
                      icon={X}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-500 text-center">
            {images.length}/{maxImages} images uploaded
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
