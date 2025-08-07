'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import React, { useState } from 'react';

interface ImageUploaderProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
}

export function ImageUploader({ onFilesAdded, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  return (
    <Card
      className={cn(
        'border-2 border-dashed hover:border-primary/50 transition-colors',
        isDragging && 'border-primary bg-primary/5',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
        >
          <div className="rounded-full bg-secondary p-4 text-primary transition-colors group-hover:bg-primary/10">
            <UploadCloud className="h-10 w-10" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">
              Drag & drop images here
            </p>
            <p className="text-muted-foreground">
              or click to browse. Supports JPG, PNG, BMP, TIFF.
            </p>
          </div>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          multiple
          accept="image/jpeg,image/png,image/bmp,image/tiff"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
