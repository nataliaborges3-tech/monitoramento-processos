# Continuidade do projeto

Este arquivo registra as decisões e pendências desta conversa; não é uma transcrição integral nem uma cópia dos dados do navegador.

## Aplicativo existente

- Nome: Monitoramento de Processos Administrativos.
- Acesso web: https://monitoramento-processos.vercel.app/.
- Repositório: https://github.com/nataliaborges3-tech/monitoramento-processos.
- Interface em português, azul institucional, indicadores azul (andamento), verde (concluídos), amarelo (próximos do vencimento) e vermelho (atrasados).
- Cadastro e edição, tramitação, filtros, alertas, Excel e relatório executivo Word editável.
- Relatório conforme o modelo da usuária: cabeçalho com demandante, mês e consolidação; referência do processo; 1. Síntese; 2. Proposta; 3. Impacto; 4. Outras informações; 5. Análise.
- A edição do relatório deve ser baixada em Word para ser guardada; não altera o cadastro do processo.
- Dados demonstrativos, com alterações guardadas no navegador. Não existe banco compartilhado ou login institucional.

## Próxima etapa: aguardar a TI

A usuária consultará a equipe de TI sobre integração autorizada ao SEI. Não implementar acesso ao SEI antes de esclarecer autorização, autenticação e interface disponível.

Fluxo desejado: abrir o aplicativo, autenticar pela página oficial/provedor institucional e consultar/atualizar processos com as permissões do usuário. Preferir integração oficial; automação de navegador depende de autorização e avaliação. Não recolher a senha do SEI em formulário próprio. Integração requer conectividade com o SEI, mesmo em aplicativo local.

Também foi discutida a importação de PDFs, extração de texto/OCR e conferência antes de salvar. Essas funções NÃO estão implementadas. PDFs são fotografias do processo, não uma sincronização automática. Uma eventual IA local dependerá do equipamento e de aprovação institucional; não enviar documentos reais a serviços externos por padrão.

## Uso local e proteção

A usuária prefere avaliar instalação em máquina pessoal, com dados mantidos localmente. Isso reduz exposição, mas não garante ausência de vazamentos. Confirmar política do órgão para armazenamento em dispositivo pessoal; avaliar criptografia do disco, backups, atualização, sessão, permissões e pastas sincronizadas. O servidor de desenvolvimento atual escuta na rede; uma futura instalação com servidor somente local precisa limitar o endereço a 127.0.0.1.

O pacote HTML independente abre sem servidor e sem integração SEI. Destina-se a demonstração com dados fictícios. A versão atual não foi homologada para documentos reais/restritos. Ainda é necessário definir o sistema operacional da máquina antes de preparar um instalador nativo.

## Para retomar

Trazer a resposta da TI e informar Windows/macOS/Linux. Verificar a versão no GitHub, preservar alterações e dados existentes e definir o próximo passo com a usuária. Não afirmar que existe integração, OCR, autenticação ou segurança institucional já implementados.
