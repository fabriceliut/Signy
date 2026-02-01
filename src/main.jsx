import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  User, Briefcase, Phone, Globe, Linkedin, Image as ImageIcon,
  Copy, HelpCircle, Sun, Moon, Check, Mail, Zap, ShieldCheck,
  Layout, MousePointer2, Heart
} from 'lucide-react';

const App = () => {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    title: 'Chargé de projet | Coordination & Gestion d’équipes',
    phone: '+33 6 00 00 00 00',
    website: 'votre-site.fr',
    linkedin: 'linkedin.com/in/votreprofil',
    company: 'Mon Entreprise',
    logoUrl: '',
    newsletterUrl: 'https://newsletter.votre-site.fr',
    availabilityText: 'Je réponds en général sous 48h par mail, cependant, si c’est urgent, je suis réactif par sms ou appel au +33 6 00 00 00 00.',
    ctaText: 'Rejoignez ma lettre d’information pour recevoir mes derniers conseils et ressources chaque semaine.'
  });
  
  const [previewTheme, setPreviewTheme] = useState('light');
  const [copyStatus, setCopyStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const signatureRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const colors = {
    light: { name: '#111827', title: '#4b5563', meta: '#6b7280', bgCta: '#fefce8', borderCta: '#fef3c7', textCta: '#92400e' },
    dark: { name: '#ffffff', title: '#d1d5db', meta: '#9ca3af', bgCta: '#2d2a1a', borderCta: '#454026', textCta: '#fde68a' }
  };

  const currentColors = colors[previewTheme];

  const generateSignatureHTML = (isForCopy = false) => {
    const { name, title, phone, website, linkedin, company, logoUrl, newsletterUrl, availabilityText, ctaText } = formData;
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const finalLogo = logoUrl.trim() !== '' ? logoUrl : `https://ui-avatars.com/api/?name=${initials}&background=fef3c7&color=92400e&bold=true&size=128`;
    
    const contactParts = [];
    if (phone.trim()) contactParts.push(phone);
    if (website.trim()) contactParts.push(`<a href="https://${website.replace('https://', '')}" style="color: #4b5563; text-decoration: none;"><span style="color: #4b5563;">${website}</span></a>`);
    
    return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: ${colors.light.name}; max-width: 500px; text-align: left;">
  <style>
    @media (prefers-color-scheme: dark) {
      .sig-name { color: ${colors.dark.name} !important; }
      .sig-title { color: ${colors.dark.title} !important; }
      .sig-meta { color: ${colors.dark.meta} !important; }
      .sig-cta { background-color: ${colors.dark.bgCta} !important; border-color: ${colors.dark.borderCta} !important; }
      .sig-cta-link { color: ${colors.dark.textCta} !important; }
    }
  </style>
  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
    <tr><td style="padding-bottom: 16px;"><img src="${finalLogo}" width="52" height="52" style="border-radius: 10px; display: block; border: 1px solid #eeeeee; object-fit: cover;" alt="${company}" /></td></tr>
    <tr><td class="sig-name" style="font-size: 18px; font-weight: 700; color: ${isForCopy ? colors.light.name : currentColors.name}; padding-bottom: 4px;"><span style="color: ${isForCopy ? colors.light.name : currentColors.name};">${name || 'Nom'}</span></td></tr>
    <tr><td class="sig-title" style="font-size: 13px; color: ${isForCopy ? colors.light.title : currentColors.title}; padding-bottom: 12px; line-height: 1.4;"><span style="color: ${isForCopy ? colors.light.title : currentColors.title};">${title}</span></td></tr>
    <tr><td class="sig-meta" style="font-size: 13px; color: ${isForCopy ? colors.light.meta : currentColors.meta}; padding-bottom: 6px;"><span style="color: ${isForCopy ? colors.light.meta : currentColors.meta};">${contactParts.join(' <span style="color: #d1d5db; margin: 0 4px;">&bull;</span> ')}</span></td></tr>
    <tr><td style="font-size: 13px; padding-bottom: 16px;"><a href="https://${linkedin.replace('https://', '')}" style="color: #0077b5; text-decoration: none; font-weight: 600;">LinkedIn</a></td></tr>
    ${availabilityText ? `<tr><td class="sig-meta" style="border-top: 1px solid #f3f4f6; padding-top: 12px; padding-bottom: 12px; font-size: 12px; color: ${isForCopy ? colors.light.meta : currentColors.meta}; font-style: italic; line-height: 1.5;"><span style="color: ${isForCopy ? colors.light.meta : currentColors.meta};">${availabilityText}</span></td></tr>` : ''}
    ${newsletterUrl ? `<tr><td class="sig-cta" style="background-color: ${isForCopy ? colors.light.bgCta : currentColors.bgCta}; border-radius: 8px; padding: 14px; border: 1px solid ${isForCopy ? colors.light.borderCta : currentColors.borderCta};"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="vertical-align: middle; padding-right: 12px; width: 24px;"><span style="font-size: 20px; line-height: 1;">📬</span></td><td style="vertical-align: middle;"><a class="sig-cta-link" href="${newsletterUrl}" style="text-decoration: none; color: ${isForCopy ? colors.light.textCta : currentColors.textCta}; font-size: 13px; font-weight: 700; line-height: 1.4; display: block;">${ctaText}</a></td></tr></table></td></tr>` : ''}
  </table>
</div>`.trim();
  };

  const copyRichText = async () => {
    const html = generateSignatureHTML(true);
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([formData.name], { type: 'text/plain' }) })];
      await navigator.clipboard.write(data);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(null), 3000);
    } catch (err) {
      const range = document.createRange();
      range.selectNode(signatureRef.current);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      setCopyStatus('success');
      setTimeout(() => setCopyStatus(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans selection:bg-amber-100 flex flex-col items-center">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[100%] md:w-[40%] h-[40%] bg-amber-100/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[100%] md:w-[35%] h-[35%] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <div className={`w-full max-w-6xl px-4 py-8 md:py-16 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <header className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 shadow-sm text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Heart size={10} className="text-rose-400 fill-rose-400" /> Signy App
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-4 italic">Signy.</h1>
          <p className="text-slate-500 text-sm md:text-xl max-w-md mx-auto leading-relaxed">Générateur de signatures élégantes et haute-résilience.</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <section className="bg-white p-6 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-white space-y-6 order-1">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-2"><Layout size={14} /> Profil</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nom" name="name" value={formData.name} onChange={handleInputChange} icon={<User size={18} />} />
              <InputField label="Entreprise" name="company" value={formData.company} onChange={handleInputChange} icon={<Briefcase size={18} />} />
            </div>
            <TextAreaField label="Poste" name="title" value={formData.title} onChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Mobile" name="phone" value={formData.phone} onChange={handleInputChange} icon={<Phone size={18} />} />
              <InputField label="Site" name="website" value={formData.website} onChange={handleInputChange} icon={<Globe size={18} />} />
            </div>
            <InputField label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleInputChange} icon={<Linkedin size={18} />} />
            <InputField label="Logo URL" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} icon={<ImageIcon size={18} />} placeholder="Laissez vide pour avatar auto" />
            <div className="pt-6 border-t border-slate-50 space-y-4">
              <InputField label="Lien Newsletter" name="newsletterUrl" value={formData.newsletterUrl} onChange={handleInputChange} icon={<Mail size={18} />} />
              <TextAreaField label="Accroche Newsletter" name="ctaText" value={formData.ctaText} onChange={handleInputChange} />
              <TextAreaField label="Disponibilité" name="availabilityText" value={formData.availabilityText} onChange={handleInputChange} />
            </div>
            <button onClick={copyRichText} className="w-full bg-slate-900 text-white py-5 px-6 rounded-3xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
              {copyStatus === 'success' ? <Check size={22} className="text-emerald-400" /> : <Copy size={22} />}
              {copyStatus === 'success' ? 'Copié !' : 'Copier pour Gmail'}
            </button>
          </section>

          <section className="lg:sticky lg:top-8 space-y-6 order-2">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aperçu</h2>
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                <button onClick={() => setPreviewTheme('light')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'light' ? 'bg-amber-100 text-amber-700' : 'text-slate-300'}`}><Sun size={18} /></button>
                <button onClick={() => setPreviewTheme('dark')} className={`p-2.5 rounded-xl transition-all ${previewTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-300'}`}><Moon size={18} /></button>
              </div>
            </div>
            <div className={`w-full min-h-[450px] rounded-[3.5rem] p-10 transition-all duration-500 border-8 ${previewTheme === 'light' ? 'bg-white border-white shadow-2xl shadow-slate-200/40' : 'bg-slate-900 border-slate-800 shadow-2xl'}`}>
              <div className={`mb-12 flex gap-3 opacity-10 ${previewTheme === 'dark' ? 'invert' : ''}`}><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /></div>
              <div ref={signatureRef} className="w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: generateSignatureHTML() }} />
            </div>
            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden group">
               <Zap className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform" size={100} />
               <h4 className="font-bold text-xs flex items-center gap-2 mb-4 text-amber-400"><MousePointer2 size={16} /> Guide Rapide</h4>
               <ul className="text-[11px] text-slate-400 space-y-3 leading-relaxed relative z-10">
                 <li className="flex gap-2"><span>&bull;</span> Modifiez vos infos à gauche.</li>
                 <li className="flex gap-2"><span>&bull;</span> Cliquez sur "Copier pour Gmail".</li>
                 <li className="flex gap-2"><span>&bull;</span> Collez dans vos réglages mail.</li>
               </ul>
            </div>
          </section>
        </main>
      </div>
      <footer className="mt-8 md:mt-16 text-slate-300 text-[10px] uppercase tracking-[0.5em] pb-12 font-black">Signy &bull; 2026</footer>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon, placeholder }) => (
  <div className="space-y-2 group flex-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-300 group-focus-within:text-slate-900 transition-colors">{icon}</div>
      <input type="text" name={name} value={value} onChange={onChange} autoComplete="off" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm text-slate-700" placeholder={placeholder} />
    </div>
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <textarea name={name} value={value} onChange={onChange} rows="2" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all text-sm text-slate-700 resize-none" />
  </div>
);

// Initialisation sécurisée du rendu React
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
