import { HeaderProfile } from '@/components/HeaderProfile';
import { LinksSection } from '@/components/LinksSection';
import { ProductSection } from '@/components/ProductSection';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-10 container max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Admin link */}
        <Link 
          to="/admin" 
          className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          aria-label="Admin"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>

        <div className="space-y-10">
          <HeaderProfile />
          <LinksSection />
          <ProductSection />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Decode Analytics
          </p>
        </footer>
      </div>

      <FloatingWhatsApp />
    </div>
  );
};

export default Index;
