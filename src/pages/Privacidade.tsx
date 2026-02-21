import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <span className="text-lg font-black text-primary ml-auto">DECODE</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 21 de fevereiro de 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Dados Coletados</h2>
            <p className="mb-3">A Decode Analytics coleta os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-foreground">Dados de cadastro:</strong> nome, e-mail, número de WhatsApp</li>
              <li><strong className="text-foreground">Dados de navegação:</strong> páginas visitadas, tempo de permanência, cliques em produtos e links</li>
              <li><strong className="text-foreground">Dados de dispositivo:</strong> tipo de navegador, sistema operacional, resolução de tela</li>
              <li><strong className="text-foreground">Dados de compra:</strong> produtos adquiridos, valores, datas de transação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Como Utilizamos seus Dados</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Processar e entregar produtos e serviços adquiridos</li>
              <li>Enviar notificações sobre novos produtos, promoções e atualizações (mediante consentimento)</li>
              <li>Melhorar a experiência de navegação e personalizar conteúdo</li>
              <li>Gerar estatísticas internas e análises de desempenho da Plataforma</li>
              <li>Prevenir fraudes e garantir a segurança da Plataforma</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Cookies e Rastreamento</h2>
            <p className="mb-3">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência na Plataforma. Os cookies utilizados incluem:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong className="text-foreground">Cookies essenciais:</strong> necessários para o funcionamento básico da Plataforma</li>
              <li><strong className="text-foreground">Cookies de desempenho:</strong> coletam informações sobre como você utiliza a Plataforma</li>
              <li><strong className="text-foreground">Cookies de funcionalidade:</strong> permitem lembrar suas preferências (tema, idioma)</li>
            </ul>
            <p className="mt-3">
              Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. A desativação de cookies essenciais pode afetar o funcionamento da Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Compartilhamento com Terceiros</h2>
            <p className="mb-3">Seus dados pessoais poderão ser compartilhados com:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Processadores de pagamento para efetivação de transações</li>
              <li>Serviços de hospedagem e infraestrutura tecnológica</li>
              <li>Autoridades competentes, quando exigido por lei ou ordem judicial</li>
            </ul>
            <p className="mt-3">
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing sem seu consentimento expresso.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Seus Direitos (LGPD)</h2>
            <p className="mb-3">
              Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Confirmar a existência de tratamento de seus dados pessoais</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Solicitar a portabilidade dos dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a eliminação dos dados tratados com base no consentimento</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato conosco através da página de <Link to="/contato" className="text-primary hover:underline">Contato</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Retenção de Dados</h2>
            <p>
              Seus dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades para as quais foram coletados, incluindo obrigações legais, contratuais, de prestação de contas ou requisição de autoridades competentes. Dados de transações comerciais são mantidos por no mínimo 5 (cinco) anos, conforme legislação fiscal brasileira.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acessos não autorizados, alteração, divulgação ou destruição. Utilizamos criptografia, controles de acesso e monitoramento contínuo para garantir a segurança das informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contato do Responsável</h2>
            <p>
              Para questões relacionadas à privacidade e proteção de dados, entre em contato com nosso responsável:
            </p>
            <ul className="mt-2 space-y-1">
              <li>📧 E-mail: <a href="mailto:contato@decode.com" className="text-primary hover:underline">contato@decode.com</a></li>
              <li>📄 Página de contato: <Link to="/contato" className="text-primary hover:underline">Contato</Link></li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
