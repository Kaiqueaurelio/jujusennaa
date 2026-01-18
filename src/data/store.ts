import productPlanner from '@/assets/product-planner.jpg';
import productEstudos from '@/assets/product-estudos.jpg';
import productSocial from '@/assets/product-social.jpg';
import productIA from '@/assets/product-ia.jpg';
import productFaculdade from '@/assets/product-faculdade.jpg';

export interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  featured: boolean;
  order: number;
  active: boolean;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: 'social' | 'content' | 'store';
  clicks: number;
  order: number;
  active: boolean;
}

export interface Profile {
  name: string;
  bio: string;
  avatar: string;
  whatsapp: string;
}

export const initialProfile: Profile = {
  name: "Decode Analytics",
  bio: "Transformando dados em decisões. Conteúdos, templates e ferramentas para impulsionar sua jornada digital.",
  avatar: "",
  whatsapp: "5511939222885",
};

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Planner 2026",
    description: "Organize seu ano com o planner mais completo do mercado",
    fullDescription: "O Planner 2026 é uma ferramenta completa de organização anual. Inclui: calendário mensal, planejador semanal, tracker de hábitos, metas SMART, revisões mensais e muito mais. Ideal para quem quer produtividade máxima.",
    price: 47.90,
    originalPrice: 97.90,
    image: productPlanner,
    category: "Organização",
    tags: ["Novo", "Mais vendido"],
    featured: true,
    order: 1,
    active: true,
  },
  {
    id: "2",
    name: "Estudos Caderno",
    description: "Template completo para organização de estudos",
    fullDescription: "Caderno digital pensado para estudantes. Contém: cronograma de estudos, flashcards, resumos, mapas mentais, tracker de progresso e sistema de revisão espaçada. Compatível com iPad e tablets Android.",
    price: 37.90,
    image: productEstudos,
    category: "Educação",
    tags: ["Popular"],
    featured: true,
    order: 2,
    active: true,
  },
  {
    id: "3",
    name: "Social Media Turbo",
    description: "Kit completo para gestão de redes sociais",
    fullDescription: "Pacote completo para gestores de redes sociais: calendário de conteúdo, banco de ideias, templates de posts, análise de métricas, planejador de stories e muito mais. Aumente seu engajamento em 300%.",
    price: 67.90,
    originalPrice: 127.90,
    image: productSocial,
    category: "Marketing",
    tags: ["Promoção"],
    featured: true,
    order: 3,
    active: true,
  },
  {
    id: "4",
    name: "Super Mente IA",
    description: "Domine a inteligência artificial com prompts profissionais",
    fullDescription: "Mais de 500 prompts profissionais para ChatGPT, Claude, Gemini e outras IAs. Organize seu fluxo de trabalho com IA e aumente sua produtividade em 10x. Inclui atualizações vitalícias.",
    price: 57.90,
    image: productIA,
    category: "Tecnologia",
    tags: ["Novo"],
    featured: true,
    order: 4,
    active: true,
  },
  {
    id: "5",
    name: "Faculdade 2025",
    description: "Template definitivo para universitários",
    fullDescription: "O template mais completo para estudantes universitários: gestão de disciplinas, TCC tracker, organizador de provas, controle de notas, biblioteca de referências e muito mais.",
    price: 47.90,
    image: productFaculdade,
    category: "Educação",
    tags: ["Mais vendido"],
    featured: true,
    order: 5,
    active: true,
  },
];

export const initialLinks: Link[] = [
  {
    id: "1",
    title: "Portfólio Behance",
    url: "https://www.behance.net/decodeanalytics",
    icon: "Palette",
    category: "content",
    clicks: 0,
    order: 1,
    active: true,
  },
  {
    id: "2",
    title: "📚 Ebook Grátis",
    url: "https://www.terabox.com/portuguese/sharing/link?surl=Y28Mm3a0H-XCiNn3pejMXw",
    icon: "BookOpen",
    category: "content",
    clicks: 0,
    order: 2,
    active: true,
  },
  {
    id: "3",
    title: "🌐 Site Oficial",
    url: "https://decoanalytics.wixsite.com/decodeanalytics",
    icon: "Globe",
    category: "content",
    clicks: 0,
    order: 3,
    active: true,
  },
  {
    id: "4",
    title: "Instagram",
    url: "https://instagram.com/decode.analytics",
    icon: "Instagram",
    category: "social",
    clicks: 0,
    order: 4,
    active: true,
  },
  {
    id: "5",
    title: "📱 Catálogo WhatsApp",
    url: "https://wa.me/c/5511939222885",
    icon: "MessageCircle",
    category: "store",
    clicks: 0,
    order: 5,
    active: true,
  },
];

// WhatsApp message generator
export const generateWhatsAppLink = (product: Product, whatsapp: string): string => {
  const message = encodeURIComponent(
    `Olá! Quero comprar o produto *${product.name}*\n` +
    `💰 Valor: R$ ${product.price.toFixed(2).replace('.', ',')}\n` +
    `🆔 Código: ${product.id}\n` +
    `📲 Origem: Link na Bio\n\n` +
    `Pode me informar as formas de pagamento?`
  );
  return `https://wa.me/${whatsapp}?text=${message}`;
};
