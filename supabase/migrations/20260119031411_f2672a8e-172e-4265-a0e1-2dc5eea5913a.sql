-- Create profiles table for storing user profile information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Decode Analytics',
  bio TEXT NOT NULL DEFAULT 'Transformando dados em decisões.',
  avatar_url TEXT,
  whatsapp TEXT NOT NULL DEFAULT '5511939222885',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Geral',
  tags TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create links table
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Link',
  category TEXT NOT NULL DEFAULT 'content',
  clicks INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read, authenticated write)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view the data)
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view links" ON public.links FOR SELECT USING (true);

-- Authenticated write policies (only authenticated users can modify)
CREATE POLICY "Authenticated users can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete profiles" ON public.profiles FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert links" ON public.links FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update links" ON public.links FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete links" ON public.links FOR DELETE USING (true);

-- Public can increment clicks on links
CREATE POLICY "Anyone can update link clicks" ON public.links FOR UPDATE USING (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated can update images" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Authenticated can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial profile
INSERT INTO public.profiles (name, bio, whatsapp) 
VALUES ('Decode Analytics', 'Transformando dados em decisões. Conteúdos, templates e ferramentas para impulsionar sua jornada digital.', '5511939222885');

-- Insert initial products
INSERT INTO public.products (name, description, full_description, price, original_price, category, tags, featured, sort_order) VALUES
  ('Planner 2026', 'Organize seu ano com o planner mais completo do mercado', 'O Planner 2026 é uma ferramenta completa de organização anual. Inclui: calendário mensal, planejador semanal, tracker de hábitos, metas SMART, revisões mensais e muito mais. Ideal para quem quer produtividade máxima.', 47.90, 97.90, 'Organização', ARRAY['Novo', 'Mais vendido'], true, 1),
  ('Estudos Caderno', 'Template completo para organização de estudos', 'Caderno digital pensado para estudantes. Contém: cronograma de estudos, flashcards, resumos, mapas mentais, tracker de progresso e sistema de revisão espaçada. Compatível com iPad e tablets Android.', 37.90, NULL, 'Educação', ARRAY['Popular'], true, 2),
  ('Social Media Turbo', 'Kit completo para gestão de redes sociais', 'Pacote completo para gestores de redes sociais: calendário de conteúdo, banco de ideias, templates de posts, análise de métricas, planejador de stories e muito mais. Aumente seu engajamento em 300%.', 67.90, 127.90, 'Marketing', ARRAY['Promoção'], true, 3),
  ('Super Mente IA', 'Domine a inteligência artificial com prompts profissionais', 'Mais de 500 prompts profissionais para ChatGPT, Claude, Gemini e outras IAs. Organize seu fluxo de trabalho com IA e aumente sua produtividade em 10x. Inclui atualizações vitalícias.', 57.90, NULL, 'Tecnologia', ARRAY['Novo'], true, 4),
  ('Faculdade 2025', 'Template definitivo para universitários', 'O template mais completo para estudantes universitários: gestão de disciplinas, TCC tracker, organizador de provas, controle de notas, biblioteca de referências e muito mais.', 47.90, NULL, 'Educação', ARRAY['Mais vendido'], true, 5);

-- Insert initial links
INSERT INTO public.links (title, url, icon, category, sort_order) VALUES
  ('Portfólio Behance', 'https://www.behance.net/decodeanalytics', 'Palette', 'content', 1),
  ('📚 Ebook Grátis', 'https://www.terabox.com/portuguese/sharing/link?surl=Y28Mm3a0H-XCiNn3pejMXw', 'BookOpen', 'content', 2),
  ('🌐 Site Oficial', 'https://decoanalytics.wixsite.com/decodeanalytics', 'Globe', 'content', 3),
  ('Instagram', 'https://instagram.com/decode.analytics', 'Instagram', 'social', 4),
  ('📱 Catálogo WhatsApp', 'https://wa.me/c/5511939222885', 'MessageCircle', 'store', 5);