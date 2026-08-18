/**
 * @file ConverterArea.tsx
 * @description Dual-Textarea Converter with Windows/Mac Platform Selection, Quick Try Chips, and Immersive Glassmorphism Design.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as tauriEvent from '@tauri-apps/api/event';
import * as tauriCore from '@tauri-apps/api/core';
import * as tauriClipboard from '@tauri-apps/plugin-clipboard-manager';
import { UILanguage } from '../types';
import { KeyboardPlatform } from '../core/keyboard';
import { translations } from '../i18n/translations';
import { convertKeyboardLayout } from "../core/keyboard";
import {
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Monitor,
  Laptop,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  CornerDownLeft
} from 'lucide-react';

interface ConverterAreaProps {
  lang: UILanguage;
  isDesktop?: boolean;
}

export const ConverterArea: React.FC<ConverterAreaProps> = ({ lang, isDesktop = false }) => {
  const t = translations[lang].converter;
  const quickExamples = translations[lang].quickExamples;
  const isRTL = lang === 'ar';

  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [conversionMode, setConversionMode] = useState<'auto' | 'en2ar' | 'ar2en'>('auto');
  const [keyboardPlatform, setKeyboardPlatform] = useState<KeyboardPlatform>('mac');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [stats, setStats] = useState({ charCount: 0, wordCount: 0, changedCount: 0 });
  const [workflowState, setWorkflowState] = useState<'idle' | 'resultReady'>('idle');
  const [showGlow, setShowGlow] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const stateRef = useRef({
    workflowState,
    outputText,
    conversionMode,
    keyboardPlatform,
    isProcessingShortcut: false,
  });
  useEffect(() => {
    stateRef.current.workflowState = workflowState;
    stateRef.current.outputText = outputText;
    stateRef.current.conversionMode = conversionMode;
    stateRef.current.keyboardPlatform = keyboardPlatform;
  }, [workflowState, outputText, conversionMode, keyboardPlatform]);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

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
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.value = 1.5;

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const playSwapSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  useEffect(() => {
    const result = convertKeyboardLayout(inputText, {
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
    setWorkflowState('idle');
    if (e.target.value.length >= inputText.length) {
      playClickSound();
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInputText('');
    setWorkflowState('idle');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSwap = useCallback(() => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    setInputText(outputText);
    setOutputText(inputText);
    if (soundEnabled) playSwapSound();
  }, [inputText, outputText, soundEnabled]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleCopy();
    }
  };

  const handlePresetClick = (presetText: string) => {
    setInputText(presetText);
    playClickSound();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Listen for Tauri app reopen (desktop)
  useEffect(() => {
    if (!isDesktop) return;
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    const setupListener = async () => {
      try {
        if (!isMounted) return;
        unlisten = await tauriEvent.listen('tauri://focus', () => {
          if (inputRef.current && inputText.length > 0) {
             inputRef.current.select();
          } else if (inputRef.current) {
             inputRef.current.focus();
          }
        });
      } catch (err) {
        console.error("Focus listener setup failed:", err);
      }
    };
    setupListener();
    return () => { 
      isMounted = false;
      if (unlisten) {
        try { 
          const res = unlisten() as any;
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      } 
    };
  }, [isDesktop, inputText]);

  // Listen for global shortcut (desktop)
  useEffect(() => {
    if (!isDesktop) return;
    let unlisten: (() => void) | undefined;
    let isMounted = true;
    const setupShortcutListener = async () => {
      try {
        if (!isMounted) return;
        
        unlisten = await tauriEvent.listen('shortcut-pressed', async () => {
          if (stateRef.current.isProcessingShortcut) return;
          stateRef.current.isProcessingShortcut = true;
          
          try {
            if (stateRef.current.workflowState === 'idle') {
              let clipboardText = '';
              try {
                clipboardText = await tauriClipboard.readText() || '';
              } catch (err) {}
              
              if (clipboardText && clipboardText.trim().length > 0) {
                const result = convertKeyboardLayout(clipboardText, {
                  mode: stateRef.current.conversionMode,
                  platform: stateRef.current.keyboardPlatform,
                });
                
                setInputText(clipboardText);
                setOutputText(result.fixedText);
                setWorkflowState('resultReady');
                
                stateRef.current.outputText = result.fixedText;
                stateRef.current.workflowState = 'resultReady';
                
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.setSelectionRange(clipboardText.length, clipboardText.length);
                }
              } else {
                if (inputRef.current) inputRef.current.focus();
              }
            } else if (stateRef.current.workflowState === 'resultReady') {
              if (stateRef.current.outputText) {
                let writeSuccess = false;
                try {
                  await tauriClipboard.writeText(stateRef.current.outputText);
                  writeSuccess = true;
                } catch (err) {}
                
                if (writeSuccess) {
                  setCopied(true);
                  setShowGlow(true);
                  
                  setTimeout(() => {
                    setCopied(false);
                    setShowGlow(false);
                    setInputText('');
                    setOutputText('');
                    setWorkflowState('idle');
                    stateRef.current.workflowState = 'idle';
                    stateRef.current.outputText = '';
                    tauriCore.invoke('hide_window').catch(() => {});
                  }, 350);
                }
              }
            }
          } catch (err) {
            console.error("Failed to process shortcut", err);
          } finally {
            stateRef.current.isProcessingShortcut = false;
          }
        });
      } catch (err) {
        console.error("Shortcut listener setup failed:", err);
      }
    };
    
    setupShortcutListener();
    return () => { 
      isMounted = false;
      if (unlisten) {
        try { 
          const res = unlisten() as any;
          if (res && res.catch) res.catch(() => {});
        } catch (e) {}
      } 
    };
  }, [isDesktop]);

  return (
    <div id="converter" className={`w-full max-w-5xl mx-auto flex flex-col gap-5 relative z-10 transition-all duration-300 ${showGlow ? 'shadow-[0_0_30px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/50' : ''}`}>
      
      {/* Quick Try Preset Chips */}
      <div className="flex items-center flex-wrap gap-2 px-1">
        <span className="text-[12px] font-semibold text-slate-400 flex items-center gap-1.5 shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ar' ? 'تجربة سريعة:' : 'Quick Try:'}</span>
        </span>
        <div className="flex items-center flex-wrap gap-1.5">
          {quickExamples.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(ex.text)}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-[11px] font-mono text-slate-300 hover:text-amber-300 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glassmorphic Converter Container */}
      <div className="w-full rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-4 sm:p-6 flex flex-col gap-4">
        
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 pb-3 border-b border-white/[0.06]">
          
          {/* Platform & Mode Selectors */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
            
            {/* Keyboard Platform Toggle */}
            <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setKeyboardPlatform('mac')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  keyboardPlatform === 'mac'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Apple Mac Layout"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>{t.macPlatform}</span>
              </button>
              <button
                type="button"
                onClick={() => setKeyboardPlatform('windows')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  keyboardPlatform === 'windows'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Windows PC Layout"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>{t.windowsPlatform}</span>
              </button>
            </div>

            <div className="hidden md:block w-px h-6 bg-white/10 shrink-0" />

            {/* Mode Selector */}
            <div className="flex bg-black/40 border border-white/10 rounded-2xl p-1 shrink-0 shadow-inner">
              {(['auto', 'en2ar', 'ar2en'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setConversionMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    conversionMode === mode
                      ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode === 'auto' ? t.autoMode : mode === 'en2ar' ? t.enToArMode : t.arToEnMode}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Swap Utilities */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={t.soundEffects}
              className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-black/30 text-slate-500 hover:text-slate-300 border border-white/10'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Dual Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          
          {/* Center Swap Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex">
            <button
              type="button"
              onClick={handleSwap}
              title={t.swap}
              className="w-12 h-12 rounded-full bg-[#141414] hover:bg-amber-500 border border-white/15 hover:border-amber-400 text-slate-300 hover:text-black shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
            >
              <ArrowRightLeft className={`w-5 h-5 transition-transform duration-300 ${isSwapping ? 'rotate-180 text-black' : 'group-hover:rotate-180'}`} />
            </button>
          </div>

          {/* Left / Top: Input Text Box */}
          <div className="flex flex-col rounded-2xl bg-black/40 border border-white/10 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all overflow-hidden shadow-inner min-h-[220px] sm:min-h-[260px]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                {t.inputLabel}
              </span>
              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 transition-colors"
                    title={t.clear}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <textarea
              ref={inputRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={t.inputPlaceholder + (lang === 'ar' ? '\n\nمثال:\nsmnd] pn]' : '\n\nExample:\nhggi fhgufd')}
              className="w-full flex-1 p-4 bg-transparent text-white placeholder-slate-500 resize-none outline-none text-base sm:text-lg leading-relaxed font-mono"
              dir="auto"
              spellCheck="false"
            />
          </div>

          {/* Mobile Swap Button */}
          <div className="flex lg:hidden justify-center -my-2 relative z-20">
            <button
              type="button"
              onClick={handleSwap}
              title={t.swap}
              className="w-10 h-10 rounded-full bg-[#141414] hover:bg-amber-500 border border-white/15 hover:border-amber-400 text-slate-300 hover:text-black shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <ArrowRightLeft className={`w-4 h-4 transition-transform duration-300 ${isSwapping ? 'rotate-90 text-black' : 'rotate-90 group-hover:rotate-[270deg]'}`} />
            </button>
          </div>

          {/* Right / Bottom: Output Result Box */}
          <div className="flex flex-col rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 focus-within:border-amber-500/60 transition-all overflow-hidden shadow-inner min-h-[220px] sm:min-h-[260px]">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/15 bg-amber-500/[0.03]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  {t.outputLabel}
                </span>
                {stats.changedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {stats.changedCount} {t.fixed}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!outputText}
                title={t.shortcutsHint}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 text-black shadow-md'
                    : outputText
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md hover:shadow-amber-500/20 hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copy}</span>
              </button>
            </div>

            <textarea
              value={outputText}
              readOnly
              placeholder={t.outputPlaceholder}
              className="w-full flex-1 p-4 bg-transparent text-amber-100 placeholder-amber-900/40 resize-none outline-none text-base sm:text-lg leading-relaxed font-mono font-medium"
              dir="auto"
            />
          </div>

        </div>

        {/* Live Conversion Status Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-sans font-medium">{t.latency}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>{stats.charCount} {t.chars}</span>
            <span className="opacity-30">•</span>
            <span>{stats.wordCount} {t.words}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
