import { useState, useEffect } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useLinks, Link } from '@/hooks/useLinks';
import { ProductModal } from './ProductModal';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { ShoppingBag, ExternalLink, Tag } from 'lucide-react';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const { data: products } = useProducts();
  const { data: links } = useLinks();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeProducts = products?.filter(p => p.active) || [];
  const activeLinks = links?.filter(l => l.active) || [];

  const handleSelectProduct = (product: Product) => {
    onOpenChange(false);
    setSelectedProduct(product);
  };

  const handleSelectLink = (link: Link) => {
    onOpenChange(false);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Buscar produtos, links..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          {activeProducts.length > 0 && (
            <CommandGroup heading="Produtos">
              {activeProducts.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => handleSelectProduct(product)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                  </div>
                  <span className="text-xs font-semibold text-primary">
                    {product.price != null ? `R$ ${product.price.toFixed(2)}` : 'Sob consulta'}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {activeProducts.length > 0 && activeLinks.length > 0 && <CommandSeparator />}

          {activeLinks.length > 0 && (
            <CommandGroup heading="Links">
              {activeLinks.map((link) => (
                <CommandItem
                  key={link.id}
                  value={link.title}
                  onSelect={() => handleSelectLink(link)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{link.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(() => { try { return new URL(link.url).hostname; } catch { return link.url; } })()}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
