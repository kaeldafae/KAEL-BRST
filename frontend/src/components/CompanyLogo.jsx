export default function CompanyLogo({ company, size = 40, className = '' }) {
  if (!company) return null;
  const vip = company.tier === 'premium';
  const style = { width: size, height: size, minWidth: size };

  if (company.logo) {
    return (
      <img src={company.logo} alt={company.name} style={style}
        className={`rounded-full object-cover border ${vip ? 'border-[#D4AF37]/50' : 'border-[#366A8B]/20'} ${className}`} />
    );
  }
  const initials = company.name
    .split(/\s+/)
    .filter((w) => !['de', 'y', 'la', 'del'].includes(w.toLowerCase()))
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div style={style} data-testid={`company-logo-${company.id}`}
      className={`rounded-full flex items-center justify-center font-display font-semibold border ${
        vip ? 'bg-[#0A1128] text-[#E5C158] border-[#D4AF37]/50' : 'bg-[#EAF2F7] text-[#366A8B] border-[#366A8B]/20'
      } ${className}`}
      aria-label={company.name}>
      <span style={{ fontSize: size * 0.36 }}>{initials}</span>
    </div>
  );
}
