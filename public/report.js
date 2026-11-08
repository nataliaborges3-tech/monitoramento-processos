import { deadlineKind, daysLeft } from './model.js';
import { zipFiles } from './excel.js';
export function executiveReport(processes, now = new Date(), scope = 'Todos os processos') {
  const active = processes.filter(p => p.status !== 'Concluído');
  const completed = processes.length - active.length;
  const late = active.filter(p => deadlineKind(p, now) === 'overdue');
  const soon = active.filter(p => deadlineKind(p, now) === 'soon');
  const priorities = [...late, ...soon].sort((a,b) => a.deadline.localeCompare(b.deadline));
  const group = key => [...new Set(processes.map(p => p[key]))].map(name => {
    const items = processes.filter(p => p[key] === name);
    return {name,total:items.length,active:items.filter(p => p.status !== 'Concluído').length,late:items.filter(p => deadlineKind(p,now) === 'overdue').length};
  }).sort((a,b) => b.late-a.late || b.active-a.active || a.name.localeCompare(b.name,'pt-BR'));
  const lines = [
    ['title','Relatório Executivo'],['subtitle','Monitoramento de Processos Administrativos'],
    ['text',`Emitido em ${new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short'}).format(now)}. Base: ${scope}. Dados demonstrativos e cadastros deste navegador.`],
    ['heading','1. Síntese gerencial'],
    ['text',`A carteira analisada reúne ${processes.length} processo(s): ${active.length} ativo(s) e ${completed} concluído(s). Entre os ativos, ${late.length} estão atrasados e ${soon.length} vencem em até sete dias, incluindo hoje. Os grupos de atraso e vencimento são subconjuntos dos ativos e não devem ser somados ao total da carteira.`],
    ['heading','2. Pontos de atenção'],
    ['text',late.length ? `Prioridade de gestão: regularizar os ${late.length} processo(s) vencido(s), validando pendências, responsáveis e datas de encaminhamento.` : 'Não há processos atrasados nesta seleção.'],
    ['text',soon.length ? `Ação preventiva: acompanhar os ${soon.length} processo(s) com vencimento nos próximos sete dias.` : 'Não há processos próximos do vencimento nesta seleção.'],
    ['heading','3. Distribuição por unidade atual'],
    ...group('unit').map(g => ['text',`${g.name}: ${g.total} no total; ${g.active} ativo(s); ${g.late} atrasado(s).`]),
    ['heading','4. Distribuição por responsável'],
    ...group('owner').map(g => ['text',`${g.name}: ${g.total} no total; ${g.active} ativo(s); ${g.late} atrasado(s).`]),
    ['heading','5. Encaminhamentos prioritários'],
    ['text','Ordem: prazo mais antigo primeiro. As pendências abaixo são informações cadastradas e não comprovam, por si só, a causa do atraso. Os prazos indicados são os prazos atuais dos processos; não há nova data de compromisso registrada.'],
    ...priorities.flatMap(p => [
      ['subheading',`${p.sei} — ${p.subject}`],
      ['text',`Situação de prazo: ${daysLeft(p.deadline,now)<0 ? `${Math.abs(daysLeft(p.deadline,now))} dia(s) de atraso` : `vence em ${daysLeft(p.deadline,now)} dia(s)`}. Prazo: ${p.deadline.split('-').reverse().join('/')}. Unidade: ${p.unit}. Responsável: ${p.owner}.`],
      ['text',`Pendências informadas: ${p.pending || 'Não informadas.'}`],
      ['text',`Próximo encaminhamento: ${p.next || 'A definir pela unidade responsável.'}`]
    ]),
    ...(!priorities.length ? [['text','Nenhum encaminhamento urgente identificado pelos prazos desta seleção.']] : []),
    ['heading','6. Detalhamento da carteira'],
    ...processes.flatMap(p => [
      ['subheading',`${p.sei} — ${p.subject}`],['text',`${p.status}. Solicitante: ${p.requester}. Unidade atual: ${p.unit}. Responsável: ${p.owner}. Prazo: ${p.deadline.split('-').reverse().join('/')}.`],
      ['text',`Resumo: ${p.summary || 'Não informado.'}`],['text',`Pendências: ${p.pending || 'Não informadas.'}`],['text',`Próximos encaminhamentos: ${p.next || 'Não informados.'}`],
      ['text','Tramitação:'],...p.history.map(h => ['text',`${new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(h.enteredAt))} — ${h.unit}: ${h.note}`])
    ]),
    ['heading','7. Observações da gestão'],['text','[Espaço editável no Word para registrar decisões, justificativas e compromissos.]'],
    ['text','Nota metodológica: este relatório apresenta a posição atual da carteira selecionada, sem comparação histórica de produtividade. Não há dados suficientes para calcular tempo médio de conclusão ou evolução mensal.']
  ];
  return lines;
}
const wordEscape = text => String(text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function executiveWord(lines) {
  const body = lines.map(([kind,text]) => {
    const heading = ['title','heading','subheading'].includes(kind);
    const size = kind === 'title' ? 40 : kind === 'heading' ? 28 : 22;
    return `<w:p><w:pPr><w:spacing w:after="160"/>${heading?'<w:keepNext/>':''}</w:pPr><w:r><w:rPr>${heading?'<w:b/><w:color w:val="325E88"/>':''}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${wordEscape(text)}</w:t></w:r></w:p>`;
  }).join('');
  return zipFiles({
    '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml':`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  }).slice(0,undefined,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
