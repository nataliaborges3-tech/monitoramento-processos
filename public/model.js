export const STATUSES = ['Em andamento', 'Pendente', 'Concluído'];
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function daysLeft(deadline, now = new Date()) {
  const date = new Date(deadline + 'T12:00:00');
  return Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}
export function deadlineKind(process, now) {
  if (process.status === 'Concluído') return 'done';
  const days = daysLeft(process.deadline, now);
  return days < 0 ? 'overdue' : days <= 7 ? 'soon' : 'normal';
}
export function filterProcesses(processes, { search = '', unit = '', status = '', view = 'overview', metric = '' } = {}) {
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return processes.filter(p => {
    const kind = deadlineKind(p);
    return (!search || normalize([p.sei, p.subject, p.owner, p.unit, p.requester].join(' ')).includes(normalize(search))) &&
      (!unit || p.unit === unit) && (!status || p.status === status) &&
      (view !== 'deadlines' || ['overdue', 'soon'].includes(kind)) &&
      (!metric || (metric === 'active' ? p.status !== 'Concluído' : kind === metric));
  });
}
export function validateProcess(process, processes) {
  for (const key of ['sei', 'subject', 'requester', 'unit', 'owner', 'deadline']) {
    if (!String(process[key] || '').trim()) return 'Preencha todos os campos obrigatórios.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(process.deadline) || Number.isNaN(new Date(process.deadline + 'T12:00:00').getTime())) return 'Informe um prazo válido.';
  if (!STATUSES.includes(process.status)) return 'Situação inválida.';
  if (processes.some(p => p.id !== process.id && p.sei.toLowerCase() === process.sei.toLowerCase())) return 'Já existe um processo com este número SEI.';
  return '';
}
export function moveProcess(process, unit, owner, note, now = new Date().toISOString()) {
  return { ...process, unit, owner, history: [...process.history, { unit, enteredAt: now, note }] };
}
export function makeDemo(now = new Date()) {
  const date = offset => localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset));
  const entered = offset => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 9).toISOString();
  const records = [
    ['23000.014582/2026-31', 'Aquisição de equipamentos de informática', 'Solicitação de compra de notebooks para modernização dos postos de trabalho.', 'Tecnologia da Informação', 'Compras e Licitações', 'Mariana Costa', -3, 'Em andamento', 'Aguardando parecer jurídico sobre a minuta do edital.', 'Encaminhar minuta à Assessoria Jurídica e consolidar o termo de referência.'],
    ['23000.012947/2026-08', 'Renovação de contrato de serviços', 'Prorrogação do contrato de manutenção predial por mais 12 meses.', 'Infraestrutura', 'Assessoria Jurídica', 'Rafael Almeida', 2, 'Pendente', 'Receber a certidão de regularidade fiscal da contratada.', 'Concluir análise jurídica e submeter à assinatura.'],
    ['23000.016203/2026-45', 'Capacitação de servidores', 'Inscrição da equipe no programa de gestão e fiscalização de contratos.', 'Gestão de Pessoas', 'Gestão de Pessoas', 'Ana Beatriz', 5, 'Em andamento', 'Confirmar a disponibilidade orçamentária.', 'Solicitar autorização da diretoria para as inscrições.'],
    ['23000.011890/2026-72', 'Adequação dos espaços de atendimento', 'Reorganização e acessibilidade da recepção e das salas de atendimento.', 'Infraestrutura', 'Diretoria Administrativa', 'Pedro Santos', 18, 'Em andamento', 'Validar cronograma de execução.', 'Aprovar o plano de intervenção e comunicar as unidades.'],
    ['23000.010435/2026-19', 'Prestação de contas de diárias', 'Conferência dos comprovantes de deslocamento a serviço.', 'Diretoria Administrativa', 'Finanças', 'Juliana Oliveira', -8, 'Concluído', 'Nenhuma pendência.', 'Processo concluído e arquivado.'],
    ['23000.017062/2026-54', 'Pagamento de fornecedores', 'Análise de notas fiscais dos serviços de limpeza e conservação.', 'Compras e Licitações', 'Finanças', 'Lucas Ferreira', -1, 'Pendente', 'Aguardando ateste das notas fiscais.', 'Recolher ateste da fiscalização e emitir ordem de pagamento.'],
    ['23000.018371/2026-26', 'Atualização do inventário patrimonial', 'Conferência dos bens e atualização dos termos de responsabilidade.', 'Patrimônio', 'Patrimônio', 'Camila Rodrigues', 25, 'Em andamento', 'Finalizar levantamento dos bens da unidade central.', 'Consolidar o relatório e encaminhar à diretoria.'],
    ['23000.009221/2026-63', 'Concessão de licença para capacitação', 'Análise de requerimento de licença para curso de aperfeiçoamento.', 'Gestão de Pessoas', 'Diretoria Administrativa', 'Ana Beatriz', -12, 'Concluído', 'Nenhuma pendência.', 'Portaria publicada e servidor comunicado.']
  ];
  return records.map((r, i) => {
    const [sei, subject, summary, requester, unit, owner, offset, status, pending, next] = r;
    return { id: `demo-${i + 1}`, sei, subject, summary, requester, unit, owner, deadline: date(offset), status, pending, next,
      history: [{ unit: requester, enteredAt: entered(-18 - i), note: 'Processo aberto pela unidade solicitante.' },
        { unit: 'Protocolo Geral', enteredAt: entered(-12 - i), note: 'Documentação recebida e conferida.' },
        { unit, enteredAt: entered(-4 - i), note: status === 'Concluído' ? 'Análise concluída. Processo arquivado.' : 'Recebido para análise e providências.' }] };
  });
}
