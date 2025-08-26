'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useUploadThing } from '@/lib/utils/uploadthing';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  endpoint: "claimDocuments" | "policyDocuments";
  onChange: (files: any[]) => void;
  value?: any[];
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  url: string;
  type: string;
  key?: string;
}

export function FileUpload({ 
  endpoint, 
  onChange, 
  value = [], 
  maxFiles = 10,
  disabled = false,
  className 
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const newFiles = res?.map(file => ({
        name: file.name,
        size: file.size,
        url: file.url,
        type: file.name.split('.').pop()?.toLowerCase() || 'file',
      })) || [];
      
      onChange([...value, ...newFiles]);
      setUploadProgress({});
      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setUploadProgress({});
      setIsUploading(false);
    },
    onUploadProgress: (p) => {
      setUploadProgress(prev => ({ ...prev, [endpoint]: p }));
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;
    
    // Check if adding these files would exceed maxFiles
    if (value.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    await startUpload(acceptedFiles);
  }, [startUpload, value.length, maxFiles, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || isUploading,
    maxFiles: maxFiles - value.length,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.doc', '.docx'],
    }
  });

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type)) {
      return <Image className="h-4 w-4" />;
    }
    if (type === 'application/pdf' || type === 'pdf') {
      return <FileText className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-insurance-blue bg-insurance-blue/5" : "border-muted-foreground/25",
          disabled || isUploading ? "cursor-not-allowed opacity-50" : "hover:border-insurance-blue hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-insurance-blue" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">
              Images, PDFs, and documents up to 16MB
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress[endpoint] !== undefined && (
          <div className="mt-4 max-w-xs mx-auto">
            <Progress value={uploadProgress[endpoint]} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {uploadProgress[endpoint]}% uploaded
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files ({value.length}/{maxFiles})</p>
          <div className="space-y-2">
            {value.map((file, index) => (
              <Card key={index}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {value.length >= maxFiles && (
        <p className="text-sm text-muted-foreground text-center">
          Maximum file limit reached ({maxFiles} files)
        </p>
      )}
    </div>
  );
}