
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { ImageConversionCard } from '@/components/image-conversion-card';
import { ImageUploader } from '@/components/image-uploader';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  convertedUrl?: string;
  originalSize: number;
  convertedSize?: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
  dimensions?: { width: number; height: number };
}

async function getImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

async function convertToWebp(
  file: File,
  quality: number
): Promise<Blob> {
  // Using createImageBitmap for a more robust and efficient way to get image data.
  const imageBitmap = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context.');
  }

  ctx.drawImage(imageBitmap, 0, 0);
  
  // Close the bitmap to free up memory
  imageBitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas toBlob returned null. This can happen if the image is too large.'));
        }
      },
      'image/webp',
      quality / 100
    );
  });
}


export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(75);
  const { toast } = useToast();

  const handleFilesAdded = (files: File[]) => {
    const newImageFiles: ImageFile[] = files
      .filter(file => file.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        originalUrl: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending',
      }));
    
    if (newImageFiles.length !== files.length) {
      toast({
        title: 'Unsupported file type',
        description: 'Some files were not images and have been ignored.',
        variant: 'destructive',
      });
    }

    setImages((prev) => [...prev, ...newImageFiles]);
  };

  const updateImageState = useCallback((id: string, updates: Partial<ImageFile>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  }, []);

  const processImage = useCallback(
    async (imageFile: ImageFile, conversionQuality: number) => {
      try {
        updateImageState(imageFile.id, { status: 'converting' });

        // Get dimensions first
        const dimensions = await getImageDimensions(imageFile.originalUrl);
        updateImageState(imageFile.id, { dimensions });

        const convertedBlob = await convertToWebp(imageFile.file, conversionQuality);
        const convertedUrl = URL.createObjectURL(convertedBlob);

        updateImageState(imageFile.id, {
          convertedUrl,
          convertedSize: convertedBlob.size,
          status: 'done',
        });
      } catch (error) {
        console.error('Conversion failed for', imageFile.file.name, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during conversion.';
        updateImageState(imageFile.id, {
          status: 'error',
          error: errorMessage,
        });
        toast({
          title: `Conversion Error: ${imageFile.file.name}`,
          description: errorMessage,
          variant: 'destructive'
        })
      }
    },
    [updateImageState, toast]
  );

  useEffect(() => {
    const pendingImages = images.filter(image => image.status === 'pending');
    if (pendingImages.length > 0) {
      pendingImages.forEach(image => {
        processImage(image, quality);
      });
    }
  }, [images, processImage, quality]);
  
  // Effect for cleaning up Object URLs
  useEffect(() => {
    // This function will be called when the component unmounts
    return () => {
      images.forEach(image => {
        if (image.originalUrl) {
          URL.revokeObjectURL(image.originalUrl);
        }
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      });
    };
  }, [images]);
  
  const handleRecompressAll = () => {
    setImages(prevImages => {
      return prevImages.map(image => {
        // Only re-queue images that have already been processed or failed
        if (image.status === 'done' || image.status === 'error') {
          // Clean up old converted URL before re-compressing
          if (image.convertedUrl) {
            URL.revokeObjectURL(image.convertedUrl);
          }
          return { 
            ...image, 
            status: 'pending',
            convertedUrl: undefined,
            convertedSize: undefined,
            error: undefined,
          };
        }
        return image;
      });
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold">
              Optimize Images to <span className="text-primary">Next-Gen</span>{' '}
              WebP
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Upload your images and convert them to the modern WebP format right in your browser.
            </p>
          </div>
          <ImageUploader onFilesAdded={handleFilesAdded} />

          {images.length > 0 && (
            <div className="space-y-6">
               <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quality-slider" className="flex justify-between items-center">
                      <span>Conversion Quality</span>
                      <span className="text-lg font-bold text-primary">{quality}</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Lower values result in smaller file sizes, but may reduce image quality.
                    </p>
                    <Slider
                      id="quality-slider"
                      min={1}
                      max={100}
                      step={1}
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                    />
                  </div>
                   <Button onClick={handleRecompressAll} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Re-compress All Images with New Quality
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Conversion Results</h3>
                <div className="grid gap-6">
                  {images.map((image) => (
                    <ImageConversionCard key={image.id} imageFile={image} quality={quality}/>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Built with Next.js.
      </footer>
    </div>
  );
}
