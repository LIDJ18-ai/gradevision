import { useState, useRef } from 'react';
import {
  Upload,
  X,
  ImageIcon,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { uploadCardImage, type StoredImage } from '@/lib/storage';
import type { Page } from '@/types';

interface UploadPageProps {
  onNavigate: (page: Page) => void;
  onComplete: (cardData: UploadedCardData) => void;
}

export interface UploadedCardData {
  cardName: string;
  cardSet: string | null;
  cardYear: string | null;
  frontImagePath: string;
  frontImageUrl: string;
  backImagePath: string | null;
  backImageUrl: string | null;
  closeupImagePath: string | null;
  closeupImageUrl: string | null;
}

type Slot = 'front' | 'back' | 'closeup';

const SLOT_CONFIG: Record<Slot, { label: string; sublabel: string; required: boolean }> = {
  front: { label: 'Front of Card', sublabel: 'Required — the main face of your card', required: true },
  back: { label: 'Back of Card', sublabel: 'Recommended — helps detect edge and back surface wear', required: false },
  closeup: { label: 'Detailed Close-Up', sublabel: 'Optional — zoomed shot for surface and corner detail', required: false },
};

export default function UploadPage({ onNavigate, onComplete }: UploadPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'info' | 'images'>('info');
  const [cardName, setCardName] = useState('');
  const [cardSet, setCardSet] = useState('');
  const [cardYear, setCardYear] = useState('');
  const [images, setImages] = useState<Record<Slot, { file: File; url: string } | null>>({
    front: null,
    back: null,
    closeup: null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);

  const handleImageSelect = (slot: Slot, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setImages((prev) => ({ ...prev, [slot]: { file, url } }));
  };

  const removeImage = (slot: Slot) => {
    setImages((prev) => {
      const current = prev[slot];
      if (current) URL.revokeObjectURL(current.url);
      return { ...prev, [slot]: null };
    });
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) {
      setInfoError('Please enter the card name');
      return;
    }
    setInfoError(null);
    setStep('images');
  };

  const handleSubmit = async () => {
    if (!images.front) {
      setError('A front image is required');
      return;
    }
    if (!user) {
      onNavigate('login');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const front: StoredImage = await uploadCardImage(images.front.file, user.id, 'front');
      const frontImageUrl = front.url;
      const frontImagePath = front.path;

      let backImagePath: string | null = null;
      let backImageUrl: string | null = null;
      if (images.back) {
        const back: StoredImage = await uploadCardImage(images.back.file, user.id, 'back');
        backImageUrl = back.url;
        backImagePath = back.path;
      }

      let closeupImagePath: string | null = null;
      let closeupImageUrl: string | null = null;
      if (images.closeup) {
        const closeup: StoredImage = await uploadCardImage(images.closeup.file, user.id, 'closeup');
        closeupImageUrl = closeup.url;
        closeupImagePath = closeup.path;
      }

      Object.values(images).forEach((img) => {
        if (img) URL.revokeObjectURL(img.url);
      });

      onComplete({
        cardName: cardName.trim(),
        cardSet: cardSet.trim() || null,
        cardYear: cardYear.trim() || null,
        frontImagePath,
        frontImageUrl,
        backImagePath,
        backImageUrl,
        closeupImagePath,
        closeupImageUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images. Please try again.');
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="card-surface-elevated p-10 text-center max-w-md">
          <div className="w-14 h-14 rounded-xl border border-gold-400/30 bg-gold-400/5 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-gold-400" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-white mb-2">
            Sign in to upload
          </h2>
          <p className="text-sm text-ink-400 mb-6">
            You need an account to submit cards for grading. Your reports are saved privately to your dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => onNavigate('signup')} className="btn-gold w-full">
              Create Account
              <ArrowRight size={16} />
            </button>
            <button onClick={() => onNavigate('login')} className="btn-ghost w-full">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in">
      <div className="section-padding max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2.5 ${step === 'info' ? 'text-gold-300' : 'text-ink-400'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border ${
              step === 'info' ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-ink-600 bg-ink-800'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Card Details</span>
          </div>
          <div className="flex-1 h-px bg-ink-700" />
          <div className={`flex items-center gap-2.5 ${step === 'images' ? 'text-gold-300' : 'text-ink-400'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold border ${
              step === 'images' ? 'border-gold-400/40 bg-gold-400/10 text-gold-300' : 'border-ink-600 bg-ink-800'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Upload Images</span>
          </div>
        </div>

        {step === 'info' ? (
          /* Step 1: Card Info */
          <div className="card-surface-elevated p-8 md:p-10 animate-fade-up">
            <h1 className="text-2xl font-display font-semibold text-white mb-2">
              Tell us about your card
            </h1>
            <p className="text-sm text-ink-400 mb-8">
              Enter the details so we can label your grading report correctly.
            </p>

            {infoError && (
              <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/30">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{infoError}</p>
              </div>
            )}

            <form onSubmit={handleInfoSubmit} className="flex flex-col gap-5">
              <div>
                <label className="label-field" htmlFor="cardName">Card Name *</label>
                <input
                  id="cardName"
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Charizard Base Set 4/102"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label-field" htmlFor="cardSet">Set / Series</label>
                  <input
                    id="cardSet"
                    type="text"
                    value={cardSet}
                    onChange={(e) => setCardSet(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Base Set, Scarlet & Violet"
                  />
                </div>
                <div>
                  <label className="label-field" htmlFor="cardYear">Year</label>
                  <input
                    id="cardYear"
                    type="text"
                    value={cardYear}
                    onChange={(e) => setCardYear(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 1999"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-gold-400/20 bg-gold-400/5">
                <Info size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-ink-300">
                  For best results, use well-lit, straight-on photos with no glare. Place the card
                  on a dark, flat surface and fill the frame.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-gold">
                  Continue to Upload
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: Image Upload */
          <div className="animate-fade-up">
            <div className="card-surface-elevated p-8 md:p-10 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-display font-semibold text-white mb-1">
                    Upload card images
                  </h1>
                  <p className="text-sm text-ink-400">
                    For: <span className="text-gold-300">{cardName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setStep('info')}
                  className="btn-ghost text-sm px-4 py-2"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>

              {error && (
                <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/30">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-6">
                {(['front', 'back', 'closeup'] as Slot[]).map((slot) => (
                  <ImageDropzone
                    key={slot}
                    slot={slot}
                    image={images[slot]}
                    onSelect={(file) => handleImageSelect(slot, file)}
                    onRemove={() => removeImage(slot)}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-500 flex items-center gap-2">
                <Info size={12} />
                Demo mode — results are simulated
              </p>
              <button
                onClick={handleSubmit}
                disabled={!images.front || uploading}
                className="btn-gold"
              >
                {uploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Start AI Analysis
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ImageDropzoneProps {
  slot: Slot;
  image: { file: File; url: string } | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

function ImageDropzone({ slot, image, onSelect, onRemove }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const config = SLOT_CONFIG[slot];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onSelect(file);
  };

  if (image) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-ink-600 bg-ink-900">
        <div className="flex items-stretch">
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 bg-ink-950">
            <img src={image.url} alt={config.label} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-display font-semibold text-white">{config.label}</h3>
                {config.required && (
                  <span className="text-[10px] uppercase tracking-wider text-gold-400 px-1.5 py-0.5 rounded border border-gold-400/30">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-400 truncate">{image.file.name}</p>
              <p className="text-xs text-ink-500 mt-1">
                {(image.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="text-xs text-gold-300 hover:text-gold-200 font-medium transition-colors"
              >
                Replace
              </button>
              <button
                onClick={onRemove}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Remove
              </button>
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 p-8 md:p-10 text-center ${
        dragging
          ? 'border-gold-400/60 bg-gold-400/5'
          : 'border-ink-600 hover:border-gold-400/30 hover:bg-ink-800/50'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl border border-ink-600 bg-ink-800 flex items-center justify-center">
          {config.required ? (
            <Upload size={20} className="text-gold-400" strokeWidth={1.5} />
          ) : (
            <ImageIcon size={20} className="text-ink-400" strokeWidth={1.5} />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{config.label}</p>
          <p className="text-xs text-ink-400 mt-1">{config.sublabel}</p>
        </div>
        <p className="text-xs text-ink-500">
          Click to browse or drag and drop • JPG, PNG up to 10MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
