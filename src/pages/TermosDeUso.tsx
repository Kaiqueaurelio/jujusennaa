import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </Link>
          <span className="text-lg font-black text-primary ml-auto">JUJU SENNA</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-8">Última atualização: 21 de fevereiro de 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma Juju Senna ("Plataforma"), você concorda integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição aqui descrita, solicitamos que não utilize nossos serviços. O uso continuado da Plataforma após quaisquer alterações nestes Termos constitui aceitação das modificações realizadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Descrição dos Serviços</h2>
            <p className="mb-3">
              A Juju Senna é uma plataforma digital que oferece produtos e serviços nas seguintes categorias:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Produtos digitais: planners, templates, cadernos de estudos, organização pessoal</li>
              <li>Design e criação: identidade visual, social media, banners, cartões de visita</li>
              <li>Edição e mídia: edição de vídeos, áudio, animação de fotos, tratamento de imagens</li>
              <li>Tecnologia: criação de sites, aplicativos, ferramentas de IA, formatação de dispositivos</li>
              <li>Gestão digital: gestão de mídias sociais, planejamento de conteúdo</li>
              <li>Serviços acadêmicos: trabalhos acadêmicos, formatação ABNT, banners científicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponibilizado na Plataforma, incluindo mas não se limitando a textos, imagens, logotipos, ícones, templates, planners e materiais digitais, é de propriedade exclusiva da Juju Senna ou de seus licenciadores. É expressamente proibida a reprodução, distribuição, modificação ou comercialização de qualquer conteúdo sem autorização prévia por escrito.
            </p>
            <p className="mt-3">
              Ao adquirir um produto digital, o usuário recebe uma licença de uso pessoal e intransferível. A revenda, redistribuição ou compartilhamento dos produtos adquiridos é estritamente proibida e pode resultar em medidas legais cabíveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Pagamentos e Reembolsos</h2>
            <p className="mb-3">
              Os preços dos produtos e serviços são exibidos na Plataforma em Reais (BRL) e podem ser alterados a qualquer momento sem aviso prévio, exceto para pedidos já confirmados.
            </p>
            <p className="mb-3">
              <strong className="text-foreground">Política de Reembolso:</strong> Por se tratarem de produtos digitais de entrega imediata, conforme o Art. 49 do Código de Defesa do Consumidor, o prazo para desistência é de 7 (sete) dias corridos a partir da data de recebimento/acesso ao produto. Para solicitar reembolso, entre em contato através dos nossos canais de atendimento.
            </p>
            <p>
              Para serviços personalizados (design, edição, desenvolvimento), o reembolso será avaliado caso a caso, considerando o andamento e entrega parcial do trabalho.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Responsabilidades do Usuário</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Fornecer informações verdadeiras e atualizadas no momento do cadastro e da compra</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Utilizar os produtos e serviços adquiridos de acordo com a legislação vigente</li>
              <li>Não tentar acessar áreas restritas da Plataforma ou interferir em seu funcionamento</li>
              <li>Respeitar os direitos de propriedade intelectual da Juju Senna e de terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitação de Responsabilidade</h2>
            <p>
              A Juju Senna não se responsabiliza por danos indiretos, incidentais ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma. Não garantimos que os serviços serão ininterruptos ou livres de erros. Em nenhuma hipótese nossa responsabilidade total excederá o valor pago pelo usuário nos últimos 12 meses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Modificações nos Termos</h2>
            <p>
              A Juju Senna reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação na Plataforma. Recomendamos a revisão periódica destes Termos. O uso continuado da Plataforma após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Legislação Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas decorrentes destes Termos serão submetidas ao foro da comarca do domicílio do usuário, conforme previsto no Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contato</h2>
            <p>
              Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="mt-2 space-y-1">
              <li>📧 E-mail: <a href="mailto:decoanalytics@outlook.com.br" className="text-primary hover:underline">decoanalytics@outlook.com.br</a></li>
              <li>💬 WhatsApp: disponível na página de <Link to="/contato" className="text-primary hover:underline">Contato</Link></li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
