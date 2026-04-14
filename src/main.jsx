import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Briefcase, Phone, Globe, Linkedin, Image as ImageIcon,
  Copy, HelpCircle, Sun, Moon, Check, Mail, Zap, ShieldCheck,
  Layout, MousePointer2, Heart
} from 'lucide-react';

const STORAGE_KEY = 'signy.form-data';
const THEME_STORAGE_KEY = 'signy.preview-theme';
const TEMPLATE_STORAGE_KEY = 'signy.signature-template';

const DEFAULT_FORM_DATA = {
  name: 'John Doe',
  title: 'Charge de projet | Coordination & Gestion d\'equipes',
  phone: '+33 6 00 00 00 00',
  website: 'votre-site.fr',
  linkedin: 'linkedin.com/in/votreprofil',
  company: 'Mon Entreprise',
  logoUrl: '',
  newsletterUrl: 'https://newsletter.votre-site.fr',
  availabilityText: 'Je reponds en general sous 48h par mail. Si c\'est urgent, je suis plus reactif par SMS ou appel au +33 6 00 00 00 00.',
  ctaText: 'Rejoignez ma lettre d\'information pour recevoir mes derniers conseils et ressources chaque mois.'
};

const TEMPLATE_OPTIONS = {
  classic: {
    label: 'Classique',
    description: 'Equilibre, lisible, passe partout.'
  },
  compact: {
    label: 'Compacte',
    description: 'Plus dense, pratique pour Outlook.'
  },
  editorial: {
    label: 'Editoriale',
    description: 'Plus marquee, avec accent visuel.'
  }
};

const signaturePalette = {
  light: {
    name: '#111827',
    title: '#334155',
    company: '#9a3412',
    meta: '#475569',
    muted: '#64748b',
    divider: '#e2e8f0',
    avatarBorder: '#e2e8f0',
    ctaBg: '#fff7ed',
    ctaBorder: '#fdba74',
    ctaText: '#9a3412'
  },
  dark: {
    name: '#f8fafc',
    title: '#e2e8f0',
    company: '#fdba74',
    meta: '#cbd5e1',
    muted: '#94a3b8',
    divider: '#334155',
    avatarBorder: '#475569',
    ctaBg: '#2b1a10',
    ctaBorder: '#9a3412',
    ctaText: '#fed7aa'
  }
};

const getStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallback;
    }

    return { ...fallback, ...JSON.parse(rawValue) };
  } catch {
    return fallback;
  }
};

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' ? 'dark' : 'light';
};

const getStoredTemplate = () => {
  if (typeof window === 'undefined') {
    return 'classic';
  }

  const storedTemplate = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
  return storedTemplate && TEMPLATE_OPTIONS[storedTemplate] ? storedTemplate : 'classic';
};

const escapeHtml = (value = '') => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const formatDisplayUrl = (value = '') => value
  .replace(/^https?:\/\//i, '')
  .replace(/\/$/, '');

const normalizeUrl = (value = '') => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const buildPlainTextSignature = ({ name, title, company, phone, website, linkedin, availabilityText, ctaText, newsletterUrl }) => {
  const lines = [name, title, company].filter(Boolean);
  const contactLine = [phone, website, linkedin].filter(Boolean).join(' | ');

  if (contactLine) {
    lines.push(contactLine);
  }

  if (availabilityText) {
    lines.push('', availabilityText);
  }

  if (ctaText && newsletterUrl) {
    lines.push('', `${ctaText} ${newsletterUrl}`);
  }

  return lines.join('\n');
};

const copyHtmlToClipboard = async (html, plainText) => {
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    const clipboardItems = [
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' })
      })
    ];

    await navigator.clipboard.write(clipboardItems);
    return;
  }

  await new Promise((resolve, reject) => {
    const handleCopy = (event) => {
      event.preventDefault();
      event.clipboardData?.setData('text/html', html);
      event.clipboardData?.setData('text/plain', plainText);
      resolve();
    };

    document.addEventListener('copy', handleCopy, { once: true });

    const didCopy = document.execCommand('copy');
    if (!didCopy) {
      document.removeEventListener('copy', handleCopy);
      reject(new Error('Copy command failed'));
    }
  });
};

const App = () => {
  const [formData, setFormData] = useState(() => getStoredValue(STORAGE_KEY, DEFAULT_FORM_DATA));
  const [previewTheme, setPreviewTheme] = useState(getStoredTheme);
  const [signatureTemplate, setSignatureTemplate] = useState(getStoredTemplate);
  const [copyStatus, setCopyStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const signatureRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, previewTheme);
  }, [previewTheme]);

  useEffect(() => {
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, signatureTemplate);
  }, [signatureTemplate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setPreviewTheme('light');
    setSignatureTemplate('classic');
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    window.localStorage.removeItem(TEMPLATE_STORAGE_KEY);
    setCopyStatus(null);
  };

  const generateSignatureHTML = ({ forCopy = false } = {}) => {
    const palette = forCopy ? signaturePalette.light : signaturePalette[previewTheme];
    const { name, title, phone, website, linkedin, company, logoUrl, newsletterUrl, availabilityText, ctaText } = formData;
    const safeName = escapeHtml(name.trim() || 'Nom');
    const safeTitle = escapeHtml(title.trim());
    const safeCompany = escapeHtml(company.trim());
    const safeAvailability = escapeHtml(availabilityText.trim());
    const safeCtaText = escapeHtml(ctaText.trim());
    const normalizedWebsite = normalizeUrl(website);
    const normalizedLinkedin = normalizeUrl(linkedin);
    const normalizedNewsletter = normalizeUrl(newsletterUrl);
    const websiteLabel = escapeHtml(formatDisplayUrl(website));
    const linkedinLabel = escapeHtml(formatDisplayUrl(linkedin));
    const initials = (name.trim() || 'JD')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const finalLogo = logoUrl.trim() !== ''
      ? logoUrl.trim()
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=fff7ed&color=9a3412&bold=true&size=128`;

    const contactParts = [];
    if (phone.trim()) {
      contactParts.push(`<span style="color: ${palette.meta};">${escapeHtml(phone.trim())}</span>`);
    }
    if (normalizedWebsite) {
      contactParts.push(`<a href="${escapeHtml(normalizedWebsite)}" style="color: ${palette.meta}; text-decoration: none;"><span style="color: ${palette.meta};">${websiteLabel}</span></a>`);
    }

    const templateConfig = {
      classic: {
        avatarSize: 52,
        avatarRadius: 14,
        nameSize: 18,
        titleSize: 13,
        companySize: 12,
        companyTransform: 'uppercase',
        companySpacing: '0.03em',
        rowGap: 4,
        companyGap: 10,
        contactGap: 6,
        availabilityGap: 14,
        ctaRadius: 14,
        ctaPadding: '14px 16px',
        accentCell: '',
        ctaIcon: '📬'
      },
      compact: {
        avatarSize: 44,
        avatarRadius: 12,
        nameSize: 16,
        titleSize: 12,
        companySize: 11,
        companyTransform: 'none',
        companySpacing: '0.01em',
        rowGap: 3,
        companyGap: 8,
        contactGap: 4,
        availabilityGap: 12,
        ctaRadius: 10,
        ctaPadding: '12px 14px',
        accentCell: '',
        ctaIcon: '->'
      },
      editorial: {
        avatarSize: 52,
        avatarRadius: 16,
        nameSize: 18,
        titleSize: 13,
        companySize: 12,
        companyTransform: 'uppercase',
        companySpacing: '0.08em',
        rowGap: 4,
        companyGap: 10,
        contactGap: 6,
        availabilityGap: 14,
        ctaRadius: 16,
        ctaPadding: '14px 16px',
        accentCell: `<td style="width: 6px; background: ${palette.company}; border-radius: 999px; font-size: 0; line-height: 0;">&nbsp;</td><td style="width: 14px; font-size: 0; line-height: 0;">&nbsp;</td>`,
        ctaIcon: '✦'
      }
    }[signatureTemplate];

    const showNewsletterBlock = Boolean(normalizedNewsletter && safeCtaText);
    const darkModeStyles = forCopy
      ? `<style>
  @media (prefers-color-scheme: dark) {
    .sig-shell { color: ${signaturePalette.dark.name} !important; }
    .sig-name { color: ${signaturePalette.dark.name} !important; }
    .sig-title { color: ${signaturePalette.dark.title} !important; }
    .sig-company { color: ${signaturePalette.dark.company} !important; }
    .sig-meta { color: ${signaturePalette.dark.meta} !important; }
    .sig-muted { color: ${signaturePalette.dark.muted} !important; }
    .sig-divider { border-color: ${signaturePalette.dark.divider} !important; }
    .sig-avatar { border-color: ${signaturePalette.dark.avatarBorder} !important; }
    .sig-cta-table { background-color: ${signaturePalette.dark.ctaBg} !important; border-color: ${signaturePalette.dark.ctaBorder} !important; }
    .sig-cta-link { color: ${signaturePalette.dark.ctaText} !important; }
  }
</style>`
      : '';

    const contentCell = `
      <td style="vertical-align: top; padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
          <tr>
            <td class="sig-name" style="font-size: ${templateConfig.nameSize}px; line-height: 1.2; font-weight: 700; color: ${palette.name}; padding: 0 0 ${templateConfig.rowGap}px; mso-line-height-rule: exactly;">${safeName}</td>
          </tr>
          ${safeTitle ? `<tr><td class="sig-title" style="font-size: ${templateConfig.titleSize}px; line-height: 1.45; font-weight: 600; color: ${palette.title}; padding: 0 0 ${templateConfig.rowGap}px; mso-line-height-rule: exactly;">${safeTitle}</td></tr>` : ''}
          ${safeCompany ? `<tr><td class="sig-company" style="font-size: ${templateConfig.companySize}px; line-height: 1.4; font-weight: 700; letter-spacing: ${templateConfig.companySpacing}; text-transform: ${templateConfig.companyTransform}; color: ${palette.company}; padding: 0 0 ${templateConfig.companyGap}px; mso-line-height-rule: exactly;">${safeCompany}</td></tr>` : ''}
          ${contactParts.length > 0 ? `<tr><td class="sig-meta" style="font-size: 13px; line-height: 1.5; color: ${palette.meta}; padding: 0 0 ${templateConfig.contactGap}px; mso-line-height-rule: exactly;">${contactParts.join(`<span class="sig-muted" style="color: ${palette.muted};"> &nbsp;•&nbsp; </span>`)}</td></tr>` : ''}
          ${normalizedLinkedin ? `<tr><td style="padding: 0 0 4px;"><a href="${escapeHtml(normalizedLinkedin)}" style="font-size: 13px; line-height: 1.5; color: #0a66c2; text-decoration: none; font-weight: 700;">${linkedinLabel || 'LinkedIn'}</a></td></tr>` : ''}
        </table>
      </td>`;

    const newsletterBlock = showNewsletterBlock ? `
    <tr>
      <td colspan="2" style="padding: 14px 0 0;">
        <!--[if mso]>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse; width: 100%; border: 1px solid ${palette.ctaBorder}; background: ${palette.ctaBg};">
          <tr>
            <td style="padding: ${templateConfig.ctaPadding}; width: 24px; font-size: 14px; color: ${palette.ctaText};">${templateConfig.ctaIcon}</td>
            <td style="padding: ${templateConfig.ctaPadding}; padding-left: 0;">
              <a href="${escapeHtml(normalizedNewsletter)}" style="display: inline-block; font-size: 13px; line-height: 1.5; font-weight: 700; color: ${palette.ctaText}; text-decoration: none;">${safeCtaText}</a>
            </td>
          </tr>
        </table>
        <![endif]-->
        <!--[if !mso]><!-->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="sig-cta-table" style="border-collapse: separate; width: 100%; border: 1px solid ${palette.ctaBorder}; border-radius: ${templateConfig.ctaRadius}px; background-color: ${palette.ctaBg}; mso-table-lspace: 0pt; mso-table-rspace: 0pt; overflow: hidden;">
          <tr>
            <td style="padding: ${templateConfig.ctaPadding}; width: 28px; vertical-align: top; font-size: 18px; line-height: 1;">${templateConfig.ctaIcon}</td>
            <td style="padding: ${templateConfig.ctaPadding}; padding-left: 0; vertical-align: middle;">
              <a class="sig-cta-link" href="${escapeHtml(normalizedNewsletter)}" style="display: block; font-size: 13px; line-height: 1.5; font-weight: 700; color: ${palette.ctaText}; text-decoration: none;">${safeCtaText}</a>
            </td>
          </tr>
        </table>
        <!--<![endif]-->
      </td>
    </tr>` : '';

    return `
<div class="sig-shell" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: ${signaturePalette.light.name}; max-width: 520px; text-align: left; line-height: 1.4;">
  ${darkModeStyles}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 520px; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td style="vertical-align: top; padding-right: 16px; padding-bottom: 0; width: ${templateConfig.avatarSize + 16}px;">
        <img
          src="${escapeHtml(finalLogo)}"
          width="${templateConfig.avatarSize}"
          height="${templateConfig.avatarSize}"
          alt="${safeCompany || safeName}"
          class="sig-avatar"
          style="display: block; width: ${templateConfig.avatarSize}px; height: ${templateConfig.avatarSize}px; border-radius: ${templateConfig.avatarRadius}px; border: 1px solid ${palette.avatarBorder}; object-fit: cover;"
        />
      </td>
      ${templateConfig.accentCell}${contentCell}
    </tr>
    ${safeAvailability ? `
    <tr>
      <td colspan="${signatureTemplate === 'editorial' ? '4' : '2'}" class="sig-divider" style="padding: ${templateConfig.availabilityGap}px 0 0; border-top: 1px solid ${palette.divider};"></td>
    </tr>
    <tr>
      <td colspan="${signatureTemplate === 'editorial' ? '4' : '2'}" class="sig-meta" style="padding: 10px 0 0; font-size: 12px; line-height: 1.6; color: ${palette.meta};">${safeAvailability}</td>
    </tr>` : ''}
    ${newsletterBlock.replaceAll('colspan="2"', `colspan="${signatureTemplate === 'editorial' ? '4' : '2'}"`)}
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

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-slate-900 font-sans selection:bg-amber-100 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[100%] md:w-[40%] h-[40%] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[100%] md:w-[35%] h-[35%] bg-sky-100/40 rounded-full blur-[100px]" />
      </div>

      <div className={`w-full max-w-6xl px-4 py-8 md:py-16 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <header className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 border border-slate-200 shadow-sm text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Heart size={10} className="text-rose-400 fill-rose-400" /> Signy App
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-4 italic">Signy.</h1>
          <p className="text-slate-600 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed">Genere, ajuste et recolle une signature mail propre sans perdre tes donnees a chaque recharge.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <section className="bg-white/95 backdrop-blur p-6 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 order-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-2"><Layout size={14} /> Profil</h2>
                <p className="text-sm text-slate-500 max-w-lg">Les champs restent sauvegardes en local sur ce navigateur pour retrouver la signature au prochain ajustement.</p>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-700">
                <ShieldCheck size={16} /> Sauvegarde locale
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Template</h3>
                  <p className="text-sm text-slate-500">Choisis le style de signature le plus adapte au client mail vise.</p>
                </div>
                <button onClick={handleReset} type="button" className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-100">
                  Reinitialiser
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(TEMPLATE_OPTIONS).map(([templateKey, option]) => (
                  <button
                    key={templateKey}
                    type="button"
                    onClick={() => setSignatureTemplate(templateKey)}
                    className={`rounded-[1.5rem] border p-4 text-left transition ${signatureTemplate === templateKey ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-200' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                  >
                    <div className="text-sm font-semibold">{option.label}</div>
                    <p className={`mt-1 text-xs leading-relaxed ${signatureTemplate === templateKey ? 'text-slate-300' : 'text-slate-500'}`}>{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nom" name="name" value={formData.name} onChange={handleInputChange} icon={<User size={18} />} autoComplete="name" />
              <InputField label="Entreprise" name="company" value={formData.company} onChange={handleInputChange} icon={<Briefcase size={18} />} autoComplete="organization" />
            </div>
            <TextAreaField label="Poste" name="title" value={formData.title} onChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} icon={<Phone size={18} />} autoComplete="tel" />
              <InputField label="Site" name="website" type="url" value={formData.website} onChange={handleInputChange} icon={<Globe size={18} />} autoComplete="url" />
            </div>
            <InputField label="LinkedIn" name="linkedin" type="url" value={formData.linkedin} onChange={handleInputChange} icon={<Linkedin size={18} />} autoComplete="url" />
            <InputField label="Logo URL" name="logoUrl" type="url" value={formData.logoUrl} onChange={handleInputChange} icon={<ImageIcon size={18} />} placeholder="Laissez vide pour avatar auto" autoComplete="url" />
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <InputField label="Lien Newsletter" name="newsletterUrl" type="url" value={formData.newsletterUrl} onChange={handleInputChange} icon={<Mail size={18} />} autoComplete="url" />
              <TextAreaField label="Accroche Newsletter" name="ctaText" value={formData.ctaText} onChange={handleInputChange} />
              <TextAreaField label="Disponibilité" name="availabilityText" value={formData.availabilityText} onChange={handleInputChange} />
            </div>
            <button onClick={copyRichText} className="w-full bg-slate-950 text-white py-5 px-6 rounded-3xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 focus:outline-none focus:ring-4 focus:ring-amber-200">
              {copyStatus === 'success' ? <Check size={22} className="text-emerald-400" /> : <Copy size={22} />}
              {copyStatus === 'success' ? 'Signature copiée' : copyStatus === 'error' ? 'Copie a reessayer' : 'Copier pour Gmail, Mail et Outlook'}
            </button>
            <p className="text-xs leading-relaxed text-slate-500 flex items-start gap-2">
              <HelpCircle size={14} className="mt-0.5 shrink-0 text-slate-400" />
              La copie inclut du HTML et du texte brut pour maximiser le collage dans Gmail, Apple Mail et Outlook. Selon le client, un collage via raccourci clavier reste le plus fiable.
            </p>
          </section>

          <section className="lg:sticky lg:top-8 space-y-6 order-2">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Apercu</h2>
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                <button aria-label="Afficher l'apercu clair" onClick={() => setPreviewTheme('light')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'light' ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}><Sun size={18} /></button>
                <button aria-label="Afficher l'apercu sombre" onClick={() => setPreviewTheme('dark')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><Moon size={18} /></button>
              </div>
            </div>
            <div className={`w-full min-h-[450px] rounded-[3.5rem] p-8 md:p-10 transition-all duration-500 border-8 ${previewTheme === 'light' ? 'bg-white border-white shadow-2xl shadow-slate-200/40' : 'bg-slate-950 border-slate-800 shadow-2xl'}`}>
              <div className={`mb-12 flex gap-3 opacity-10 ${previewTheme === 'dark' ? 'invert' : ''}`}><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /></div>
              <div className={`mb-5 flex items-center justify-between gap-4 rounded-2xl border border-dashed px-4 py-3 text-xs leading-relaxed ${previewTheme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-700 bg-slate-900 text-slate-300'}`}>
                <span>Template {TEMPLATE_OPTIONS[signatureTemplate].label.toLowerCase()} avec tableaux, styles inline et bloc newsletter adapte pour Outlook.</span>
                <ShieldCheck size={16} className="shrink-0" />
              </div>
              <div ref={signatureRef} className={`w-full overflow-x-auto rounded-[2rem] p-6 ${previewTheme === 'light' ? 'bg-white' : 'bg-slate-900'}`} dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <Zap className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform" size={100} />
               <h4 className="font-bold text-xs flex items-center gap-2 mb-4 text-amber-300"><MousePointer2 size={16} /> Guide Rapide</h4>
               <ul className="text-[12px] text-slate-300 space-y-3 leading-relaxed relative z-10">
                 <li className="flex gap-2"><span>&bull;</span> Renseigne ou ajuste les champs a gauche.</li>
                 <li className="flex gap-2"><span>&bull;</span> Copie la signature HTML preparee pour les clients mail.</li>
                 <li className="flex gap-2"><span>&bull;</span> Colle-la dans les reglages de signature de Gmail, Mail ou Outlook.</li>
               </ul>
            </div>
          </section>
        </main>
      </div>
      <footer className="mt-8 md:mt-16 text-slate-300 text-[10px] uppercase tracking-[0.5em] pb-12 font-black">Signy &bull; 2026</footer>
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

// Initialisation sécurisée du rendu React
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
