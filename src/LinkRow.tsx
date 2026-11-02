import { useEffect, useRef, useState } from 'react';
import type { ProfileLink } from './content';

const COPIED_MS = 2000;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API can be unavailable (older browsers, insecure origins); fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

function CopyIcon({ done }: { done: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {done ? (
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <rect x="8" y="8" width="12" height="12" rx="1.5" />
          <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
        </>
      )}
    </svg>
  );
}

export function LinkRow({ link }: { link: ProfileLink }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if ('href' in link) {
    return (
      <a className="link" href={link.href} target="_blank" rel="noopener noreferrer">
        <span className="link__label">{link.label}</span>
        <span className="link__detail">{link.detail}</span>
        <span className="link__icon" aria-hidden="true">
          ↗
        </span>
      </a>
    );
  }

  const onCopy = async () => {
    if (!(await copyText(link.copy))) return;
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <button type="button" className="link" onClick={onCopy} aria-label={`Copy ${link.label.toLowerCase()} address ${link.copy}`}>
      <span className="link__label">{link.label}</span>
      <span className="link__detail">{copied ? 'Copied to clipboard' : link.detail}</span>
      <span className={`link__icon${copied ? ' link__icon--done' : ''}`}>
        <CopyIcon done={copied} />
      </span>
      <span className="visually-hidden" role="status">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
