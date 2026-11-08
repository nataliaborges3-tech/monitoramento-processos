import { deadlineKind } from './model.js';
import { zipFiles } from './excel.js';
export function executiveReport(processes, now = new Date(), scope = 'Todos os processos') {
  const active = processes.filter(p => p.status !== 'Concluído');
  const completed = processes.length - active.length;
  const late = active.filter(p => deadlineKind(p, now) === 'overdue');
  const soon = active.filter(p => deadlineKind(p, now) === 'soon');
  const single = processes.length === 1 ? processes[0] : null;
  const month = new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(now);
  return [
    ['title',single ? single.subject : 'Relatório Executivo — Carteira de processos'],
    ['demandante',single?.requester || 'A preencher'],['mes',month],['consolidacao','A preencher'],
    ['reference',single ? `Processo SEI: ${single.sei}` : `Seleção: ${scope}`],
    ['heading','1. SÍNTESE'],['text',single ? `${single.summary || 'Descreva o objeto e o contexto do processo.'}\n\nUnidade atual: ${single.unit}. Responsável: ${single.owner}. Situação: ${single.status}.` : `A carteira analisada reúne ${processes.length} processo(s): ${active.length} ativo(s) e ${completed} concluído(s). Entre os ativos, ${late.length} estão atrasados e ${soon.length} vencem em até sete dias, incluindo hoje. Atrasados e próximos do vencimento integram o total de ativos.`],
    ['heading','2. PROPOSTA'],['text',single ? single.next || 'Descreva as medidas propostas e os próximos encaminhamentos.' : processes.map(p=>`${p.sei} — ${p.next || 'Encaminhamento a definir.'}`).join('\n\n') || 'Nenhum processo selecionado.'],
    ['heading','3. IMPACTO'],['text','A preencher: descreva os impactos administrativos, financeiros, orçamentários, operacionais e de pessoal, quando aplicáveis. Indique a fonte das estimativas. Não há informações cadastradas suficientes para estimar esses impactos automaticamente.'],
    ['heading','4. OUTRAS INFORMAÇÕES'],['text',single ? `Prazo do processo: ${single.deadline.split('-').reverse().join('/')}.\nPendências: ${single.pending || 'Não informadas.'}\n\nTramitação:\n${single.history.map(h=>`${new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(h.enteredAt))} — ${h.unit}: ${h.note}`).join('\n')}` : processes.map(p=>`${p.sei} — ${p.unit}; responsável: ${p.owner}; prazo: ${p.deadline.split('-').reverse().join('/')}; pendências: ${p.pending || 'não informadas'}.`).join('\n\n') || 'Nenhuma informação complementar.'],
    ['heading','5. ANÁLISE'],['text',`Subsídios para análise: ${late.length} processo(s) atrasado(s) e ${soon.length} próximo(s) do vencimento nesta seleção. Os prazos são os cadastrados, sem nova data de compromisso. As pendências registradas não comprovam a causa dos atrasos.\n\nObservações da gestão: a preencher. Registre avaliação técnica, riscos, conclusão e recomendação para decisão. Nenhum parecer ou fundamento legal foi inferido automaticamente.`]
  ];
}

const wordEscape = text => String(text).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function executiveWord(lines) {
  const metadata = ['demandante','mes','consolidacao'];
  const paragraph = text => String(text).split('\n').map((line,i)=>`${i ? '<w:br/>' : ''}<w:t xml:space="preserve">${wordEscape(line)}</w:t>`).join('');
  const cell = (label,value) => `<w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>${label}</w:t></w:r></w:p><w:p><w:r>${paragraph(value)}</w:r></w:p></w:tc>`;
  const header = `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${['top','left','bottom','right','insideH','insideV'].map(side=>`<w:${side} w:val="single" w:sz="4" w:color="B8C3CE"/>`).join('')}</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3000"/><w:gridCol w:w="3000"/><w:gridCol w:w="3000"/></w:tblGrid><w:tr>${metadata.map((kind,i)=>cell(['DEMANDANTE','MÊS','CONSOLIDAÇÃO'][i],lines.find(l=>l[0]===kind)?.[1] || '')).join('')}</w:tr></w:tbl><w:p/>`;
  const body = lines.filter(l=>!metadata.includes(l[0])).map(([kind,text]) => {
    const heading = ['title','heading','subheading'].includes(kind);
    const size = kind === 'title' ? 24 : kind === 'heading' ? 24 : 22;
    return `<w:p><w:pPr><w:spacing w:after="160"/>${heading?'<w:keepNext/>':''}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>${heading?'<w:b/><w:color w:val="325E88"/>':''}<w:sz w:val="${size}"/></w:rPr>${paragraph(text)}</w:r></w:p>`;
  }).join('');
  return zipFiles({
    '[Content_Types].xml':'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels':'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml':`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${header}${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`
  }).slice(0,undefined,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
