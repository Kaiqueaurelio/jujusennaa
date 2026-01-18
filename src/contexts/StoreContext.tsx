import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Link, Profile, initialProducts, initialLinks, initialProfile } from '@/data/store';

interface StoreContextType {
  products: Product[];
  links: Link[];
  profile: Profile;
  updateProduct: (product: Product) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateLink: (link: Link) => void;
  addLink: (link: Omit<Link, 'id'>) => void;
  deleteLink: (id: string) => void;
  updateProfile: (profile: Profile) => void;
  incrementLinkClick: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('decode_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [links, setLinks] = useState<Link[]>(() => {
    const saved = localStorage.getItem('decode_links');
    return saved ? JSON.parse(saved) : initialLinks;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('decode_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  useEffect(() => {
    localStorage.setItem('decode_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('decode_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('decode_profile', JSON.stringify(profile));
  }, [profile]);

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateLink = (link: Link) => {
    setLinks(prev => prev.map(l => l.id === link.id ? link : l));
  };

  const addLink = (link: Omit<Link, 'id'>) => {
    const newLink: Link = {
      ...link,
      id: Date.now().toString(),
    };
    setLinks(prev => [...prev, newLink]);
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  const incrementLinkClick = (id: string) => {
    setLinks(prev => prev.map(l => 
      l.id === id ? { ...l, clicks: l.clicks + 1 } : l
    ));
  };

  return (
    <StoreContext.Provider value={{
      products,
      links,
      profile,
      updateProduct,
      addProduct,
      deleteProduct,
      updateLink,
      addLink,
      deleteLink,
      updateProfile,
      incrementLinkClick,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
