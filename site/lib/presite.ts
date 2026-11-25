/**
 * Modo pré-site: noindex/nofollow e analytics desligado.
 * Nada na interface menciona protótipo.
 */
export const PRESITE = process.env.NEXT_PUBLIC_PRESITE === 'true';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://isabelajunqueira.com.br';

/** Eventos de analytics. No modo pré-site vira no-op. Nunca recebe nome nem telefone. */
type Evento =
  | { nome: 'briefing_aberto'; origem: string }
  | { nome: 'briefing_passo'; passo: number }
  | { nome: 'briefing_concluido'; tipo: string; local: string; faixa: string }
  | { nome: 'whatsapp_clique'; secao: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function evento(e: Evento) {
  if (PRESITE || typeof window === 'undefined') return;
  const { nome, ...resto } = e;
  window.gtag?.('event', nome, resto);
  window.fbq?.('trackCustom', nome, resto);
}

/**
 * Ponto de extensão para um CRM futuro. Hoje não faz nada e não envia nada:
 * o briefing sai pelo WhatsApp, por ação da pessoa. Deixado isolado de propósito.
 */
export async function submitLead(_dados: Record<string, unknown>): Promise<void> {
  // Intencionalmente vazio. Ver DECISOES.md: nada vai para servidor.
  return;
}
