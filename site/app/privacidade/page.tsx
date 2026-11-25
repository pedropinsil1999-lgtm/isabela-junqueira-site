import type { Metadata } from 'next';
import { estudio } from '@/data/estudio';

export const metadata: Metadata = {
  title: 'Privacidade',
  description: 'Como os dados enviados por este site são tratados.',
};

const blocos = [
  {
    t: 'O que este site coleta',
    p: [
      'Este site não tem servidor próprio nem banco de dados. O briefing que você preenche fica apenas no seu navegador, na memória da aba, e é apagado quando você fecha a aba.',
      'Quando você clica em enviar, a mensagem é montada no seu navegador e aberta direto no WhatsApp. Nada passa por um servidor nosso no caminho.',
    ],
  },
  {
    t: 'O que as ferramentas de medição recebem',
    p: [
      'Quando o site estiver no ar com medição ativa, as ferramentas de análise recebem apenas dados agregados: tipo de projeto, região, faixa escolhida e em qual passo do briefing a pessoa parou.',
      'Nome e telefone nunca são enviados para nenhuma ferramenta de análise.',
    ],
  },
  {
    t: 'Seus direitos (LGPD)',
    p: [
      'A Lei Geral de Proteção de Dados garante a você o direito de confirmar o tratamento, acessar, corrigir, anonimizar, portar e eliminar seus dados, além de revogar o consentimento a qualquer momento.',
      'Como o contato chega por WhatsApp, os dados que você enviar ficam nessa conversa. Para pedir a exclusão, basta solicitar pelo mesmo canal.',
    ],
  },
];

export default function Pagina() {
  return (
    <section data-tema="claro" className="secao-clara min-h-screen px-6 pt-32 pb-28 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[70ch]">
        
        <h1 className="mt-5" style={{ fontSize: 'var(--text-t2)' }}>
          O que acontece com <em className="text-[var(--color-madeira-500)]">o que você escreve</em>
        </h1>

        {/* // TODO (jurídico): revisar este texto com o advogado da cliente antes de publicar. */}
        {!estudio.legal.privacidadeRevisada && (
          <p className="mt-8 border-l-2 border-[var(--color-madeira-500)] bg-[color-mix(in_srgb,var(--color-madeira-500)_8%,transparent)] px-5 py-4 text-[14px]">
            Texto base, ainda em revisão jurídica.
          </p>
        )}

        {blocos.map((b) => (
          <div key={b.t} className="mt-12">
            <h2 className="text-t3">{b.t}</h2>
            {b.p.map((t, i) => (
              <p key={i} className="mt-4 text-corpo-lg font-light text-[color-mix(in_srgb,var(--color-tinta)_80%,transparent)]">
                {t}
              </p>
            ))}
          </div>
        ))}

        <div className="mt-12 border-t border-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] pt-6">
          <h2 className="text-t3">Contato</h2>
          <p className="mt-4">
            Qualquer dúvida sobre seus dados:{' '}
            <a
              href={`https://wa.me/${estudio.whatsapp.numero}`}
              target="_blank" rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {estudio.whatsapp.exibicao}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
