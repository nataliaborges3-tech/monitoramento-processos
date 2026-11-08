import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { server } from '../server.js';
import { makeDemo, daysLeft, deadlineKind, filterProcesses, validateProcess, moveProcess } from '../public/model.js';
import { makeWorkbook } from '../public/excel.js';
const now = new Date('2026-11-02T12:00:00');
const demo = makeDemo(now);
test('prazos: atraso, hoje, limite de sete dias e concluídos', () => {
  assert.equal(daysLeft('2026-11-01', now), -1);
  assert.equal(deadlineKind({ deadline: '2026-11-01', status: 'Pendente' }, now), 'overdue');
  assert.equal(deadlineKind({ deadline: '2026-11-02', status: 'Em andamento' }, now), 'soon');
  assert.equal(deadlineKind({ deadline: '2026-11-09', status: 'Em andamento' }, now), 'soon');
  assert.equal(deadlineKind({ deadline: '2026-11-10', status: 'Em andamento' }, now), 'normal');
  assert.equal(deadlineKind({ deadline: '2026-10-01', status: 'Concluído' }, now), 'done');
});
test('pesquisa sem acentos e filtros combinados por unidade e situação', () => {
  const found = filterProcesses(demo, { search: 'informatica', unit: 'Compras e Licitações', status: 'Em andamento' });
  assert.equal(found.length, 1);
  assert.equal(found[0].id, 'demo-1');
  assert.equal(filterProcesses(demo, { search: 'ana beatriz' }).length, 2);
  assert.equal(filterProcesses(demo, { search: 'inexistente' }).length, 0);
  assert.equal(filterProcesses(demo, { metric: 'done' }).length, 2);
});
test('cadastro bloqueia duplicidade, permite edição e exige campos', () => {
  const p = { ...demo[0], id: 'new' };
  assert.match(validateProcess(p, demo), /Já existe/);
  assert.equal(validateProcess(demo[0], demo), '');
  assert.match(validateProcess({ ...p, sei: '' }, demo), /obrigatórios/);
  assert.match(validateProcess({ ...p, sei: 'novo', deadline: 'inválido' }, demo), /prazo/);
});
test('tramitação preserva histórico e atualiza unidade e responsável', () => {
  const updated = moveProcess(demo[0], 'Finanças', 'Maria', 'Análise financeira', now.toISOString());
  assert.equal(updated.history.length, 4);
  assert.equal(demo[0].history.length, 3);
  assert.equal(updated.unit, 'Finanças');
  assert.equal(updated.owner, 'Maria');
  assert.equal(updated.history.at(-1).note, 'Análise financeira');
});
test('Excel contém pacote OOXML e mantém fórmulas como texto', async () => {
  const blob = makeWorkbook([{ ...demo[0], subject: '=1+1 <teste> & dados' }]);
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual([...bytes.slice(0, 4)], [80, 75, 3, 4]);
  const text = new TextDecoder().decode(bytes);
  assert.match(text, /name="Processos"/);
  assert.match(text, /name="Tramitações"/);
  assert.match(text, /t="inlineStr"><is><t xml:space="preserve">=1\+1 &lt;teste&gt; &amp; dados/);
});
test('servidor entrega página e módulos, rejeita arquivos inexistentes', async () => {
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base); assert.equal(page.status, 200); assert.match(await page.text(), /Monitoramento de Processos Administrativos/);
    const js = await fetch(base + '/app.js'); assert.equal(js.status, 200); assert.match(js.headers.get('content-type'), /javascript/);
    assert.equal((await fetch(base + '/missing')).status, 404);
    assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('relatório executivo respeita seleção, identifica prioridades e gera Word', async () => {
  const {executiveReport,executiveWord} = await import('../public/report.js');
  const lines = executiveReport(demo,now,'Todos');
  const text = lines.map(l=>l[1]).join('\n');
  assert.match(text,/8 processo\(s\): 6 ativo\(s\) e 2 concluído/);
  assert.match(text,/2 estão atrasados e 2 vencem/);
  assert.match(text,/Observações da gestão/);
  const selected = executiveReport([demo[0]],now,'Somente uma unidade').map(l=>l[1]).join('\n');
  assert.match(selected,/Processo SEI:/);
  assert.deepEqual(lines.filter(l=>l[0]==='heading').map(l=>l[1]),['1. SÍNTESE','2. PROPOSTA','3. IMPACTO','4. OUTRAS INFORMAÇÕES','5. ANÁLISE']);
  assert.ok(!selected.includes(demo[1].sei));
  const empty = executiveReport([],now).map(l=>l[1]).join('\n');
  assert.match(empty,/0 processo\(s\)/);
  const doc = executiveWord([['title','Resumo <executivo> & dados']]);
  assert.equal(doc.type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  const xml = new TextDecoder().decode(await doc.arrayBuffer());
  assert.match(xml,/word\/document.xml/);
  assert.match(xml,/Resumo &lt;executivo&gt; &amp; dados/);
});
