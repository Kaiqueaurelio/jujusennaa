 // Product image imports for neon-style images
 import gestaoMidias from '@/assets/products/gestao-midias.jpg';
 import formatacaoPc from '@/assets/products/formatacao-pc.jpg';
 import criacaoApps from '@/assets/products/criacao-apps.jpg';
 import animacaoFotos from '@/assets/products/animacao-fotos.jpg';
 import planner2025 from '@/assets/products/planner-2025.jpg';
 import edicaoVideos from '@/assets/products/edicao-videos.jpg';
 import criacaoSites from '@/assets/products/criacao-sites.jpg';
 import identidadeVisual from '@/assets/products/identidade-visual.jpg';
 import templateNotion from '@/assets/products/template-notion.jpg';
 import remocaoFundo from '@/assets/products/remocao-fundo.jpg';
 import office365 from '@/assets/products/office-365.jpg';
 import formatacaoIos from '@/assets/products/formatacao-ios.jpg';
 import formatacaoAndroid from '@/assets/products/formatacao-android.jpg';
 import coberturaEventos from '@/assets/products/cobertura-eventos.jpg';
 import trabalhosAcademicos from '@/assets/products/trabalhos-academicos.jpg';
 import edicaoAudio from '@/assets/products/edicao-audio.jpg';
 import cadernoEstudos from '@/assets/products/caderno-estudos.jpg';
 import bannersAcademicos from '@/assets/products/banners-academicos.jpg';
 import hackpromptChatgpt from '@/assets/products/hackprompt-chatgpt.jpg';
 import registroHabitos from '@/assets/products/registro-habitos.jpg';
 import cartoesVisita from '@/assets/products/cartoes-visita.jpg';
 import tratamentoPele from '@/assets/products/tratamento-pele.jpg';
 import restauracaoImagens from '@/assets/products/restauracao-imagens.jpg';
 import remocaoObjetos from '@/assets/products/remocao-objetos.jpg';
 import designSocialAvulso from '@/assets/products/design-social-avulso.jpg';
 import designSocialMensal from '@/assets/products/design-social-mensal.jpg';
 import gameDash from '@/assets/products/game-dash.jpg';
 import mapeamentoMetas from '@/assets/products/mapeamento-metas.jpg';
 import plannerBook from '@/assets/products/planner-book.jpg';
 import cardsAdvanced from '@/assets/products/cards-advanced.jpg';
 import plannerEstudos from '@/assets/products/planner-estudos.jpg';
 import planejamentoSocial from '@/assets/products/planejamento-social.jpg';
 
 export const productImageMap: Record<string, string> = {
   'gestao-midias': gestaoMidias,
   'formatacao-pc': formatacaoPc,
   'criacao-apps': criacaoApps,
   'animacao-fotos': animacaoFotos,
   'planner-2025': planner2025,
   'edicao-videos': edicaoVideos,
   'criacao-sites': criacaoSites,
   'identidade-visual': identidadeVisual,
   'template-notion': templateNotion,
   'remocao-fundo': remocaoFundo,
   'office-365': office365,
   'formatacao-ios': formatacaoIos,
   'formatacao-android': formatacaoAndroid,
   'cobertura-eventos': coberturaEventos,
   'trabalhos-academicos': trabalhosAcademicos,
   'edicao-audio': edicaoAudio,
   'caderno-estudos': cadernoEstudos,
   'banners-academicos': bannersAcademicos,
   'hackprompt-chatgpt': hackpromptChatgpt,
   'registro-habitos': registroHabitos,
   'cartoes-visita': cartoesVisita,
   'tratamento-pele': tratamentoPele,
   'restauracao-imagens': restauracaoImagens,
   'remocao-objetos': remocaoObjetos,
   'design-social-avulso': designSocialAvulso,
   'design-social-mensal': designSocialMensal,
   'game-dash': gameDash,
   'mapeamento-metas': mapeamentoMetas,
   'planner-book': plannerBook,
   'cards-advanced': cardsAdvanced,
   'planner-estudos': plannerEstudos,
   'planejamento-social': planejamentoSocial,
 };
 
 export function getProductImage(imagePath: string | null): string | null {
   if (!imagePath) return null;
   
   // Extract the filename without extension from the path
   const match = imagePath.match(/\/([^/]+)\.\w+$/);
   if (match) {
     const key = match[1];
     if (productImageMap[key]) {
       return productImageMap[key];
     }
   }
   
   // If it's a full URL, return as-is
   if (imagePath.startsWith('http')) {
     return imagePath;
   }
   
   return imagePath;
 }