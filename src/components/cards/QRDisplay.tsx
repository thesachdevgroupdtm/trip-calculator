'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Upload, Smartphone } from 'lucide-react';
import { useRef } from 'react';
import { useTripStore } from '@/store/useTripStore';
import toast from 'react-hot-toast';

interface QRDisplayProps {
  amount?: number;
  payeeUpi?: string;
}

export function QRDisplay({ amount, payeeUpi = 'ganeshkumargupta1988@okhdfcbank' }: QRDisplayProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrImage = useTripStore((s) => s.settings.qrImage);
  const setQrImage = useTripStore((s) => s.setQrImage);
  const tripTitle = useTripStore((s) => s.settings.tripTitle);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(payeeUpi)}&pn=${encodeURIComponent(
    tripTitle
  )}${amount ? `&am=${amount}` : ''}&cu=INR`;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setQrImage(reader.result as string);
      toast.success('QR code updated');
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="premium-card p-6 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-aurora opacity-50 pointer-events-none" />

      <div className="relative">
        <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Accepting Payments
        </div>

        <h3 className="text-lg font-semibold mb-1">Scan to Pay</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Any UPI app · Instant transfer
        </p>

        <div className="relative inline-block">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />

          <div className="bg-white p-4 rounded-2xl">
            {qrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImage}
                alt="UPI QR"
                className="w-44 h-44 object-contain mx-auto"
              />
            ) : (
              <QRCodeSVG
                value={upiUrl}
                size={176}
                level="H"
                includeMargin={false}
                fgColor="#0A0E1C"
              />
            )}
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Smartphone className="w-3 h-3" />
          <span>{payeeUpi}</span>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
        >
          <Upload className="w-3 h-3" />
          {qrImage ? 'Change QR image' : 'Upload custom QR'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    </motion.div>
  );
}
