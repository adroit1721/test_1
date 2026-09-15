import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles } from 'lucide-react';

interface InitialSiteLoaderProps {
  onComplete: () => void;
}

export const InitialSiteLoader: React.FC<InitialSiteLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'finishing' | 'done'>('loading');

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
        backgroundImage: 'radial-gradient(circle at center, rgba(238, 220, 130, 0.04) 0%, rgba(252, 249, 243, 0) 70%)',
      }}
    >
      {/* Decorative Traditional Japanese Corner Accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#cdc6b3]/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-[#cdc6b3]/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-[#cdc6b3]/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#cdc6b3]/40" />

      <div className="max-w-md w-full px-8 text-center space-y-8 flex flex-col items-center">
        {/* Animated Main Platoon Emblem Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-28 h-28 rounded-full bg-[#f6f3ed] border border-[#cdc6b3]/60 shadow-xs"
        >
          {/* Outer elegant spinning border */}
          <div className="absolute inset-0.5 rounded-full border border-dashed border-[#eedc82] animate-[spin_40s_linear_infinite]" />
          
          <div className="relative p-5 text-[#6b5e10]">
            <Shield className="w-14 h-14 stroke-[1.25]" />
            <Sparkles className="w-4 h-4 absolute top-4 right-4 text-[#eedc82] animate-pulse" />
          </div>
        </motion.div>

        {/* Textual Branding */}
        <div className="space-y-2.5">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] tracking-[0.25em] font-extrabold uppercase text-[#6b5e10] font-mono"
          >
            Bangladesh National Cadet Corps
          </motion.div>
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-3xl font-bold tracking-tight text-[#1c1c18]"
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
          <div className="h-[2px] w-full bg-[#ede3d1] dark:bg-[#2c2921] rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#eedc82] to-[#cfae4c]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold text-[#8c826e] font-mono tracking-widest uppercase">
            <span>Synchronizing</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setPhase('done');
            onComplete();
          }}
          className="text-[11px] text-[#7c7767] hover:text-[#1c1c18] font-medium transition-colors pt-2 cursor-pointer underline underline-offset-4 opacity-75 hover:opacity-100"
        >
          Skip to Portal ➔
        </button>
      </div>
    </motion.div>
  );
};
