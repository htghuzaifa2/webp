'use client';

import type { OptimizeWebpOutput } from '@/ai/flows/optimize-webp-conversion';
import { Header } from '@/components/header';
import { ImageConversionCard } from '@/components/image-conversion-card';
import { ImageUploader } from '@/components/image-uploader';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useState } from 'react';
import { optimizeWebp } from './actions';

export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  convertedUrl?: string;
  originalSize: number;
  convertedSize?: number;
  optimization?: OptimizeWebpOutput;
  status: 'pending' | 'optimizing' | 'converting' | 'done' | 'error';
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
  imageUrl: string,
  quality: number,
  dimensions: { width: number; height: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Could not get canvas context'));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          resolve(blob);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
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
    async (image: ImageFile) => {
      try {
        const dimensions = await getImageDimensions(image.originalUrl);
        updateImageState(image.id, { dimensions, status: 'optimizing' });

        const optimizationResult = await optimizeWebp({
          originalSizeKb: image.originalSize / 1024,
          imageType: image.file.type,
          description: `A user-uploaded image for WebP conversion.`,
        });
        updateImageState(image.id, {
          optimization: optimizationResult,
          status: 'converting',
        });

        const quality = optimizationResult.quality / 100;
        const convertedBlob = await convertToWebp(
          image.originalUrl,
          quality,
          dimensions
        );
        const convertedUrl = URL.createObjectURL(convertedBlob);

        updateImageState(image.id, {
          convertedUrl,
          convertedSize: convertedBlob.size,
          status: 'done',
        });
      } catch (error) {
        console.error('Conversion failed for', image.file.name, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during conversion.';
        updateImageState(image.id, {
          status: 'error',
          error: errorMessage,
        });
        toast({
          title: `Conversion Error: ${image.file.name}`,
          description: errorMessage,
          variant: 'destructive'
        })
      }
    },
    [updateImageState, toast]
  );

  useEffect(() => {
    images.forEach(image => {
      if (image.status === 'pending') {
        processImage(image);
      }
    });
  }, [images, processImage]);
  
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.originalUrl);
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      });
    };
  }, [images]);

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
              Upload your images and let our AI find the perfect balance between
              quality and file size.
            </p>
          </div>
          <ImageUploader onFilesAdded={handleFilesAdded} />

          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Conversion Results</h3>
              <div className="grid gap-6">
                {images.map((image) => (
                  <ImageConversionCard key={image.id} imageFile={image} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Built with Next.js and Genkit AI.
      </footer>
    </div>
  );
}
