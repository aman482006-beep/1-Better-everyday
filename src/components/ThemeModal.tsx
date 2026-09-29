import React from 'react';
import { Check, Moon, Palette, Sparkles, Sun, X } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import { THEMES, ThemeDefinition } from '../data/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useWorkout();

  if (!isOpen) return null;

  const currentThemeId = userProfile.activeThemeId || 'mono-oled';

  const handleSelectTheme = (theme: ThemeDefinition) => {
    updateUserProfile({
      activeThemeId: theme.id,
      themePreference: theme.isDark ? 'dark' : 'light',
      accentColor: theme.palette.accent,
    });
  };

  const isDarkMode = userProfile.themePreference === 'dark' || (!userProfile.themePreference && currentThemeId !== 'mono-paper');

  const handleQuickToggleMode = () => {
    if (isDarkMode) {
      // Switch to Minimal White Paper
      const paperTheme = THEMES.find((t) => t.id === 'mono-paper') || THEMES[1];
      handleSelectTheme(paperTheme);
    } else {
      // Switch to Minimal OLED Dark
      const oledTheme = THEMES.find((t) => t.id === 'mono-oled') || THEMES[0];
      handleSelectTheme(oledTheme);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-lg shadow-2xl flex flex-col my-auto max-h-[92vh] overflow-hidden text-main transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-subtle flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-sm"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              <Palette className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-main font-display leading-tight">
                Theme &amp; Appearance
              </h2>
              <div className="text-xs text-muted">Minimalist palettes &amp; high-contrast modes</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-surface-subtle border border-subtle flex items-center justify-center text-muted hover:text-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Black & White Toggle Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-surface border border-subtle flex items-center justify-center text-main">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-main">
                  {isDarkMode ? 'Monochrome OLED (Dark)' : 'Minimal Paper (Light)'}
                </div>
                <div className="text-[11px] text-muted">
                  Instant 1-tap black &amp; white switch
                </div>
              </div>
            </div>
            <button
              onClick={handleQuickToggleMode}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-elevated text-main border border-subtle shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>Switch to {isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          {/* Minimal Black & White Flagship Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-main" /> Minimal Black &amp; White
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-subtle border border-subtle font-semibold text-muted">
                Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.filter((t) => t.isMinimalMonochrome).map((theme) => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between active:scale-[0.98] ${
                      isSelected
                        ? 'border-main bg-surface-subtle shadow-md ring-1 ring-main'
                        : 'border-subtle bg-surface hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-main flex items-center gap-1.5">
                          <span>{theme.name}</span>
                          {theme.isDark ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-300 border border-neutral-700">
                              OLED
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-neutral-900 border border-neutral-300">
                              LIGHT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted line-clamp-1 mt-0.5">
                          {theme.description}
                        </div>
                      </div>

                      {/* Selection Badge */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-main text-surface border-main'
                            : 'border-subtle bg-surface-subtle text-transparent'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent)' : undefined,
                          color: isSelected ? 'var(--accent-text)' : undefined,
                        }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Palette Swatch Preview */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-subtle">
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs"
                        style={{ backgroundColor: theme.palette.bgApp, borderColor: theme.palette.borderSubtle }}
                        title="Background"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs"
                        style={{ backgroundColor: theme.palette.bgSurface, borderColor: theme.palette.borderStrong }}
                        title="Surface"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: theme.palette.accent, color: theme.palette.accentText, borderColor: theme.palette.borderSubtle }}
                        title="Accent"
                      >
                        Aa
                      </div>
                      <span className="text-[10px] font-mono-numbers text-muted ml-auto font-medium">
                        {theme.shortName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Theme Options Grid */}
          <div>
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">
              All Available Themes
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.filter((t) => !t.isMinimalMonochrome).map((theme) => {
                const isSelected = currentThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between active:scale-[0.98] ${
                      isSelected
                        ? 'border-main bg-surface-subtle shadow-md ring-1 ring-main'
                        : 'border-subtle bg-surface hover:bg-surface-subtle'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-xs font-bold text-main flex items-center gap-1.5">
                          <span>{theme.name}</span>
                          <span
                            className="w-2 h-2 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: theme.palette.accent }}
                          />
                        </div>
                        <div className="text-[10px] text-muted line-clamp-1 mt-0.5">
                          {theme.description}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-main text-surface border-main'
                            : 'border-subtle bg-surface-subtle text-transparent'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent)' : undefined,
                          color: isSelected ? 'var(--accent-text)' : undefined,
                        }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Palette Swatch Preview */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-subtle">
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs"
                        style={{ backgroundColor: theme.palette.bgApp, borderColor: theme.palette.borderSubtle }}
                        title="Background"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs"
                        style={{ backgroundColor: theme.palette.bgSurface, borderColor: theme.palette.borderStrong }}
                        title="Surface"
                      />
                      <div
                        className="w-5 h-5 rounded-lg border shadow-xs flex items-center justify-center text-[10px] font-bold"
                        style={{ backgroundColor: theme.palette.accent, color: theme.palette.accentText, borderColor: theme.palette.borderSubtle }}
                        title="Accent"
                      >
                        Aa
                      </div>
                      <span className="text-[10px] font-mono-numbers text-muted ml-auto font-medium">
                        {theme.shortName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hex Accent Color Option */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <input
                type="color"
                value={userProfile.accentColor || '#ffffff'}
                onChange={(e) => {
                  updateUserProfile({
                    accentColor: e.target.value,
                    activeThemeId: 'custom',
                  });
                }}
                className="w-8 h-8 rounded-xl border border-subtle bg-transparent cursor-pointer"
                title="Choose custom accent color"
              />
              <div>
                <div className="font-bold text-main">Custom Hex Accent</div>
                <div className="text-[10px] text-muted">Fine-tune button &amp; badge highlight</div>
              </div>
            </div>
            <span className="font-mono text-muted uppercase font-bold text-[11px] px-2 py-1 rounded bg-surface border border-subtle">
              {userProfile.accentColor || '#ffffff'}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-subtle bg-surface-subtle/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
