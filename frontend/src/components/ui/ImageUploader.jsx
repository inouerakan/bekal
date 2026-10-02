import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function ImageUploader({ value, onChange, label = "Upload Gambar" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const sigRes = await apiFetch('/api/upload/signature');
      const { signature, timestamp, cloudName, apiKey, uploadPreset, folder } = sigRes.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
        onChange(optimizedUrl);
        setPreview(optimizedUrl);
      } else {
        throw new Error('Upload gagal');
      }
    } catch (error) {
      alert('Gagal upload gambar: ' + error.message);
      setPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-dark-2 mb-1.5">{label}</label>
      
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-light-2 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-light-1/50 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-full text-accent group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs text-dark-2 font-medium">Klik untuk upload gambar</p>
              <p className="text-[10px] text-dark-2/50">PNG, JPG, WEBP (Max 5MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-light-2">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/90 rounded-full text-dark-1 hover:bg-white transition-colors"
              title="Ganti Gambar"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-500/90 rounded-full text-white hover:bg-red-500 transition-colors"
              title="Hapus Gambar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2">
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white text-[10px] font-bold rounded-full">
              <CheckCircle className="w-3 h-3" /> Terupload
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}