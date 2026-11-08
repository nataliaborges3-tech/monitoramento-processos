# Monitoramento de Processos Administrativos

Primeira versão funcional de um sistema web em português para acompanhar processos administrativos. Interface responsiva, sem dependências externas de execução, com oito processos fictícios e prazos relativos à primeira abertura da demonstração.

## Publicar para acessar pela Internet

O projeto está preparado para hospedagem estática na Vercel. Veja o [passo a passo para iniciantes](PUBLICAR-NA-VERCEL.md), com envio ao GitHub, revisão e publicação manual. Nenhum push ou deploy é executado automaticamente por este guia.

## Abrir sem instalar nada

A versão em arquivo único está em `dist/monitora.html` após executar `npm run standalone`. Baixe esse arquivo do ambiente para seu computador e abra-o no Chrome, Edge ou Firefox. Ele inclui a interface, os dados fictícios e a exportação Excel, sem precisar de servidor ou conexão com a Internet.

Para gerar novamente o arquivo depois de alterar o código:

```sh
npm run standalone
```

A gravação local depende das permissões de armazenamento do navegador para arquivos locais. Use o servidor descrito abaixo caso o navegador bloqueie esse armazenamento. Os dados do arquivo local e do servidor ficam separados.

## Executar com servidor

**Atenção:** `localhost` sempre aponta para o computador em que o navegador está aberto. Se o servidor estiver rodando na nuvem, abrir `localhost:3000` no seu computador não acessará esse servidor. Use o arquivo independente acima ou execute o projeto no seu computador.

Requisito: **Node.js 20 ou superior**.

```sh
cd /workspace/monitoramento-processos
npm ci
npm start
```

O servidor escuta em `0.0.0.0`, porta **3000**. Em sua máquina, abra `http://localhost:3000` no navegador. Em um ambiente remoto, encaminhe a porta 3000 pela ferramenta de acesso a portas do seu editor ou ambiente e abra o endereço fornecido por ela. O processo precisa continuar em execução. Para encerrar, use `Ctrl+C`.

Para usar outra porta:

```sh
PORT=8080 npm start
```

Para desenvolvimento com reinicialização automática do servidor:

```sh
npm run dev
```

Os arquivos da interface são servidos diretamente; recarregue o navegador após editá-los. Não há etapa de build nem necessidade de banco de dados para esta versão.

## Experimentar

- **Painel:** indicadores clicáveis de processos ativos (incluindo pendentes), concluídos, atrasados e com vencimento em até sete dias. Processos concluídos não geram alertas de atraso.
- **Novo processo:** informe SEI, assunto, unidade solicitante, unidade atual, responsável, prazo e situação; acrescente resumo, pendências e próximos encaminhamentos. Números SEI duplicados são bloqueados.
- **Detalhes:** clique no assunto ou na seta da linha. Veja resumo, pendências, próximos encaminhamentos, unidade atual e tempo de permanência. O histórico exibe entrada e duração em cada unidade.
- **Editar processo:** atualize o cadastro ou marque como concluído. Alterar a unidade pela edição também registra a mudança no histórico. Reabra um processo concluído pela edição para voltar a encaminhá-lo.
- **Registrar tramitação:** escolha unidade de destino, novo responsável e observação. A data/hora é registrada automaticamente, preservando os eventos anteriores.
- **Pesquisa:** busque SEI, assunto, responsável, unidade solicitante ou unidade atual. A pesquisa ignora acentos e maiúsculas. Combine com os filtros de unidade atual e situação.
- **Prazos e alertas:** veja atrasados e vencimentos em até sete dias, inclusive o dia atual. Atraso aparece em vermelho e vencimento próximo em amarelo.
- **Exportar Excel:** baixe um arquivo `.xlsx` verdadeiro, com abas **Processos** e **Tramitações**, respeitando a pesquisa, os filtros e o indicador selecionado. Os campos são exportados como texto para não executar fórmulas digitadas no cadastro.

## Armazenamento e limites desta versão

Os dados ficam no `localStorage` do navegador, separados por endereço e porta. As alterações sobrevivem ao recarregamento, mas não são compartilhadas entre navegadores ou usuários. Limpar os dados do site apaga os cadastros locais. Exporte os relatórios que desejar guardar.

Para restaurar a demonstração, abra o console do navegador nesta página e execute:

```js
localStorage.removeItem('monitora-processos-v1');
location.reload();
```

A demonstração não possui autenticação, banco central, integração com SEI, envio de notificações ou colaboração simultânea. Os alertas são visuais. O nome “Administrador” identifica o perfil ilustrativo. Não utilize dados sensíveis nesta versão. Para utilização institucional, essas capacidades devem ser implementadas em uma próxima etapa.

## Validação

```sh
npm test
```

Seis testes automatizados cobrem cálculo de prazos, filtros combinados, cadastro, duplicidade, tramitação, estrutura da exportação Excel e respostas HTTP.

Teste opcional de ponta a ponta, com o aplicativo já iniciado e Python/Playwright/Chromium disponíveis:

```sh
python3 test/browser.py
```

O teste usa uma sessão de navegador isolada. Exercita cadastro, edição, tramitação, persistência após recarregar, pesquisa, filtros, alertas, bloqueio de duplicados, download e integridade do Excel e layout móvel. Por padrão usa `/usr/bin/chromium`; configure `CHROMIUM_PATH` para outro executável e `APP_URL` para outro endereço. As capturas são gravadas em `/tmp/monitora-desktop.png` e `/tmp/monitora-mobile.png`.

## Arquivos principais

- `server.js`: servidor HTTP usando apenas módulos nativos do Node.
- `public/index.html` e `public/style.css`: estrutura e interface responsiva.
- `public/app.js`: interações, formulários e persistência local.
- `public/model.js`: regras de prazo, filtros, validação e dados fictícios.
- `public/excel.js`: geração do arquivo XLSX/OOXML sem bibliotecas externas.
- `test/`: testes de regras, servidor e interface.
