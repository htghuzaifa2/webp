'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/header';
import { ImageConversionCard } from '@/components/image-conversion-card';
import { ImageUploader } from '@/components/image-uploader';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { optimizeWebpImage } from '@/app/actions';

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
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const { toast } = useToast();

  const handleFilesAdded = async (files: File[]) => {
    const newImageFiles: ImageFile[] = [];
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const dimensions = await getImageDimensions(file);
          newImageFiles.push({
            id: crypto.randomUUID(),
            file,
            originalUrl: URL.createObjectURL(file),
            originalSize: file.size,
            status: 'pending',
            dimensions,
          });
        } catch (error) {
          console.error('Could not get dimensions for file:', file.name);
        }
      }
    }

    if (newImageFiles.length !== files.length) {
      toast({
        title: 'Unsupported file type',
        description: 'Some files were not images and have been ignored.',
        variant: 'destructive',
      });
    }

    setImages((prev) => [...prev, ...newImageFiles]);
  };

  const updateImageState = useCallback(
    (id: string, updates: Partial<ImageFile>) => {
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
      );
    },
    []
  );

  const processImage = useCallback(
    async (imageFile: ImageFile) => {
      try {
        updateImageState(imageFile.id, { status: 'converting' });

        const originalDataUrl = await fileToDataUrl(imageFile.file);

        const convertedDataUrl = await optimizeWebpImage(originalDataUrl);

        const res = await fetch(convertedDataUrl);
        const convertedBlob = await res.blob();
        const convertedUrl = URL.createObjectURL(convertedBlob);

        updateImageState(imageFile.id, {
          convertedUrl,
          convertedSize: convertedBlob.size,
          status: 'done',
        });
      } catch (error) {
        console.error('Conversion failed for', imageFile.file.name, error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unknown error occurred during conversion.';
        updateImageState(imageFile.id, {
          status: 'error',
          error: errorMessage,
        });
        toast({
          title: `Conversion Error: ${imageFile.file.name}`,
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    [updateImageState, toast]
  );

  const startProcessing = () => {
    images
      .filter((image) => image.status === 'pending')
      .forEach((image) => processImage(image));
  };

  useEffect(() => {
    if (images.some((img) => img.status === 'pending')) {
      startProcessing();
    }
  }, [images]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.originalUrl) URL.revokeObjectURL(image.originalUrl);
        if (image.convertedUrl) URL.revokeObjectURL(image.convertedUrl);
      });
    };
  }, [images]);

  const clearAll = () => {
    setImages([]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              AI-Powered WebP Image Optimizer
            </h1>
            <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
              Drag and drop your images to convert them to the highly efficient
              WebP format, using AI to find the perfect balance between quality
              and file size.
            </p>
          </div>
          <ImageUploader onFilesAdded={handleFilesAdded} />

          {images.length > 0 && (
            <div className="space-y-6 animate-in fade-in-0 duration-500">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {images.filter((img) => img.status === 'done').length} of{' '}
                    {images.length} images converted.
                  </p>
                  <Button onClick={clearAll} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  {images.map((image) => (
                    <ImageConversionCard key={image.id} imageFile={image} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built with Next.js and Firebase.
      </footer>
    </div>
  );
}
