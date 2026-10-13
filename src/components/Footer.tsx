import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export function Footer() {
  const { data: profile } = useProfile();

  const whatsappUrl = profile?.whatsapp
    ? `https://wa.me/${profile.whatsapp}`
    : '#';

  const externalLinks = [
    { label: 'WhatsApp', href: whatsappUrl },
    { label: 'Instagram', href: 'https://instagram.com/juju.sennaa' },
    { label: 'Email', href: 'mailto:juju.senna@admin.br' },
  ];

  const siteLinks = [
    { label: 'Loja', to: '/#loja' },
    { label: 'Links', to: '/#links' },
    { label: 'Admin', to: '/admin' },
  ];

  const legalLinks = [
    { label: 'Termos de Uso', to: '/termos' },
    { label: 'Privacidade', to: '/privacidade' },
    { label: 'Contato', to: '/contato' },
  ];

  return (
    <footer className="mt-12 pt-8 pb-6 px-4 border-t border-border/30">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8">
          <ul className="space-y-2">
            {externalLinks.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground/80 hover:underline transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {siteLinks.map(link => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground/80 hover:underline transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {legalLinks.map(link => (
              <li key={link.label}>
                <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground/80 hover:underline transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} Juju Senna
        </p>
      </div>
    </footer>
  );
}
