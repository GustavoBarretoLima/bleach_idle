# Ichigo Shikai: corpo animado e Zangetsu rígida

O personagem mantém o estilo chibi e recebe cabelo, roupa e silhuetas com maior contraste. `body.webp` reúne repouso, caminhada, corrida e ataque nas quatro direções; `guard.webp` reúne preparar, levantar, sustentar e reagir ao impacto. As caixas e âncoras reais dos pés e mãos estão em `frames.js`. As imagens originais foram geradas para o projeto e codificadas em WebP sem perda.

A Zangetsu usa a imagem de referência enviada nesta conversa: lâmina preta larga com um fio cinza, ponta alongada, cabo reto enfaixado e uma pequena faixa de tecido na extremidade. `zangetsu.webp` é uma única peça independente, alinhada horizontalmente. A imagem enviada pelo usuário não está incluída no repositório.

`renderer.js` aplica à arma apenas translação, rotação e escala uniforme. Cabo e lâmina nunca são separados ou deformados. O pivô acompanha a mão de cada pose; a mão é redesenhada sobre o cabo quando necessário. O tecido flexível da extremidade é parte da textura, separado visualmente do cabo rígido.

`pose.js` escolhe as poses com prioridade para impacto/parry e guarda. O início da defesa move a arma até a guarda; um impacto mostra recuo; parry acrescenta faíscas no ponto de contato; a soltura retorna à postura normal. Movimento reduzido mantém uma guarda legível sem oscilação. Os tempos de combate e atalhos permanecem nos módulos existentes.

## Referências pesquisadas

- [Ichigo 2D pixelart animations — rilay](https://rilay.itch.io/ichigo-2d-pixelart-animations): referência de organização direcional e poses com arma.
- [2d-sprites-animation](https://github.com/nicholasopopol/2d-sprites-animation): referência de organização de spritesheets e composição de cenas.
- [Bleach FE: Ichigo vs Byakuya — BwdYeti](https://pixeljoint.com/pixelart/45636.htm): relato do autor sobre animação e construção de sprites inspirados em Bleach.

As ilustrações finais são próprias desta implementação; os projetos acima servem como referências, não como dependências.

## Verificação

`npm test` verifica caixas válidas, âncoras, fases de defesa, parry, movimento reduzido e a aplicação da mesma escala nos dois eixos da arma. `npm run test:browser` cobre os cenários, atalhos e um parry contra um Hollow real. Os sprites antigos permanecem disponíveis como contingência enquanto os novos arquivos carregam.
