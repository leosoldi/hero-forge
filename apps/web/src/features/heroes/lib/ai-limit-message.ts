import type { AiProviderInfo } from '../types';

export function aiLimitMessage(info: AiProviderInfo | undefined): string {
  if (!info) {
    return 'A IA generativa tem um limite diário de uso. Se ele for atingido, tente novamente mais tarde.';
  }

  if (info.provider === 'demo' || info.daily_limit === null) {
    return 'Modo demonstração: as sugestões são geradas localmente, sem limite diário e sem custo. Configure a Cloudflare na API para usar a IA real.';
  }

  return `IA da Cloudflare Workers AI no plano gratuito: cerca de ${info.daily_limit} sugestões por dia (texto + imagem). A cota renova todo dia às ${toBrasilia(info.resets_at_utc)} (horário de Brasília). Se acabar, a sugestão fica indisponível até a renovação.`;
}

function toBrasilia(utcTime: string | null): string {
  if (!utcTime) return '21h';

  const [hours, minutes] = utcTime.split(':').map(Number);
  const local = (hours - 3 + 24) % 24;
  return minutes ? `${local}h${String(minutes).padStart(2, '0')}` : `${local}h`;
}
