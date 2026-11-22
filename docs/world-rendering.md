# Karakura e Loja Urahara — primeira etapa visual

## Estrutura

- React continua responsável pelos menus, diálogos e estado de interface.
- Phaser 3.90 apresenta o mundo, os pisos nativos do Tiled, a câmera e a vegetação em profundidade. A versão é fixada para a API usada nesta integração.
- `src/world/maps/karakura.json` e `urahara.json` abrem diretamente no Tiled. A camada **Ground** usa o tileset `terrain.svg`; **Atmosphere** posiciona lanternas e postes.
- Fachadas, mobiliário e sombras são desenhados uma vez em uma textura estática. As árvores reutilizam o atlas original do Godot.
- Personagens e combate continuam no renderizador existente, em uma textura transparente, para preservar as sprites recuperadas e as regras de batalha. Migrar os atores para objetos Phaser independentes é uma etapa posterior.

## Editar mapas

Abra um JSON em Tiled e edite **Ground**, preservando o tamanho de 70 × 40 tiles de 16 px. O tileset SVG está em `src/world/terrain.svg`, relativo aos dois mapas. A disposição dos edifícios, colisões e portas continua em `karakura/world.js`, `city.js` e `urahara.js`: mudanças de layout no Tiled exigem atualizar essa geometria e rodar os testes. Editar um piso não altera colisões automaticamente.

`scripts/build-world-maps.mjs` reproduz os mapas iniciais. Ele sobrescreve os JSONs; não executar depois de edições manuais que precisam ser mantidas.

## Apresentação e desempenho

O terreno é carregado uma vez por local. O Phaser apresenta a 30 FPS, enquanto a simulação continua independente. Água e partículas usam poucos traços; os efeitos ficam estáticos quando `prefers-reduced-motion` está ativo. As copas ficam transparentes perto do jogador quando ele passa atrás delas. O Canvas original permanece como superfície acessível de teclado/toque, alinhada ao canvas do Phaser por CSS.

Se a inicialização gráfica falhar ou o contexto WebGL for perdido, a apresentação Canvas permanece disponível. Hospital, subterrâneo e distritos continuam com seus cenários existentes; esta etapa altera visualmente Karakura e a loja.

## Verificar

```sh
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

O Playwright verifica o alinhamento das superfícies, ausência de overflow, conversa com Urahara e viagens cidade → loja → subterrâneo → loja → cidade em desktop, mobile e com movimento reduzido. O workflow `World and navigation checks` executa esses passos nos PRs.
