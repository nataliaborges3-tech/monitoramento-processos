import './build-standalone.js';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { zipFiles } from '../public/excel.js';
const base = new URL('../',import.meta.url);
const instructions = `MONITORAMENTO DE PROCESSOS ADMINISTRATIVOS — DEMONSTRAÇÃO LOCAL

1. Extraia todos os arquivos do ZIP para uma pasta no seu computador.
2. Abra monitora.html com Chrome, Edge ou Firefox atualizado.
3. Não é necessário instalar Node, iniciar servidor nem acessar a Vercel.

Esta é uma versão portátil em HTML, não um instalador de Windows/macOS.
Use apenas dados fictícios. Não há integração com SEI nem leitura de PDF/OCR.
O aplicativo não requer internet para funcionar. A gravação depende das permissões de armazenamento do navegador para arquivos locais. Se aparecer aviso de falha ao salvar, não considere os dados guardados.
Os dados não acompanham automaticamente o aplicativo: cada navegador/endereço mantém seu próprio armazenamento. Cadastros feitos no site não são incluídos neste ZIP. Exporte os dados em Excel no site antes de mudar de ambiente. Ainda não existe importação desse Excel.
Mover o arquivo de pasta, trocar de navegador ou limpar dados do navegador pode afetar o acesso aos cadastros. Exporte relatórios regularmente. Os relatórios Word editados na tela precisam ser baixados antes de fechar.
A demonstração local não foi homologada para documentos reais do SEI. Aguarde a avaliação da TI.

CONTINUIDADE-DO-PROJETO.md registra o que combinamos e as pendências.
Site: https://monitoramento-processos.vercel.app/
Código: https://github.com/nataliaborges3-tech/monitoramento-processos
`;
const files = {
 'Monitora/monitora.html': await readFile(new URL('dist/monitora.html',base),'utf8'),
 'Monitora/LEIA-ME.txt': instructions,
 'Monitora/CONTINUIDADE-DO-PROJETO.md': await readFile(new URL('CONTINUIDADE-DO-PROJETO.md',base),'utf8')
};
await mkdir(new URL('public/downloads/',base),{recursive:true});
const archive=zipFiles(files);
await writeFile(new URL('public/downloads/monitora-local.zip',base),new Uint8Array(await archive.arrayBuffer()));
console.log('Pacote pronto: public/downloads/monitora-local.zip');
