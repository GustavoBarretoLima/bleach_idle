# Bleach Idle — Vigília de Karakura

RPG 2D para navegador inspirado no universo de **Bleach**, com exploração de Karakura, escolha de classe, patrulhas contra Hollows e progressão do personagem.

## Jogue agora

**[▶ Clique aqui para testar o jogo](https://gustavobarretolima.github.io/bleach_idle/)**

Não é necessário instalar. Abra o link no computador ou celular.

> Projeto em desenvolvimento. O progresso é salvo no navegador utilizado; limpar os dados do site pode apagar sua partida. O salvamento não é compartilhado entre dispositivos.

## Personagem de teste

Nesta versão, você joga como **Ichigo Kurosaki**, com a classe **Shinigami** e **Shikai/Zangetsu** disponíveis desde o início. O personagem também é aplicado às partidas já salvas, preservando níveis, itens, progresso e Bankai já liberada. A escolha de outras classes fica indisponível enquanto este teste estiver ativo.

## Primeiros passos

1. Explore Karakura com Ichigo ou inicie uma patrulha pelo menu de distritos.
2. Visite a **Loja Urahara** e explore a câmara subterrânea.
3. No **Hospital de Karakura**, converse com **Inoue** para recuperar seus PV.
4. Volte à cidade para visitar os outros locais ou escolher um distrito de patrulha.
5. Derrote Hollows, distribua pontos de atributo, encontre equipamentos e enfrente chefes para avançar.

A escolha de classe é definitiva para o personagem.

## Controles

| Ação | Como usar |
| --- | --- |
| Movimentar | **WASD**, setas do teclado ou toque/clique no destino |
| Conversar com um mentor | Toque/clique no NPC ou selecione-o na lista de mentores |
| Entrar ou sair de um local | Toque/clique no acesso ou use o botão correspondente |
| Usar porta ou escada próxima | Pressione **E** com a área do jogo selecionada |
| Usar habilidade e defender | Botões do painel de combate |
| Ativar ou pausar a caça | Botão de caça no painel de patrulha |

Os botões de acesso levam o personagem até a porta ou escada antes de trocar de área.

## O que já está disponível

- **Karakura explorável:** escola, Clínica Kurosaki, hospital, Loja Urahara, Armazém Visored, Rio Onose e pontes.
- **Loja Urahara:** interior com balcão, prateleiras, tatami e NPC Urahara.
- **Câmara subterrânea:** acesso pelo alçapão e escada da loja, com deserto, formações rochosas e caminho de retorno. Atualmente é uma área de exploração.
- **Hospital:** recepção, enfermaria, mentores e cura com Inoue.
- **Classes:** Shinigami, Quincy, Sado e Inoue.
- **Progressão:** níveis, atributos, equipamentos, aprimoramentos e liberações Shikai/Bankai para Shinigami conforme os requisitos do jogo.
- **Patrulhas:** Hollows, Demi-Hollows, chefes e distritos desbloqueáveis.
- **Praça compartilhada:** presença de outros jogadores na cidade quando o serviço está disponível. A progressão e os combates são locais.
- **Salvamento local e caça offline:** progresso no navegador, com cálculo de caça offline de até oito horas quando aplicável.

## Tecnologias

- React 19
- JavaScript
- HTML Canvas 2D
- CSS responsivo
- Vite 6
- Node.js para o serviço de presença da praça
- GitHub Actions e GitHub Pages para publicação

## Executar localmente

Use **Node.js 24**, versão utilizada no fluxo de publicação, e npm.

```bash
git clone https://github.com/GustavoBarretoLima/bleach_idle.git
cd bleach_idle
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente **http://localhost:5173**.

Para testar a presença compartilhada localmente, abra outro terminal na pasta do projeto:

```bash
npm run plaza
```

O serviço usa a porta **8787** por padrão. No desenvolvimento, o cliente busca esse serviço em `http://localhost:8787`. É possível configurar outro endereço com a variável `VITE_PLAZA_URL` antes de iniciar o Vite ou gerar a compilação.

## Compilar e verificar

```bash
# Gerar a versão de produção em dist/
npm run build

# Visualizar a compilação localmente
npm run preview

# Verificar navegação e colisões da loja e do subterrâneo
node --test tests/urahara.test.js
```

## Organização do projeto

| Caminho | Conteúdo |
| --- | --- |
| `src/App.jsx` | Interface React e painéis do jogo |
| `src/game.js` | Regras, progressão, movimentação e interações |
| `src/renderer.js` | Renderização do mundo e dos personagens |
| `src/data.js` | Classes, mentores, distritos e dados de progressão |
| `src/city.js` e `src/karakura/` | Cidade, cenário e colisões de Karakura |
| `src/urahara.js` | Interior da loja e câmara subterrânea |
| `src/hospital.js` | Interior e colisões do hospital |
| `src/presence.js` e `server/plaza.js` | Cliente e servidor de presença da praça |
| `tests/` | Testes automatizados |
| `.github/workflows/pages.yml` | Compilação e publicação no GitHub Pages |

## Atualizações

Veja as mudanças em [CHANGELOG.md](CHANGELOG.md). A publicação no GitHub Pages é executada pelo GitHub Actions após atualizações na branch `main`.

## Autor

Desenvolvido por [Gustavo Barreto Lima](https://github.com/GustavoBarretoLima).

Projeto de fã, não oficial e sem vínculo com os titulares de Bleach. Os personagens e o universo de Bleach pertencem aos seus respectivos detentores de direitos.
