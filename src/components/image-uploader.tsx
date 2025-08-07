'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from './ui/use-toast';

interface ImageUploaderProps {
  onFilesAdded: (files: File[]) => void;
  className?: string;
}

const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 10;

export function ImageUploader({ onFilesAdded, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const files = Array.from(fileList);

    if (files.length > MAX_FILES) {
      toast({
        title: 'Too many files',
        description: `You can only upload a maximum of ${MAX_FILES} files at a time.`,
        variant: 'destructive',
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than ${MAX_FILE_SIZE_MB}MB and has been ignored.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset the input value to allow re-uploading the same file
    e.target.value = '';
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
    processFiles(e.dataTransfer.files);
    e.dataTransfer.clearData();
  };

  return (
    <Card
      className={cn(
        'border-2 border-dashed hover:border-primary transition-colors duration-300',
        isDragging && 'border-primary bg-primary/10',
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
          className="flex flex-col items-center justify-center space-y-4 cursor-pointer text-center"
        >
          <div className="rounded-full border-8 border-secondary bg-secondary p-4 text-primary transition-colors group-hover:bg-primary/10">
            <UploadCloud className="h-10 w-10" />
          </div>
          <div>
            <p className="font-semibold text-lg">
              Click to upload or drag & drop images
            </p>
            <p className="text-muted-foreground text-sm">
              Supports JPG, PNG, BMP, etc. Max 10MB per file.
            </p>
          </div>
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
