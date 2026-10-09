import type { PropertyInfo, RoomData, Signatures } from './types';
import { validateCpfCnpj } from './utils';
import { hasAnyReading, parseReading } from './meters';

export interface AuditIssue {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  /** passo do wizard onde corrigir (0 imóvel, 1 partes, 2 cômodos, 3 inventário, 4 fotos, 5 revisão) */
  step: number;
  roomId?: string;
}

export interface AuditResult { score: number; issues: AuditIssue[]; errors: number; warnings: number }

/** Revisão de qualidade do laudo antes de gerar o PDF (regras determinísticas, sem IA). */
export function auditLaudo(info: PropertyInfo, rooms: RoomData[], signatures: Signatures = {}, hasLink = false): AuditResult {
  const issues: AuditIssue[] = [];
  const add = (i: AuditIssue) => issues.push(i);

  if (!info.endereco.trim()) add({ id: 'endereco', level: 'error', step: 0, message: 'Informe o endereço do imóvel.' });
  if (!info.cidade.trim()) add({ id: 'cidade', level: 'warn', step: 0, message: 'Informe a cidade (aparece na assinatura do laudo).' });
  if (!info.tipoImovel.trim()) add({ id: 'tipo', level: 'error', step: 0, message: 'Selecione o tipo do imóvel.' });
  if (!info.metragem.trim()) add({ id: 'metragem', level: 'warn', step: 0, message: 'Metragem não informada.' });
  if (!info.locadora.trim()) add({ id: 'locadora', level: 'error', step: 1, message: 'Informe a locadora.' });
  if (!info.locatario.trim()) add({ id: 'locatario', level: 'error', step: 1, message: 'Informe o locatário.' });
  if (!info.vistoriadora.trim()) add({ id: 'vistoriadora', level: 'error', step: 1, message: 'Informe a vistoriadora.' });
  if (info.locadoraCpf.trim() && !validateCpfCnpj(info.locadoraCpf).valid) add({ id: 'cpf-locadora', level: 'warn', step: 1, message: 'CPF/CNPJ da locadora parece inválido.' });
  if (info.locatarioCpf.trim() && !validateCpfCnpj(info.locatarioCpf).valid) add({ id: 'cpf-locatario', level: 'warn', step: 1, message: 'CPF/CNPJ do locatário parece inválido.' });

  if (!hasAnyReading(info.medidores)) add({ id: 'medidores', level: 'warn', step: 0, message: 'Leituras dos medidores (água, energia, gás) não registradas.' });
  else for (const k of ['agua', 'luz', 'gas'] as const) {
    const l = info.medidores?.[k]?.leitura;
    if (l && parseReading(l) == null) add({ id: `leitura-${k}`, level: 'warn', step: 0, message: `Leitura de ${k === 'agua' ? 'água' : k === 'luz' ? 'energia' : 'gás'} inválida.` });
  }
  if (!(info.chaves || []).length) add({ id: 'chaves', level: 'info', step: 0, message: 'Nenhuma chave/controle registrado como entregue.' });

  if (rooms.length === 0) add({ id: 'sem-comodos', level: 'error', step: 2, message: 'Adicione ao menos um cômodo.' });

  const seen = new Map<string, number>();
  for (const r of rooms) {
    const name = r.name.trim();
    const label = name || 'Cômodo sem nome';
    if (!name) add({ id: `nome-${r.id}`, level: 'error', step: 2, roomId: r.id, message: 'Há um cômodo sem nome.' });
    else seen.set(name.toLowerCase(), (seen.get(name.toLowerCase()) || 0) + 1);

    const photos = r.photos.length;
    const lost = r.photos.filter((p) => !p.dataUrl).length;
    if (photos === 0) add({ id: `fotos-${r.id}`, level: 'warn', step: 4, roomId: r.id, message: `${label}: sem fotos.` });
    if (lost > 0) add({ id: `perdidas-${r.id}`, level: 'warn', step: 4, roomId: r.id, message: `${label}: ${lost} foto(s) sem imagem (laudo salvo por uma versão antiga). Reenvie as fotos.` });
    const hasChecklist = Object.keys(r.checklist || {}).length > 0;
    if (!hasChecklist && r.items.length === 0 && r.furniture.length === 0 && r.damages.length === 0) {
      add({ id: `vazio-${r.id}`, level: 'warn', step: 3, roomId: r.id, message: `${label}: sem inventário, avarias nem estado de conservação.` });
    }
    const pend = (r.proposals || []).length;
    if (pend > 0) add({ id: `sugestoes-${r.id}`, level: 'warn', step: 4, roomId: r.id, message: `${label}: ${pend} sugestão(ões) da IA aguardando revisão (não entram no laudo até serem aceitas).` });
    const annotations = r.photos.reduce((s, p) => s + p.annotations.length, 0);
    if (r.damages.length > 0 && photos > 0 && annotations === 0) {
      add({ id: `anot-${r.id}`, level: 'info', step: 4, roomId: r.id, message: `${label}: há avarias registradas, mas nenhuma foto anotada.` });
    }
    if (r.damages.length > 0 && photos === 0) {
      add({ id: `avaria-sem-foto-${r.id}`, level: 'warn', step: 4, roomId: r.id, message: `${label}: avarias registradas sem foto de comprovação.` });
    }
  }
  for (const [n, c] of seen) if (c > 1) add({ id: `dup-${n}`, level: 'warn', step: 2, message: `Há ${c} cômodos com o nome “${n.toUpperCase()}”. Diferencie-os (ex.: QUARTO 1, QUARTO 2).` });

  if (!info.consideracoes.trim()) add({ id: 'consideracoes', level: 'info', step: 5, message: 'Sem considerações finais. Escreva ou gere com a IA.' });
  if (info.tipoVistoria === 'SAIDA' && !hasLink) add({ id: 'sem-vinculo', level: 'info', step: 0, message: 'Vistoria de saída sem vínculo com a entrada (a comparação automática não estará disponível).' });
  if (!signatures.locadora && !signatures.locatario) add({ id: 'assinaturas', level: 'info', step: 5, message: 'Sem assinaturas digitais (podem ser coletadas no papel).' });

  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.filter((i) => i.level === 'warn').length;
  const score = Math.max(0, 100 - errors * 15 - warnings * 5 - issues.filter((i) => i.level === 'info').length * 1);
  const order = { error: 0, warn: 1, info: 2 } as const;
  issues.sort((a, b) => order[a.level] - order[b.level]);
  return { score, issues, errors, warnings };
}
