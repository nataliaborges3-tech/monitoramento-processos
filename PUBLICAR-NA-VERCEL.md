# Publicar a demonstração na Vercel

Esta preparação foi feita nos arquivos locais do ambiente do Codex. **Nada foi enviado automaticamente ao GitHub ou publicado na Vercel.** Você controla cada etapa abaixo.

O aplicativo usa somente dados fictícios. Você não precisa cadastrar cartão, comprar domínio, contratar banco de dados ou configurar chaves de API para testar esta versão; escolha um plano gratuito se ele estiver disponível e adequado à sua conta.

## 1. Entenda o que será publicado

A pasta `public` contém o site completo. O arquivo `vercel.json` informa à Vercel que deve publicar essa pasta como um site estático. O servidor `server.js` serve apenas para desenvolvimento local; não precisa ficar rodando na nuvem após a publicação.

Configuração preparada:

| Campo na Vercel | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Raiz do repositório; não selecione `public` aqui |
| Install Command | `npm ci` |
| Build Command | Vazio, sem comando de build |
| Output Directory | `public` |
| Environment Variables | Nenhuma |

O diretório de saída é a pasta de arquivos que será exibida aos visitantes. Não é preciso executar `npm start` na Vercel. Não use o comando de geração do ZIP como build da Vercel.

## 2. Envie os arquivos ao GitHub

Importante: a Vercel lê os arquivos que estão **no GitHub**, não as alterações ainda guardadas apenas nesta conversa. Importar o repositório enquanto ele contiver apenas o README não publicará o aplicativo.

### Pelo terminal do ambiente que contém o projeto

Use o terminal **deste ambiente de desenvolvimento**, onde existe `/workspace/monitoramento-processos`. Não cole estes comandos na barra de endereços, no console do navegador ou no terminal do seu computador sem ter uma cópia do projeto.

Se sua interface não oferece acesso ao terminal ou uma ação para enviar as alterações ao GitHub, esta etapa precisa ser feita em uma interface de desenvolvimento que ofereça esse acesso. Não existe um botão de publicação neste aplicativo e os arquivos locais ainda não aparecem automaticamente no GitHub.

Execute um bloco por vez. Pare se aparecer um erro.

**Confira os arquivos:**

```sh
cd /workspace/monitoramento-processos
git status --short
```

É esperado ver `README.md` alterado e os novos arquivos do aplicativo. Não há problema em aparecerem nomes em vermelho: isso significa que ainda não foram incluídos em um commit.

**Crie uma branch para revisar antes de alterar a principal:**

```sh
git switch -c demonstracao-vercel
```

Uma branch é uma área de trabalho separada dentro do mesmo repositório. Se o Git disser que ela já existe, use `git switch demonstracao-vercel` em vez de criá-la novamente.

**Registre os arquivos:**

```sh
git add .gitignore .vercelignore vercel.json package.json package-lock.json server.js public scripts test README.md PUBLICAR-NA-VERCEL.md
git diff --cached --stat
git commit -m "Adiciona demonstracao do monitoramento de processos para Vercel"
```

O comando `git diff --cached --stat` permite conferir a lista antes do commit. Um commit é um registro das alterações. O diretório `dist` é gerado e não precisa ser enviado.

Se o Git pedir sua identificação, execute os comandos abaixo substituindo os exemplos pelo seu nome e pelo e-mail associado à sua conta GitHub (pode ser o e-mail privado `noreply` fornecido pelo GitHub). Depois repita somente o comando `git commit`:

```sh
git config user.name "Seu nome"
git config user.email "seu-email-do-github"
```

**Envie a branch quando estiver pronta para isso:**

```sh
git push -u origin demonstracao-vercel
```

Esse último comando envia os arquivos ao GitHub. Se aparecer erro de autenticação ou permissão, pare e informe a mensagem, sem compartilhar tokens ou senhas. Não é necessário alterar o endereço do repositório nem fornecer um token nesta conversa.

### Revise no site do GitHub

1. Abra https://github.com/nataliaborges3-tech/monitoramento-processos.
2. Selecione a branch `demonstracao-vercel` na lista de branches. Confira se aparecem `public`, `package.json` e `vercel.json`.
3. Abra uma **Pull Request** dessa branch para `main`. O GitHub costuma oferecer **Compare & pull request**; também é possível usar a aba **Pull requests** e **New pull request**.
4. Revise a aba **Files changed**. Os dados de exemplo estão em `public/model.js`.
5. Quando desejar incorporar a versão, use **Merge pull request** e confirme. Isso coloca os arquivos na branch principal, `main`.
6. Volte à aba **Code**, selecione `main` e confirme que os arquivos do aplicativo estão lá.

Se quiser acompanhar comigo, pare depois de enviar a branch e informe em qual etapa está. Não é necessário publicar na mesma hora.

## 3. Importe o repositório na Vercel

Só prossiga depois que os arquivos estiverem na `main` do GitHub.

1. Acesse https://vercel.com e entre ou crie sua conta usando **Continue with GitHub**.
2. No painel, escolha **Add New… → Project**. Os nomes podem aparecer em inglês ou variar um pouco.
3. Autorize o acesso ao repositório `nataliaborges3-tech/monitoramento-processos`. Se possível, conceda acesso apenas a esse repositório.
4. Localize esse repositório na lista e clique em **Import**.
5. Você pode usar `monitoramento-processos-demo` como nome do projeto. Se o nome estiver ocupado, escolha outro.
6. Confira a tabela da etapa 1. O arquivo `vercel.json` já define os valores principais. Não escolha Next.js, não adicione variáveis de ambiente e não preencha o build com `npm start`.
7. Se aparecer uma opção de branch de produção, confirme `main`.
8. Revise a configuração. **Pare aqui se ainda não quiser colocar o site no ar.**
9. Quando estiver pronta, clique em **Deploy**. Essa é a ação que inicia a publicação.

## 4. Abra e teste pelo navegador

1. Aguarde o deployment ficar **Ready** ou aparecer a confirmação de sucesso.
2. Clique em **Visit** ou abra o endereço HTTPS mostrado em **Domains**. O endereço termina em `.vercel.app`; use exatamente o que a Vercel fornecer. Não é `localhost`.
3. Se a Vercel pedir login, confira **Settings → Deployment Protection**. As opções de proteção dependem da conta/plano e do tipo de deployment; só altere a proteção se desejar permitir acesso público. Para testar na sua conta, o login pode ser suficiente.
4. Confira os oito processos fictícios, os indicadores e os alertas.
5. Crie um processo com dados inventados, abra os detalhes, registre uma tramitação e recarregue a página.
6. Teste a pesquisa, os filtros e **Exportar Excel**.
7. Teste o mesmo endereço no celular.

A demonstração não possui login próprio. Cada navegador mantém seus cadastros localmente; ninguém recebe automaticamente o que outra pessoa cadastrou. Não coloque dados reais, documentos pessoais ou processos sigilosos na demonstração. O aplicativo não está integrado ao SEI.

## 5. Atualizações depois da primeira publicação

Depois de conectar GitHub e Vercel, novas alterações enviadas ao repositório podem disparar deploys automaticamente. Normalmente, branches e Pull Requests geram prévias, e alterações incorporadas à branch de produção `main` atualizam o site principal.

Revise as configurações de Git e implantação da Vercel se quiser controlar essas atualizações. Para pausar o uso público, use as opções de proteção ou desative/exclua o projeto de demonstração no painel da Vercel, sem excluir o repositório.

## Se algo não funcionar

| Problema | O que conferir |
| --- | --- |
| Repositório não aparece para importar | Permissão do aplicativo Vercel no GitHub para este repositório. |
| Só existe README no GitHub | Os arquivos ainda não foram enviados ou incorporados à `main`. Conclua a etapa 2. |
| Página 404 após publicar | A `main` deve conter `public/index.html` e `vercel.json`. Root Directory deve ser a raiz; Output Directory, `public`. |
| Deployment com falha | Abra o deployment e leia **Build Logs**. Confira se não há um override de build com `npm start`. Compartilhe a mensagem do erro, sem credenciais. |
| Abre uma página sem o aplicativo | Confirme que importou o repositório correto e está abrindo o deployment mais recente. |
| Outra pessoa não vê meus cadastros | É esperado: esta demonstração usa armazenamento local de cada navegador. |
| O link pede login da Vercel | Confira a proteção do deployment na etapa 4. |

## O que foi validado antes da publicação

Foram executados testes locais das regras e do servidor e testes de navegador sobre a pasta estática que será publicada. Esses testes não substituem a verificação do deployment real: nenhum endereço Vercel foi criado ou testado automaticamente.
