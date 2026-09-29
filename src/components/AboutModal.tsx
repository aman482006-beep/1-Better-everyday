import React from 'react';
import {
  ExternalLink,
  Github,
  Heart,
  Instagram,
  Linkedin,
  ShieldCheck,
  Smartphone,
  WifiOff,
  X,
  Youtube,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-md shadow-2xl p-6 overflow-hidden text-main max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-mono tracking-tighter shadow-sm"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              1%
            </div>
            <span className="font-display font-extrabold text-base text-main">About ONE PERCENT</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted hover:text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center font-mono font-black text-2xl shadow-md border border-subtle"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            1%
          </div>

          <div>
            <h2 className="font-display font-black text-2xl text-main tracking-tight">ONE PERCENT</h2>
            <p className="text-xs font-semibold text-muted mt-1">1% better every day.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-subtle border border-subtle text-left space-y-2">
            <div className="text-xs font-bold text-main">Built by Aman</div>
            <p className="text-xs text-secondary leading-relaxed">
              ONE PERCENT was built to make training progress simple, measurable, and consistent.
              Every rep, set, and incremental kilo compounds over time.
            </p>
          </div>

          {/* Creator Socials */}
          <div className="space-y-2 text-left">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Connect with Creator</div>
            <div className="grid grid-cols-1 gap-2">
              <a
                href="https://www.instagram.com/aman.ja1n/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-main group-hover:underline">Instagram</div>
                    <div className="text-[10px] text-muted">@aman.ja1n</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-main" />
              </a>

              <a
                href="https://www.youtube.com/channel/UCuE0oW8TukiUeWRwqyoRMLQ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-main group-hover:underline">YouTube</div>
                    <div className="text-[10px] text-muted">Aman on YouTube</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-main" />
              </a>

              <a
                href="https://www.linkedin.com/in/aman-malu-335769344"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-subtle hover:bg-surface border border-subtle text-xs font-bold text-main transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-main group-hover:underline">LinkedIn</div>
                    <div className="text-[10px] text-muted">Aman Malu</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-main" />
              </a>
            </div>
          </div>

          {/* Privacy & Offline Guarantee */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-main">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Offline-First &amp; Privacy Transparency</span>
            </div>
            <p className="text-[11px] text-secondary leading-relaxed">
              Your workout data is stored locally on your device. Works 100% offline with zero remote cloud dependency.
              You own your training data and can export backups anytime in JSON or CSV.
            </p>
          </div>

          {/* App Metadata */}
          <div className="pt-2 border-t border-subtle flex items-center justify-between text-[11px] text-muted font-mono-numbers">
            <span>Version 2.4.0 (Production)</span>
            <span>Build #2026.09.RELEASE</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
