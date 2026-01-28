import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileStatus, setFileStatus] = useState<'idle' | 'parsing' | 'success'>('idle');
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const processFile = (file: File) => {
        setFileName(file.name);
        setFileStatus('success');
        onFileSelect(file);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf"
            />
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors cursor-pointer hover:bg-muted/50',
                    isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                    fileStatus === 'success' ? 'border-green-500/50 bg-green-500/5' : ''
                )}
            >
                {fileStatus === 'idle' && (
                    <>
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold">Upload your Resume</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Drag & drop your PDF here or click to browse
                        </p>
                    </>
                )}

                {fileStatus === 'parsing' && (
                    <div className="flex flex-col items-center animate-pulse">
                        <FileText className="h-12 w-12 text-primary mb-4" />
                        <p className="text-sm font-medium">Parsing resume...</p>
                    </div>
                )}

                {fileStatus === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-semibold text-green-500">File Parsed</h3>
                        <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                    </div>
                )}
            </div>
        </>
    );
}
