import React, { useState, useMemo, useCallback } from 'react';
import { LegalDocId, LEGAL_DOCUMENTS } from '../legal/legalContent';
import { X, ExternalLink, ShieldCheck, FileText, CreditCard, Scale, KeyRound, Globe } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

export interface LegalViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocId;
  lang: 'en' | 'ar' | 'de';
  isDark?: boolean;
}

function openExternalLink(url: string) {
  // If Tauri open_url command exists, use it, else fallback to window.open
  invoke('open_url', { url }).catch(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

function renderSimpleMarkdown(content: string, isRTL: boolean, onLinkClick: (url: string) => void) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      elements.push(<div key={i} style={{ height: 10 }} />);
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} style={{ fontSize: 20, fontWeight: 800, margin: '14px 0 8px', letterSpacing: '-0.02em' }}>
          {line.replace('# ', '')}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} style={{ fontSize: 16, fontWeight: 700, margin: '18px 0 6px', color: '#F59E0B' }}>
          {line.replace('## ', '')}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: 14, fontWeight: 700, margin: '12px 0 4px' }}>
          {line.replace('### ', '')}
        </h3>
      );
      continue;
    }

    if (line.startsWith('---')) {
      elements.push(
        <hr key={i} style={{ border: 0, height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
      );
      continue;
    }

    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={i}
          style={{
            margin: '10px 0',
            padding: '8px 12px',
            borderLeft: isRTL ? 'none' : '3px solid #F59E0B',
            borderRight: isRTL ? '3px solid #F59E0B' : 'none',
            background: 'rgba(245, 158, 11, 0.08)',
            borderRadius: 6,
            fontSize: 12.5,
            fontStyle: 'italic',
          }}
        >
          {line.replace('> ', '')}
        </blockquote>
      );
      continue;
    }

    // List items
    const isBullet = line.startsWith('- ') || line.startsWith('• ');
    const isNum = /^\d+\.\s/.test(line);

    // Format text with inline links and code
    const formatted = parseInlineFormatting(rawLine.replace(/^[-•]\s|^\d+\.\s/, ''), onLinkClick);

    if (isBullet || isNum) {
      elements.push(
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 8,
            margin: '4px 0',
            paddingLeft: isRTL ? 0 : 8,
            paddingRight: isRTL ? 8 : 0,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>{isBullet ? '•' : line.match(/^\d+\./)?.[0]}</span>
          <div style={{ flex: 1 }}>{formatted}</div>
        </div>
      );
    } else {
      elements.push(
        <p key={i} style={{ margin: '4px 0', fontSize: 13, lineHeight: 1.65 }}>
          {parseInlineFormatting(rawLine, onLinkClick)}
        </p>
      );
    }
  }

  return elements;
}

function parseInlineFormatting(text: string, onLinkClick: (url: string) => void): React.ReactNode {
  // Regex to match markdown links [text](url), standard URLs, and inline code `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Markdown link [Title](url)
    const mdLinkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/);
    // Raw URL
    const rawUrlMatch = remaining.match(/(https?:\/\/[^\s<]+)/);
    // Inline bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    // Inline code `code`
    const codeMatch = remaining.match(/`([^`]+)`/);

    const matches = [
      mdLinkMatch ? { type: 'mdLink', index: mdLinkMatch.index!, match: mdLinkMatch } : null,
      rawUrlMatch ? { type: 'rawUrl', index: rawUrlMatch.index!, match: rawUrlMatch } : null,
      boldMatch ? { type: 'bold', index: boldMatch.index!, match: boldMatch } : null,
      codeMatch ? { type: 'code', index: codeMatch.index!, match: codeMatch } : null,
    ]
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0];
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index));
    }

    if (first.type === 'mdLink') {
      const label = first.match[1];
      const url = first.match[2];
      parts.push(
        <a
          key={keyIdx++}
          href={url}
          onClick={(e) => {
            e.preventDefault();
            onLinkClick(url);
          }}
          style={{ color: '#F59E0B', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
        >
          {label} <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </a>
      );
      remaining = remaining.substring(first.index + first.match[0].length);
    } else if (first.type === 'rawUrl') {
      const url = first.match[1];
      parts.push(
        <a
          key={keyIdx++}
          href={url}
          onClick={(e) => {
            e.preventDefault();
            onLinkClick(url);
          }}
          style={{ color: '#F59E0B', textDecoration: 'underline', cursor: 'pointer', overflowWrap: 'anywhere' }}
        >
          {url} <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </a>
      );
      remaining = remaining.substring(first.index + first.match[0].length);
    } else if (first.type === 'bold') {
      parts.push(
        <strong key={keyIdx++} style={{ fontWeight: 700, color: 'inherit' }}>
          {first.match[1]}
        </strong>
      );
      remaining = remaining.substring(first.index + first.match[0].length);
    } else if (first.type === 'code') {
      parts.push(
        <code
          key={keyIdx++}
          style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '2px 5px',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: '"SF Mono", Menlo, monospace',
            color: '#F59E0B',
          }}
        >
          {first.match[1]}
        </code>
      );
      remaining = remaining.substring(first.index + first.match[0].length);
    }
  }

  return parts;
}

export function LegalViewerModal({ isOpen, onClose, initialDoc = 'privacy', lang, isDark = true }: LegalViewerModalProps) {
  const isRTL = lang === 'ar';
  const [selectedDocId, setSelectedDocId] = useState<LegalDocId>(initialDoc);
  const [showImpressumEnInAr, setShowImpressumEnInAr] = useState(false);

  // Sync initialDoc when modal opens
  React.useEffect(() => {
    if (isOpen && initialDoc) {
      setSelectedDocId(initialDoc);
      setShowImpressumEnInAr(false);
    }
  }, [isOpen, initialDoc]);

  const docList: Array<{ id: LegalDocId; title: string; icon: React.ReactNode }> = useMemo(() => [
    {
      id: 'privacy',
      title: lang === 'ar' ? 'سياسة الخصوصية' : (lang === 'de' ? 'Datenschutz' : 'Privacy Policy'),
      icon: <ShieldCheck size={14} />,
    },
    {
      id: 'terms',
      title: lang === 'ar' ? 'شروط الاستخدام' : (lang === 'de' ? 'Bedingungen' : 'Terms of Use'),
      icon: <Scale size={14} />,
    },
    {
      id: 'purchase-refund',
      title: lang === 'ar' ? 'سياسة الشراء والاسترجاع' : (lang === 'de' ? 'Kauf & Erstattung' : 'Purchase & Refund'),
      icon: <CreditCard size={14} />,
    },
    {
      id: 'impressum',
      title: lang === 'ar' ? 'المعلومات القانونية' : (lang === 'de' ? 'Impressum' : 'Legal Notice'),
      icon: <FileText size={14} />,
    },
    {
      id: 'accessibility',
      title: lang === 'ar' ? 'الأذونات والخدمات' : (lang === 'de' ? 'Berechtigungen' : 'Permissions & Services'),
      icon: <KeyRound size={14} />,
    },
  ], [lang]);

  const activeDoc = LEGAL_DOCUMENTS[selectedDocId];

  const activeContent = useMemo(() => {
    if (!activeDoc) return '';
    if (selectedDocId === 'impressum') {
      if (lang === 'de') return activeDoc.contentDe || activeDoc.contentEn;
      if (lang === 'ar') {
        return showImpressumEnInAr ? activeDoc.contentEn : (activeDoc.contentDe || activeDoc.contentEn);
      }
      return activeDoc.contentEn;
    }
    if (lang === 'de') return activeDoc.contentDe || activeDoc.contentEn;
    if (lang === 'ar') return activeDoc.contentAr;
    return activeDoc.contentEn;
  }, [activeDoc, selectedDocId, lang, showImpressumEnInAr]);

  if (!isOpen) return null;

  const bgModal = isDark ? '#1C1C1E' : '#FFFFFF';
  const textPrimary = isDark ? '#F5F5F7' : '#1D1D1F';
  const textMuted = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const borderCol = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tabBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const tabActiveBg = isDark ? 'rgba(245,158,11,0.18)' : 'rgba(217,119,6,0.12)';

  return (
    <div
      className="kf-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className="kf-modal-card"
        style={{
          width: 'min(780px, 96vw)',
          height: 'min(640px, 90vh)',
          background: bgModal,
          color: textPrimary,
          borderRadius: 16,
          border: `1px solid ${borderCol}`,
          boxShadow: '0 28px 90px rgba(0,0,0,0.65), 0 0 40px rgba(245,158,11,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${borderCol}`,
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
              {isRTL ? 'القانونية' : 'Legal'}
            </span>
            <span style={{ color: textMuted, fontSize: 13 }}>• KeyFixer</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 8,
              border: 0,
              background: tabBg,
              color: textPrimary,
              cursor: 'pointer',
            }}
            title={isRTL ? 'إغلاق' : 'Close'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '10px 16px',
            borderBottom: `1px solid ${borderCol}`,
            overflowX: 'auto',
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            flexShrink: 0,
          }}
        >
          {docList.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocId(doc.id);
                  setShowImpressumEnInAr(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#F59E0B' : textMuted,
                  background: isSelected ? tabActiveBg : 'transparent',
                  border: isSelected ? '1px solid rgba(245,158,11,0.35)' : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {doc.icon}
                <span>{doc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewer */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            userSelect: 'text',
          }}
        >
          {/* Toggle for Impressum English version in Arabic mode */}
          {selectedDocId === 'impressum' && isRTL && (
            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={() => setShowImpressumEnInAr(!showImpressumEnInAr)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${borderCol}`,
                  background: tabBg,
                  color: textMuted,
                  fontSize: 11.5,
                  cursor: 'pointer',
                }}
              >
                <Globe size={12} />
                <span>{showImpressumEnInAr ? 'عرض النص الألماني القانوني (German version)' : 'English version'}</span>
              </button>
            </div>
          )}

          {renderSimpleMarkdown(activeContent, isRTL, openExternalLink)}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderTop: `1px solid ${borderCol}`,
            fontSize: 11.5,
            color: textMuted,
            background: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
          }}
        >
          <span>KeyFixer • Obada Dallo</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '5px 16px',
              borderRadius: 6,
              border: 0,
              background: '#F59E0B',
              color: '#000000',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {isRTL ? 'إغلاق' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
