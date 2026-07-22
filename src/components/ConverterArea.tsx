/**
 * @file ConverterArea.tsx
 * @description Dual-Textarea Converter with Windows/Mac Platform Selection. Immersive dark theme.
 */

import React, { useState, useEffect } from 'react';
import { UILanguage, KeyboardPlatform } from '../types';
import { translations } from '../i18n/translations';
import { fixKeyboardLayoutUseCase } from '../core/use-cases/FixKeyboardLayoutUseCase';
import {
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Monitor,
  Laptop,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ConverterAreaProps {
  lang: UILanguage;
}

export const ConverterArea: React.FC<ConverterAreaProps> = ({ lang }) => {
  const t = translations[lang].converter;

  const [inputText, setInputText] = useState<string>('smnd] pn]');
  const [outputText, setOutputText] = useState<string>('سورية حرة');
  const [conversionMode, setConversionMode] = useState<'auto' | 'en2ar' | 'ar2en'>('auto');
  const [keyboardPlatform, setKeyboardPlatform] = useState<KeyboardPlatform>('mac');
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [stats, setStats] = useState({ charCount: 9, wordCount: 2, changedCount: 9 });
  
  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  useEffect(() => {
    const result = fixKeyboardLayoutUseCase.execute(inputText, {
      mode: conversionMode,
      platform: keyboardPlatform,
    });
    setOutputText(result.fixedText);
    setStats({
      charCount: result.charCount,
      wordCount: result.wordCount,
      changedCount: result.changedCharCount,
    });
  }, [inputText, conversionMode, keyboardPlatform]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // If text length increased, it means a key was pressed (simplistic check)
    if (e.target.value.length >= inputText.length) {
      playClickSound();
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleSwap = () => {
    setInputText(outputText);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 relative z-10">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
        
        {/* Platform Selection */}
        <div className="flex bg-black/40 rounded-xl p-1 w-full md:w-auto">
          <button
            onClick={() => setKeyboardPlatform('windows')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              keyboardPlatform === 'windows'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{t.windowsPlatform}</span>
          </button>
          <button
            onClick={() => setKeyboardPlatform('mac')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              keyboardPlatform === 'mac'
                ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>{t.macPlatform}</span>
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex bg-black/40 rounded-xl p-1 w-full md:w-auto">
          {(['auto', 'en2ar', 'ar2en'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setConversionMode(mode)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                conversionMode === mode
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {mode === 'auto' ? t.autoMode : mode === 'en2ar' ? t.enToArMode : t.arToEnMode}
            </button>
          ))}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={t.soundEffects}
          className={`flex items-center justify-center p-3 rounded-xl transition-all ${
            soundEnabled
              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
              : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 relative">
        {/* Swap Button inside Editor */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handleSwap}
            title={t.swap}
            className="w-14 h-14 bg-[#0a0a0a] rounded-full flex items-center justify-center text-slate-400 hover:text-amber-500 border border-white/10 shadow-2xl transition-all hover:scale-105"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Input Textarea */}
        <div className="flex flex-col rounded-3xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Input</h2>
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400 transition-colors"
              title={t.clear}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            placeholder={t.inputPlaceholder}
            className="w-full h-[320px] p-6 bg-transparent text-white placeholder-slate-600 resize-none outline-none text-xl leading-relaxed font-mono"
            dir="auto"
          />
        </div>

        {/* Output Textarea */}
        <div className="flex flex-col rounded-3xl bg-amber-500/5 border border-amber-500/20 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/10 bg-black/20">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-amber-500 uppercase tracking-wider">Output</h2>
              {stats.changedCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 uppercase tracking-wider">
                  {stats.changedCount} {t.fixed}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
          <textarea
            value={outputText}
            readOnly
            placeholder={t.outputPlaceholder}
            className="w-full h-[320px] p-6 bg-transparent text-amber-50 placeholder-amber-900/50 resize-none outline-none text-xl leading-relaxed font-mono"
            dir="auto"
          />
        </div>
      </div>

      {/* Simple Stats Footer */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-medium pt-4">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          {t.latency}
        </span>
        <span className="opacity-30">•</span>
        <span>{stats.charCount} {t.chars}</span>
        <span className="opacity-30">•</span>
        <span>{stats.wordCount} {t.words}</span>
      </div>
    </div>
  );
}
