import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ASSETS } from '../data/bnccData';

interface InitialSiteLoaderProps {
  onComplete: () => void;
}

export const InitialSiteLoader: React.FC<InitialSiteLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'finishing' | 'done'>('loading');
  const [logoSrc, setLogoSrc] = useState<string>(ASSETS.bnccLogo || '/assets/bncc_logo.png');

  useEffect(() => {
    // Hard maximum safety timeout: Never block screen longer than 2.5 seconds
    const maxSafetyTimeout = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2500);

    // Smooth progress simulation over 1.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('finishing');
          return 100;
        }
        // Quadratic easing speedups as it completes
        const increment = Math.max(2.5, (100 - prev) * 0.16);
        return Math.min(100, prev + increment);
      });
    }, 40);

    return () => {
      clearInterval(interval);
      clearTimeout(maxSafetyTimeout);
    };
  }, [onComplete]);

  useEffect(() => {
    if (phase === 'finishing') {
      const timeout = setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 400); // Wait for fade out
      return () => clearTimeout(timeout);
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'finishing' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fcf9f3] text-[#1c1c18] select-none pointer-events-auto"
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(238, 220, 130, 0.08) 0%, rgba(252, 249, 243, 0) 70%)',
      }}
    >
      {/* Decorative Traditional Corner Accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#cdc6b3]/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#cdc6b3]/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#cdc6b3]/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#cdc6b3]/40" />

      <div className="max-w-md w-full px-8 text-center space-y-7 flex flex-col items-center">
        {/* Animated Main BNCC Emblem Container with Spinning Logo */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-36 h-36"
        >
          {/* Outer glowing halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-yellow-300/15 to-emerald-500/10 blur-md animate-pulse" />

          {/* Outer elegant tactical spinning ring (clockwise) */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#cfae4c]/50 animate-[spin_12s_linear_infinite]" />

          {/* Inner counter-rotating thin reticle ring (counter-clockwise) */}
          <div className="absolute inset-2 rounded-full border border-dotted border-[#6b5e10]/30 animate-[spin_8s_linear_infinite_reverse]" />

          {/* Center Spinning BNCC Logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: 'linear',
            }}
            className="relative flex items-center justify-center w-24 h-24 rounded-full bg-white/90 p-1.5 shadow-md border border-[#cdc6b3]/60 backdrop-blur-xs"
          >
            <img
              src={logoSrc}
              alt="BNCC Emblem"
              className="w-full h-full object-contain select-none drop-shadow-xs"
              referrerPolicy="no-referrer"
              onError={() => {
                setLogoSrc((prev) => (prev !== '/assets/bncc_logo.png' ? '/assets/bncc_logo.png' : '/favicon.png'));
              }}
            />
          </motion.div>
        </motion.div>

        {/* Textual Branding */}
        <div className="space-y-2">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] tracking-[0.28em] font-extrabold uppercase text-[#6b5e10] font-mono"
          >
            Bangladesh National Cadet Corps
          </motion.div>
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c1c18]"
          >
            NGDC Platoon Portal
          </motion.h1>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs text-[#695c4e] font-serif tracking-wide italic"
          >
            Knowledge & Discipline • জ্ঞান ও শৃঙ্খলা
          </motion.p>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-64 space-y-2">
          <div className="h-[3px] w-full bg-[#ede3d1] dark:bg-[#2c2921] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#eedc82] via-[#cfae4c] to-[#6b5e10]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-[#8c826e] font-mono tracking-widest uppercase">
            <span>Loading Portal</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPhase('done');
            onComplete();
          }}
          className="text-[11px] text-[#7c7767] hover:text-[#1c1c18] font-medium transition-colors pt-1 cursor-pointer underline underline-offset-4 opacity-80 hover:opacity-100"
        >
          Skip to Portal ➔
        </button>
      </div>
    </motion.div>
  );
};
