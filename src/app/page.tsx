'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/header';
import { ImageConversionCard } from '@/components/image-conversion-card';
import { ImageUploader } from '@/components/image-uploader';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import JSZip from 'jszip';
import { Archive, Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface ImageFile {
  id: string;
  file: File;
  originalUrl: string;
  convertedUrl?: string;
  convertedFile?: File;
  originalSize: number;
  convertedSize?: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
  dimensions?: { width: number; height: number };
}

async function convertToWebp(
  file: File,
  quality = 0.9
): Promise<{ url: string; size: number; file: File }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context.'));
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(
                new Error(
                  'Canvas toBlob returned null. The image might be too large or from a protected source.'
                )
              );
            }
            // If the new blob is larger than the original file, use the original file
            if (blob.size > file.size) {
              const url = URL.createObjectURL(file);
              resolve({ url, size: file.size, file: file });
              return;
            }

            const newFile = new File(
              [blob],
              file.name.replace(/.[^/.]+$/, '.webp'),
              { type: 'image/webp' }
            );
            const url = URL.createObjectURL(newFile);
            resolve({ url, size: newFile.size, file: newFile });
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => {
        reject(new Error('Failed to load image for conversion.'));
      };
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
  });
}

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const { toast } = useToast();
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    // 3-minute timer to open huzi.pk
    const timer = setTimeout(() => {
      window.open('https://huzi.pk', '_blank');
    }, 3 * 60 * 1000); // 3 minutes in milliseconds

    // Click counter logic
    const handleClick = () => {
      let currentCount = parseInt(localStorage.getItem('clickCount') || '0', 10);
      currentCount++;
      if (currentCount >= 25) {
        window.open('https://huzi.pk', '_blank');
        localStorage.setItem('clickCount', '0');
      } else {
        localStorage.setItem('clickCount', currentCount.toString());
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const handleFilesAdded = async (files: File[]) => {
    const newImageFiles: ImageFile[] = await Promise.all(
      files.map(async (file) => {
        const dimensions = await new Promise<{
          width: number;
          height: number;
        }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            resolve({ width: img.width, height: img.height });
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(file);
        });

        return {
          id: crypto.randomUUID(),
          file,
          originalUrl: URL.createObjectURL(file),
          originalSize: file.size,
          status: 'pending',
          dimensions,
        };
      })
    );

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

  const processQueue = useCallback(async () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    if (pendingImages.length === 0) return;

    const processImage = async (imageFile: ImageFile) => {
      updateImageState(imageFile.id, { status: 'converting' });
      try {
        const {
          url: convertedUrl,
          size: convertedSize,
          file: convertedFile,
        } = await convertToWebp(imageFile.file, 0.9);
        updateImageState(imageFile.id, {
          convertedUrl,
          convertedSize,
          convertedFile: convertedFile,
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
    };

    await Promise.all(pendingImages.map(processImage));
  }, [images, updateImageState, toast]);

  useEffect(() => {
    if (images.some((img) => img.status === 'pending')) {
      processQueue();
    }
  }, [images, processQueue]);

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.originalUrl) {
          URL.revokeObjectURL(image.originalUrl);
        }
        if (image.convertedUrl) {
          URL.revokeObjectURL(image.convertedUrl);
        }
      });
    };
  }, [images]);

  const clearAll = () => {
    images.forEach((image) => {
      if (image.originalUrl) URL.revokeObjectURL(image.originalUrl);
      if (image.convertedUrl) URL.revokeObjectURL(image.convertedUrl);
    });
    setImages([]);
  };

  const downloadAllAsZip = async () => {
    const doneImages = images.filter(
      (img) => img.status === 'done' && img.convertedFile
    );
    if (doneImages.length === 0) {
      toast({
        title: 'No images to download',
        description: 'Please wait for images to be converted before downloading.',
        variant: 'destructive',
      });
      return;
    }

    setIsZipping(true);
    const zip = new JSZip();

    for (const image of doneImages) {
      const originalFilename = image.file.name.split('.').slice(0, -1).join('.');
      zip.file(`${originalFilename}_optimized.webp`, image.convertedFile!);
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `webp.huzi.pk_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Could not create the zip file.';
      toast({
        title: 'ZIP Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsZipping(false);
    }
  };

  const convertedCount = images.filter((img) => img.status === 'done').length;
  const progress =
    images.length > 0 ? (convertedCount / images.length) * 100 : 0;
  const canDownloadAll = convertedCount > 1 && progress === 100;

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-lg border-primary/20 animate-in fade-in-0 duration-500">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl tracking-tight">
                    WebP Optimizer
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Convert images to WebP online. Free & private.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ImageUploader onFilesAdded={handleFilesAdded} />
            </CardContent>
          </Card>

          {images.length > 0 && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                        <p>
                          {convertedCount} of {images.length} images converted.
                        </p>
                        <p>{Math.round(progress)}%</p>
                      </div>
                      <Progress value={progress} />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {canDownloadAll && (
                        <Button
                          onClick={downloadAllAsZip}
                          variant="outline"
                          disabled={isZipping}
                        >
                          <Archive className="mr-2" />
                          {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                        </Button>
                      )}
                      <Button onClick={clearAll} variant="destructive">
                        <Trash2 className="mr-2" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {images.map((image) => (
                  <ImageConversionCard key={image.id} imageFile={image} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        A project by{' '}
        <a
          href="https://huzi.pk"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          huzi.pk
        </a>
        .
      </footer>
    </div>
  );
}
