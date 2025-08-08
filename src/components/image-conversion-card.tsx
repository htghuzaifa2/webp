'use client';

import type { ImageFile } from '@/app/page';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface ImageConversionCardProps {
  imageFile: ImageFile;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ImageConversionCard({ imageFile }: ImageConversionCardProps) {
  const compressionPercentage =
    imageFile.originalSize && imageFile.convertedSize
      ? (
          ((imageFile.originalSize - imageFile.convertedSize) /
            imageFile.originalSize) *
          100
        ).toFixed(1)
      : 0;

  const handleDownload = () => {
    if (!imageFile.convertedUrl) return;
    const link = document.createElement('a');
    link.href = imageFile.convertedUrl;
    const originalFilename = imageFile.file.name
      .split('.')
      .slice(0, -1)
      .join('.');
    link.download = `${originalFilename}_optimized.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const isOptimizedSmaller = imageFile.convertedSize ? imageFile.convertedSize < imageFile.originalSize : false;

  return (
    <Card className="overflow-hidden w-full shadow-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <CardHeader className="p-4 bg-muted/50 border-b">
        <CardTitle className="truncate flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="truncate font-normal">{imageFile.file.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-center text-muted-foreground">
              Original
            </h3>
            <Card className="aspect-video relative overflow-hidden flex items-center justify-center bg-muted/50 rounded-lg">
              <Image
                src={imageFile.originalUrl}
                alt="Original image preview"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain' }}
                data-ai-hint="original image"
              />
            </Card>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBytes(imageFile.originalSize)}</span>
              <span>
                {imageFile.dimensions ? (
                  `${imageFile.dimensions.width}x${imageFile.dimensions.height}`
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-center text-muted-foreground flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Optimized WebP
            </h3>
            <Card
              className={cn(
                'aspect-video relative overflow-hidden flex items-center justify-center bg-muted/50 rounded-lg',
                imageFile.status === 'done' && 'animate-in fade-in-0 duration-500'
              )}
            >
              {imageFile.status === 'done' && imageFile.convertedUrl ? (
                <Image
                  src={imageFile.convertedUrl}
                  alt="Converted image preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'contain' }}
                  data-ai-hint="converted image"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="capitalize text-xs font-semibold">
                    {imageFile.status}...
                  </p>
                </div>
              )}
            </Card>
            {imageFile.status === 'done' && imageFile.convertedSize ? (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">
                  {formatBytes(imageFile.convertedSize)}
                </span>
                <Badge
                   variant={isOptimizedSmaller ? 'default' : 'secondary'}
                   className={cn(isOptimizedSmaller && 'bg-green-600/80 text-white')}
                >
                  {isOptimizedSmaller ? '-' : '+'}
                  {Math.abs(Number(compressionPercentage))}%
                </Badge>
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm mt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            )}
          </div>
        </div>

        {imageFile.status === 'error' && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Conversion Failed</AlertTitle>
            <AlertDescription className="text-xs">
              {imageFile.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      {imageFile.status === 'done' && (
        <CardFooter className="bg-muted/50 p-3 flex justify-end">
          <Button onClick={handleDownload} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
