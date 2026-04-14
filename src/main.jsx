import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  User, Briefcase, Phone, Globe, Linkedin, Instagram, Image as ImageIcon,
  Copy, HelpCircle, Sun, Moon, Check, Mail, Zap, ShieldCheck,
  Layout, MousePointer2, Heart, Palette
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'signy.form-data';
const THEME_STORAGE_KEY = 'signy.preview-theme';
const TEMPLATE_STORAGE_KEY = 'signy.signature-template';
const ACCENT_STORAGE_KEY = 'signy.accent-color';

// ---------------------------------------------------------------------------
// Default form data
// ---------------------------------------------------------------------------
const DEFAULT_FORM_DATA = {
  name: 'John Doe',
  title: 'Accompagnement opérationnel & Stratégique',
  phone: '+33 6 00 00 00 00',
  website: 'votre-site.fr',
  linkedin: 'linkedin.com/in/votreprofil',
  instagram: '',
  company: 'Mon Entreprise',
  logoUrl: '',
  newsletterUrl: 'https://newsletter.votre-site.fr',
  availabilityText: 'Je réponds en général sous 48h par mail. Si c\'est urgent, je suis plus réactif par SMS ou appel direct.',
  ctaText: '1 fois par mois, découvrez les ressources provenant de ma veille & explorations, gratuitement.'
};

// ---------------------------------------------------------------------------
// 6 templates – from ultra-minimal to aesthetic
// ---------------------------------------------------------------------------
const TEMPLATE_OPTIONS = {
  classic: { label: 'Classique', description: 'Équilibré, lisible, passe-partout.' },
  minimal: { label: 'Minimale', description: 'L\'essentiel, rien de plus.' },
  compact: { label: 'Compacte', description: 'Dense, optimisé pour Outlook.' },
  elegant: { label: 'Élégante', description: 'Typographique, raffinée.' },
  bold: { label: 'Impact', description: 'Noms et titres affirmés.' },
  editorial: { label: 'Éditoriale', description: 'Accent visuel marqué.' }
};

// ---------------------------------------------------------------------------
// 7 accent colour presets – WCAG AA safe on white AND on #0f172a
// ---------------------------------------------------------------------------
const ACCENT_COLORS = {
  amber:   { label: 'Ambre',    light: '#92400e', dark: '#fbbf24', lightBg: '#fffbeb', lightBorder: '#fcd34d', darkBg: '#2b1a10', darkBorder: '#92400e' },
  blue:    { label: 'Bleu',     light: '#1e40af', dark: '#60a5fa', lightBg: '#eff6ff', lightBorder: '#93c5fd', darkBg: '#0c1a33', darkBorder: '#1e40af' },
  emerald: { label: 'Émeraude', light: '#065f46', dark: '#34d399', lightBg: '#ecfdf5', lightBorder: '#6ee7b7', darkBg: '#0a1f17', darkBorder: '#065f46' },
  rose:    { label: 'Rose',     light: '#9f1239', dark: '#fb7185', lightBg: '#fff1f2', lightBorder: '#fda4af', darkBg: '#2a0a14', darkBorder: '#9f1239' },
  violet:  { label: 'Violet',   light: '#5b21b6', dark: '#a78bfa', lightBg: '#f5f3ff', lightBorder: '#c4b5fd', darkBg: '#1a0d33', darkBorder: '#5b21b6' },
  teal:    { label: 'Sarcelle', light: '#115e59', dark: '#2dd4bf', lightBg: '#f0fdfa', lightBorder: '#5eead4', darkBg: '#0a1f1d', darkBorder: '#115e59' },
  slate:   { label: 'Neutre',   light: '#334155', dark: '#94a3b8', lightBg: '#f8fafc', lightBorder: '#cbd5e1', darkBg: '#1e293b', darkBorder: '#334155' }
};

// ---------------------------------------------------------------------------
// Dynamic palette builder (accent-aware)
// ---------------------------------------------------------------------------
const buildPalette = (theme, accentKey) => {
  const a = ACCENT_COLORS[accentKey] || ACCENT_COLORS.amber;
  if (theme === 'dark') {
    return { name: '#f8fafc', title: '#e2e8f0', company: a.dark, meta: '#cbd5e1', muted: '#94a3b8', divider: '#334155', avatarBorder: '#475569', ctaBg: a.darkBg, ctaBorder: a.darkBorder, ctaText: a.dark };
  }
  return { name: '#111827', title: '#334155', company: a.light, meta: '#475569', muted: '#64748b', divider: '#e2e8f0', avatarBorder: '#e2e8f0', ctaBg: a.lightBg, ctaBorder: a.lightBorder, ctaText: a.light };
};

// ---------------------------------------------------------------------------
// Helpers: storage
// ---------------------------------------------------------------------------
const getStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try { const r = window.localStorage.getItem(key); if (!r) return fallback; return { ...fallback, ...JSON.parse(r) }; } catch { return fallback; }
};
const getStoredString = (key, fallback, validSet) => {
  if (typeof window === 'undefined') return fallback;
  const v = window.localStorage.getItem(key);
  return v && (!validSet || validSet.has(v)) ? v : fallback;
};

// ---------------------------------------------------------------------------
// Helpers: text
// ---------------------------------------------------------------------------
const escapeHtml = (v = '') => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const formatDisplayUrl = (v = '') => v.replace(/^https?:\/\//i, '').replace(/\/$/, '');
const normalizeUrl = (v = '') => { const t = v.trim(); if (!t) return ''; return /^https?:\/\//i.test(t) ? t : `https://${t}`; };

/** Auto-format phone: +33 6 26 88 06 86 */
const formatPhone = (raw = '') => {
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return raw;
  if (digits.startsWith('+')) {
    const cc = digits.slice(0, 3); // e.g. +33
    const rest = digits.slice(3);  // e.g. 626880686
    if (rest.length === 9) {
      // French mobile: +33 X XX XX XX XX
      return cc + ' ' + rest[0] + ' ' + rest.slice(1).replace(/(\d{2})/g, '$1 ').trim();
    }
    // Generic: pairs from the right
    return cc + ' ' + rest.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }
  if (digits.length === 10) {
    // 06 26 88 06 86
    return digits.replace(/(\d{2})/g, '$1 ').trim();
  }
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
};

// ---------------------------------------------------------------------------
// Plain-text builder
// ---------------------------------------------------------------------------
const buildPlainTextSignature = (d) => {
  const lines = [d.name, d.title, d.company].filter(Boolean);
  const parts = [];
  if (d.phone) parts.push(formatPhone(d.phone));
  if (d.website) parts.push(formatDisplayUrl(d.website));
  if (parts.length) lines.push(parts.join('  •  '));
  if (d.linkedin) lines.push('LinkedIn: ' + normalizeUrl(d.linkedin));
  if (d.instagram) lines.push('Instagram: ' + normalizeUrl(d.instagram));
  if (d.availabilityText) lines.push('', d.availabilityText);
  if (d.ctaText && d.newsletterUrl) lines.push('', d.ctaText + ' ' + normalizeUrl(d.newsletterUrl));
  return lines.join('\n');
};

const copyHtmlToClipboard = async (html, plainText) => {
  // Primary: modern Clipboard API with ClipboardItem
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
      ]);
      return;
    } catch { /* fall through */ }
  }

  // Fallback : intercept copy event to force text/html + text/plain
  const textarea = document.createElement('textarea');
  textarea.value = plainText;
  Object.assign(textarea.style, { position: 'fixed', left: '-9999px', top: '0', opacity: '0' });
  document.body.appendChild(textarea);
  textarea.select();

  const handler = (e) => {
    e.preventDefault();
    e.clipboardData.setData('text/html', html);
    e.clipboardData.setData('text/plain', plainText);
  };

  document.addEventListener('copy', handler);
  try {
    document.execCommand('copy');
  } finally {
    document.removeEventListener('copy', handler);
    document.body.removeChild(textarea);
  }
};

const App = () => {
  const [formData, setFormData] = useState(() => getStoredValue(STORAGE_KEY, DEFAULT_FORM_DATA));
  const [previewTheme, setPreviewTheme] = useState(() => getStoredString(THEME_STORAGE_KEY, 'light', new Set(['light', 'dark'])));
  const [signatureTemplate, setSignatureTemplate] = useState(() => getStoredString(TEMPLATE_STORAGE_KEY, 'classic', new Set(Object.keys(TEMPLATE_OPTIONS))));
  const [accentColor, setAccentColor] = useState(() => getStoredString(ACCENT_STORAGE_KEY, 'amber', new Set(Object.keys(ACCENT_COLORS))));
  const [copyStatus, setCopyStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const signatureRef = useRef(null);

  useEffect(() => { setIsVisible(true); }, []);
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData)); }, [formData]);
  useEffect(() => { window.localStorage.setItem(THEME_STORAGE_KEY, previewTheme); }, [previewTheme]);
  useEffect(() => { window.localStorage.setItem(TEMPLATE_STORAGE_KEY, signatureTemplate); }, [signatureTemplate]);
  useEffect(() => { window.localStorage.setItem(ACCENT_STORAGE_KEY, accentColor); }, [accentColor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setPreviewTheme('light');
    setSignatureTemplate('classic');
    setAccentColor('amber');
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    window.localStorage.removeItem(TEMPLATE_STORAGE_KEY);
    window.localStorage.removeItem(ACCENT_STORAGE_KEY);
    setCopyStatus(null);
  };

  // -----------------------------------------------------------------------
  // Generate email-safe HTML
  // -----------------------------------------------------------------------
  const generateSignatureHTML = ({ forCopy = false } = {}) => {
    const palette = forCopy ? buildPalette('light', accentColor) : buildPalette(previewTheme, accentColor);
    const darkPal = buildPalette('dark', accentColor);
    const accent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.amber;
    const { name, title, phone, website, linkedin, instagram, company, logoUrl, newsletterUrl, availabilityText, ctaText } = formData;

    const safeName = escapeHtml(name.trim() || 'Nom');
    const safeTitle = escapeHtml(title.trim());
    const safeCompany = escapeHtml(company.trim());
    const safeAvailability = escapeHtml(availabilityText.trim());
    const safeCtaText = escapeHtml(ctaText.trim());
    const normalizedWebsite = normalizeUrl(website);
    const normalizedLinkedin = normalizeUrl(linkedin);
    const normalizedInstagram = normalizeUrl(instagram);
    const normalizedNewsletter = normalizeUrl(newsletterUrl);
    const websiteLabel = escapeHtml(formatDisplayUrl(website));
    const formattedPhone = formatPhone(phone.trim());
    const safePhone = escapeHtml(formattedPhone);

    const initials = (name.trim() || 'JD').split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();
    const avatarBg = accent.light.replace('#', '');
    const finalLogo = logoUrl.trim() !== ''
      ? logoUrl.trim()
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${avatarBg}&color=fff&bold=true&size=128`;

    // Contact line (phone + website)
    const contactParts = [];
    if (phone.trim()) contactParts.push(`<span style="color:${palette.meta};">${safePhone}</span>`);
    if (normalizedWebsite) contactParts.push(`<a href="${escapeHtml(normalizedWebsite)}" style="color:${palette.meta};text-decoration:none;">${websiteLabel}</a>`);

    // Social links — icon-only by default, icon+text for bold & editorial
    const showSocialText = signatureTemplate === 'bold' || signatureTemplate === 'editorial';
    // Minimal monochrome SVG data-URIs (16×16, #666)
    const liIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='%230a66c2'%3E%3Cpath d='M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77A1.75 1.75 0 0 0 0 1.73v20.54A1.75 1.75 0 0 0 1.77 24h20.45A1.75 1.75 0 0 0 24 22.27V1.73A1.75 1.75 0 0 0 22.22 0z'/%3E%3C/svg%3E`;
    const igIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='%23c13584'%3E%3Cpath d='M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.44.41a4.08 4.08 0 0 1 1.52.99 4.08 4.08 0 0 1 .99 1.52c.17.47.36 1.27.41 2.44.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.41 2.44a4.37 4.37 0 0 1-2.51 2.51c-.47.17-1.27.36-2.44.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.44-.41a4.08 4.08 0 0 1-1.52-.99 4.08 4.08 0 0 1-.99-1.52c-.17-.47-.36-1.27-.41-2.44C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.97.41-2.44a4.08 4.08 0 0 1 .99-1.52 4.08 4.08 0 0 1 1.52-.99c.47-.17 1.27-.36 2.44-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.77 5.77 0 0 0-2.09 1.36A5.77 5.77 0 0 0 .69 4.08C.39 4.84.19 5.72.13 6.99.07 8.27.06 8.68.06 11.94s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.77 5.77 0 0 0 1.36 2.09 5.77 5.77 0 0 0 2.09 1.36c.76.3 1.64.5 2.91.56C8.33 23.87 8.74 23.88 12 23.88s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a6.02 6.02 0 0 0 3.45-3.45c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.77 5.77 0 0 0-1.36-2.09A5.77 5.77 0 0 0 19.85.63C19.09.33 18.21.13 16.94.07 15.66.01 15.25 0 11.99 0h.01zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z'/%3E%3C/svg%3E`;

    const socialParts = [];
    if (normalizedLinkedin) {
      const label = showSocialText ? `<span style="margin-left:5px;">LinkedIn</span>` : '';
      socialParts.push(`<a href="${escapeHtml(normalizedLinkedin)}" style="display:inline-block;vertical-align:middle;text-decoration:none;color:#0a66c2;font-size:13px;font-weight:600;line-height:1;" title="LinkedIn"><img src="${liIcon}" width="16" height="16" alt="LinkedIn" style="display:inline-block;vertical-align:middle;border:0;" />${label}</a>`);
    }
    if (normalizedInstagram) {
      const label = showSocialText ? `<span style="margin-left:5px;">Instagram</span>` : '';
      socialParts.push(`<a href="${escapeHtml(normalizedInstagram)}" style="display:inline-block;vertical-align:middle;text-decoration:none;color:#c13584;font-size:13px;font-weight:600;line-height:1;" title="Instagram"><img src="${igIcon}" width="16" height="16" alt="Instagram" style="display:inline-block;vertical-align:middle;border:0;" />${label}</a>`);
    }

    // Template configs
    const templates = {
      classic:   { avatarSize: 52, avatarRadius: 14, nameSize: 18, titleSize: 13, compSize: 12, compTransform: 'uppercase', compSpacing: '0.03em', rowGap: 4, compGap: 10, contactGap: 6, availGap: 14, ctaR: 14, ctaP: '14px 16px', accentCell: '', ctaIcon: '📬', nameWeight: 700 },
      minimal:   { avatarSize: 0,  avatarRadius: 0,  nameSize: 15, titleSize: 12, compSize: 11, compTransform: 'none', compSpacing: '0', rowGap: 2, compGap: 6, contactGap: 4, availGap: 10, ctaR: 8, ctaP: '10px 12px', accentCell: '', ctaIcon: '→', nameWeight: 700 },
      compact:   { avatarSize: 44, avatarRadius: 12, nameSize: 16, titleSize: 12, compSize: 11, compTransform: 'none', compSpacing: '0.01em', rowGap: 3, compGap: 8, contactGap: 4, availGap: 12, ctaR: 10, ctaP: '12px 14px', accentCell: '', ctaIcon: '→', nameWeight: 700 },
      elegant:   { avatarSize: 52, avatarRadius: 999, nameSize: 17, titleSize: 13, compSize: 11, compTransform: 'uppercase', compSpacing: '0.12em', rowGap: 4, compGap: 10, contactGap: 6, availGap: 14, ctaR: 999, ctaP: '14px 18px', accentCell: '', ctaIcon: '✉', nameWeight: 400 },
      bold:      { avatarSize: 52, avatarRadius: 14, nameSize: 22, titleSize: 14, compSize: 12, compTransform: 'uppercase', compSpacing: '0.06em', rowGap: 4, compGap: 10, contactGap: 6, availGap: 14, ctaR: 14, ctaP: '14px 16px', accentCell: '', ctaIcon: '🔥', nameWeight: 900 },
      editorial: { avatarSize: 52, avatarRadius: 16, nameSize: 18, titleSize: 13, compSize: 12, compTransform: 'uppercase', compSpacing: '0.08em', rowGap: 4, compGap: 10, contactGap: 6, availGap: 14, ctaR: 16, ctaP: '14px 16px', accentCell: `<td style="width:6px;background:${palette.company};border-radius:999px;font-size:0;line-height:0;">&nbsp;</td><td style="width:14px;font-size:0;line-height:0;">&nbsp;</td>`, ctaIcon: '✦', nameWeight: 700 }
    };
    const tc = templates[signatureTemplate] || templates.classic;

    const showNewsletterBlock = Boolean(normalizedNewsletter && safeCtaText);
    const colSpan = signatureTemplate === 'editorial' ? '4' : (tc.avatarSize > 0 ? '2' : '1');

    const darkModeStyles = forCopy
      ? `<style>@media (prefers-color-scheme:dark){.sig-shell{color:${darkPal.name}!important}.sig-name{color:${darkPal.name}!important}.sig-title{color:${darkPal.title}!important}.sig-company{color:${darkPal.company}!important}.sig-meta{color:${darkPal.meta}!important}.sig-muted{color:${darkPal.muted}!important}.sig-divider{border-color:${darkPal.divider}!important}.sig-avatar{border-color:${darkPal.avatarBorder}!important}.sig-cta-table{background-color:${darkPal.ctaBg}!important;border-color:${darkPal.ctaBorder}!important}.sig-cta-link{color:${darkPal.ctaText}!important}}</style>`
      : '';

    // Avatar cell (hidden for "minimal")
    const avatarCell = tc.avatarSize > 0 ? `
      <td style="vertical-align:top;padding-right:16px;width:${tc.avatarSize + 16}px;">
        <img src="${escapeHtml(finalLogo)}" width="${tc.avatarSize}" height="${tc.avatarSize}" alt="${safeCompany || safeName}" class="sig-avatar" style="display:block;width:${tc.avatarSize}px;height:${tc.avatarSize}px;border-radius:${tc.avatarRadius}px;border:1px solid ${palette.avatarBorder};object-fit:cover;" />
      </td>` : '';

    const contentCell = `
      <td style="vertical-align:top;padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;">
          <tr><td class="sig-name" style="font-size:${tc.nameSize}px;line-height:1.2;font-weight:${tc.nameWeight};color:${palette.name};padding:0 0 ${tc.rowGap}px;">${safeName}</td></tr>
          ${safeTitle ? `<tr><td class="sig-title" style="font-size:${tc.titleSize}px;line-height:1.45;font-weight:600;color:${palette.title};padding:0 0 ${tc.rowGap}px;">${safeTitle}</td></tr>` : ''}
          ${safeCompany ? `<tr><td class="sig-company" style="font-size:${tc.compSize}px;line-height:1.4;font-weight:700;letter-spacing:${tc.compSpacing};text-transform:${tc.compTransform};color:${palette.company};padding:0 0 ${tc.compGap}px;">${safeCompany}</td></tr>` : ''}
          ${contactParts.length ? `<tr><td class="sig-meta" style="font-size:13px;line-height:1.5;color:${palette.meta};padding:0 0 ${tc.contactGap}px;">${contactParts.join(`<span class="sig-muted" style="color:${palette.muted};"> &nbsp;•&nbsp; </span>`)}</td></tr>` : ''}
          ${socialParts.length ? `<tr><td style="padding:0 0 4px;font-size:0;line-height:1;">${socialParts.join(`<span style="display:inline-block;width:${showSocialText ? '12' : '8'}px;"></span>`)}</td></tr>` : ''}
        </table>
      </td>`;

    const newsletterBlock = showNewsletterBlock ? `
    <tr>
      <td colspan="${colSpan}" style="padding:14px 0 0;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;width:100%;border:1px solid ${palette.ctaBorder};background:${palette.ctaBg};">
          <tr><td style="padding:${tc.ctaP};width:24px;font-size:14px;color:${palette.ctaText};">${tc.ctaIcon}</td>
          <td style="padding:${tc.ctaP};padding-left:0;"><a href="${escapeHtml(normalizedNewsletter)}" style="display:inline-block;font-size:13px;line-height:1.5;font-weight:700;color:${palette.ctaText};text-decoration:none;">${safeCtaText}</a></td></tr>
        </table>
        <![endif]-->
        <!--[if !mso]><!-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="sig-cta-table" style="border-collapse:separate;width:100%;border:1px solid ${palette.ctaBorder};border-radius:${tc.ctaR}px;background-color:${palette.ctaBg};overflow:hidden;">
          <tr><td style="padding:${tc.ctaP};width:28px;vertical-align:top;font-size:18px;line-height:1;">${tc.ctaIcon}</td>
          <td style="padding:${tc.ctaP};padding-left:0;vertical-align:middle;"><a class="sig-cta-link" href="${escapeHtml(normalizedNewsletter)}" style="display:block;font-size:13px;line-height:1.5;font-weight:700;color:${palette.ctaText};text-decoration:none;">${safeCtaText}</a></td></tr>
        </table>
        <!--<![endif]-->
      </td>
    </tr>` : '';

    return `
<div class="sig-shell" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${palette.name};max-width:520px;text-align:left;line-height:1.4;">
  ${darkModeStyles}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:520px;">
    <tr>${avatarCell}${tc.accentCell}${contentCell}</tr>
    ${safeAvailability ? `
    <tr><td colspan="${colSpan}" class="sig-divider" style="padding:${tc.availGap}px 0 0;border-top:1px solid ${palette.divider};"></td></tr>
    <tr><td colspan="${colSpan}" class="sig-meta" style="padding:10px 0 0;font-size:12px;line-height:1.6;color:${palette.meta};">${safeAvailability}</td></tr>` : ''}
    ${newsletterBlock}
  </table>
</div>`.replace(/\n\s*\n/g, '\n').trim();
  };

  const copyRichText = async () => {
    const plainText = buildPlainTextSignature(formData);
    const html = generateSignatureHTML({ forCopy: true });
    try {
      await copyHtmlToClipboard(html, plainText);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus(null), 4000);
    }
  };

  // -----------------------------------------------------------------------
  // UI
  // -----------------------------------------------------------------------
  const accentTw = {
    amber: 'bg-amber-500', blue: 'bg-blue-600', emerald: 'bg-emerald-600',
    rose: 'bg-rose-600', violet: 'bg-violet-600', teal: 'bg-teal-600', slate: 'bg-slate-500'
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-900 font-sans selection:bg-amber-100 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[100%] md:w-[40%] h-[40%] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[100%] md:w-[35%] h-[35%] bg-sky-100/40 rounded-full blur-[100px]" />
      </div>

      <div className={`w-full max-w-6xl px-4 py-8 md:py-16 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <header className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-slate-200 shadow-sm text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Heart size={10} className="text-rose-400 fill-rose-400" /> liut app
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-4 italic">Signy.</h1>
          <p className="text-slate-600 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">Crée ta signature mail pro en 2 minutes — elle reste parfaite sur Gmail, Outlook et Apple Mail.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* ------------- LEFT: FORM ------------- */}
          <section className="bg-white/95 backdrop-blur p-6 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 order-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2"><Layout size={14} /> Profil</h2>
                <p className="text-sm text-slate-500 max-w-lg">Les champs restent sauvegardés en local sur ce navigateur.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck size={16} /> Sauvegarde locale
              </div>
            </div>

            {/* Template picker */}
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Template</h3>
                  <p className="text-sm text-slate-500">Choisis le style adapté à ton client mail.</p>
                </div>
                <button onClick={handleReset} type="button" className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-100">
                  Réinitialiser
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(TEMPLATE_OPTIONS).map(([tKey, opt]) => (
                  <button key={tKey} type="button" onClick={() => setSignatureTemplate(tKey)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${signatureTemplate === tKey ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <p className={`mt-1 text-xs leading-relaxed ${signatureTemplate === tKey ? 'text-slate-300' : 'text-slate-500'}`}>{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent colour picker */}
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3"><Palette size={14} /> Couleur d'accent</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ACCENT_COLORS).map(([key, c]) => (
                  <button key={key} type="button" onClick={() => setAccentColor(key)}
                    title={c.label}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${accentTw[key]} ${accentColor === key ? 'ring-2 ring-offset-2 ring-slate-900 border-white scale-110' : 'border-transparent hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nom" name="name" value={formData.name} onChange={handleInputChange} icon={<User size={18} />} autoComplete="name" />
              <InputField label="Entreprise" name="company" value={formData.company} onChange={handleInputChange} icon={<Briefcase size={18} />} autoComplete="organization" />
            </div>
            <TextAreaField label="Poste" name="title" value={formData.title} onChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} icon={<Phone size={18} />} autoComplete="tel" />
              <InputField label="Site" name="website" type="url" value={formData.website} onChange={handleInputChange} icon={<Globe size={18} />} autoComplete="url" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="LinkedIn" name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange} icon={<Linkedin size={18} />} autoComplete="url" />
              <InputField label="Instagram" name="instagram" type="url" value={formData.instagram} onChange={handleInputChange} icon={<Instagram size={18} />} autoComplete="url" />
            </div>
            <InputField label="Logo URL" name="logoUrl" type="url" value={formData.logoUrl} onChange={handleInputChange} icon={<ImageIcon size={18} />} placeholder="Laissez vide pour avatar auto" autoComplete="url" />
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <InputField label="Lien Newsletter" name="newsletterUrl" type="url" value={formData.newsletterUrl} onChange={handleInputChange} icon={<Mail size={18} />} autoComplete="url" />
              <TextAreaField label="Accroche Newsletter" name="ctaText" value={formData.ctaText} onChange={handleInputChange} />
              <TextAreaField label="Disponibilité" name="availabilityText" value={formData.availabilityText} onChange={handleInputChange} />
            </div>
            <button onClick={copyRichText} className="w-full bg-slate-950 text-white py-5 px-6 rounded-3xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-200">
              {copyStatus === 'success' ? <Check size={22} className="text-emerald-400" /> : <Copy size={22} />}
              {copyStatus === 'success' ? 'Signature copiée !' : copyStatus === 'error' ? 'Copie à réessayer' : 'Copier pour Gmail, Mail et Outlook'}
            </button>
            <p className="text-xs leading-relaxed text-slate-500 flex items-start gap-2">
              <HelpCircle size={14} className="mt-0.5 shrink-0 text-slate-400" />
              La copie inclut du HTML et du texte brut. Utilisez Ctrl+V / ⌘V dans les réglages de signature de votre client mail.
            </p>
          </section>

          {/* ------------- RIGHT: PREVIEW ------------- */}
          <section className="lg:sticky lg:top-8 space-y-6 order-2">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Aperçu</h2>
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                <button aria-label="Aperçu clair" onClick={() => setPreviewTheme('light')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'light' ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}><Sun size={18} /></button>
                <button aria-label="Aperçu sombre" onClick={() => setPreviewTheme('dark')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><Moon size={18} /></button>
              </div>
            </div>
            <div className={`w-full min-h-[450px] rounded-[3.5rem] p-8 md:p-10 transition-all duration-500 border-8 ${previewTheme === 'light' ? 'bg-white border-white shadow-2xl shadow-slate-200/40' : 'bg-slate-950 border-slate-800 shadow-2xl'}`}>
              <div className={`mb-12 flex gap-3 opacity-10 ${previewTheme === 'dark' ? 'invert' : ''}`}><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /></div>
              <div className={`mb-5 flex items-center justify-between gap-4 rounded-2xl border border-dashed px-4 py-3 text-xs leading-relaxed ${previewTheme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                <span>Template {TEMPLATE_OPTIONS[signatureTemplate].label.toLowerCase()} · accent {ACCENT_COLORS[accentColor].label.toLowerCase()}</span>
                <ShieldCheck size={16} className="shrink-0" />
              </div>
              <div ref={signatureRef} className={`w-full overflow-x-auto rounded-[2rem] p-6 ${previewTheme === 'light' ? 'bg-white' : 'bg-slate-900'}`} dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <Zap className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform" size={100} />
               <h4 className="font-bold text-xs flex items-center gap-2 mb-4 text-amber-300"><MousePointer2 size={16} /> Guide Rapide</h4>
               <ul className="text-[12px] text-slate-300 space-y-3 leading-relaxed relative z-10">
                 <li className="flex gap-2"><span>&bull;</span> Renseigne ou ajuste les champs à gauche.</li>
                 <li className="flex gap-2"><span>&bull;</span> Copie la signature HTML préparée pour les clients mail.</li>
                 <li className="flex gap-2"><span>&bull;</span> Colle-la dans les réglages de signature de Gmail, Mail ou Outlook.</li>
               </ul>
            </div>
          </section>
        </main>
      </div>
      <footer className="mt-8 md:mt-16 text-slate-300 text-[10px] uppercase tracking-[0.5em] pb-12 font-black">Signy &bull; 2025</footer>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon, placeholder, type = 'text', autoComplete = 'off' }) => (
  <div className="space-y-2 group flex-1">
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors">{icon}</div>
      <input id={name} type={type} name={name} value={value} onChange={onChange} autoComplete={autoComplete} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300 focus:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400" placeholder={placeholder} />
    </div>
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <textarea id={name} name={name} value={value} onChange={onChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300 focus:bg-white transition-all text-sm text-slate-800 resize-none" />
  </div>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
