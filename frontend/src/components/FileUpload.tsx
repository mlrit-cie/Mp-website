import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BUCKET = 'project-files';
const ALLOWED_EXT = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
const MAX_BYTES = 20 * 1024 * 1024;

interface FileUploadProps {
  label: string;
  kind: 'ppt' | 'report' | 'yukthi';
  teamId: number | null;
  currentPath: string | null | undefined;
  onChange: (newPath: string | null) => Promise<void> | void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, kind, teamId, currentPath, onChange, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // Build a signed URL for the currently-stored file (1-hour expiry)
  useEffect(() => {
    let cancelled = false;
    if (!currentPath) { setSignedUrl(null); return; }
    (async () => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(currentPath, 3600);
      if (!cancelled) setSignedUrl(data?.signedUrl ?? null);
    })();
    return () => { cancelled = true; };
  }, [currentPath]);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    if (!teamId) {
      toast({ title: 'No team yet', description: 'Files can be uploaded after your team is created.', variant: 'destructive' });
      return;
    }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      toast({ title: 'Unsupported file type', description: `Allowed: ${ALLOWED_EXT.join(', ')}`, variant: 'destructive' });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'Maximum 20 MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // Delete previous file at the old path (best-effort)
      if (currentPath) {
        await supabase.storage.from(BUCKET).remove([currentPath]).catch(() => {});
      }
      const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_');
      const path = `${teamId}/${kind}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw upErr;
      await onChange(path);
      toast({ title: `${label} uploaded` });
    } catch (err: any) {
      console.error('upload error:', err);
      toast({ title: 'Upload failed', description: err?.message || 'Unknown error', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentPath) return;
    setUploading(true);
    try {
      await supabase.storage.from(BUCKET).remove([currentPath]).catch(() => {});
      await onChange(null);
      toast({ title: `${label} removed` });
    } finally {
      setUploading(false);
    }
  };

  const filename = currentPath ? currentPath.split('/').pop()?.replace(/^\d+_/, '') : null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{label}</p>
      {currentPath ? (
        <div className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs truncate flex-1" title={filename || ''}>{filename}</span>
          {signedUrl && (
            <a href={signedUrl} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary p-1" title="Download">
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
          {!disabled && (
            <button onClick={handleRemove} disabled={uploading}
              className="text-muted-foreground hover:text-destructive p-1" title="Remove">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-8"
          disabled={disabled || uploading || !teamId}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />}
          {uploading ? 'Uploading…' : `Upload ${label}`}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXT.map(e => '.' + e).join(',')}
        className="hidden"
        onChange={handleSelect}
      />
    </div>
  );
};

export default FileUpload;
