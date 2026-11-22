# Mundo Humano — Karakura

Adaptação jogável da cidade de Karakura para o mapa inicial do Bleach Idle. A disposição é própria para o jogo e não representa uma reprodução exata do mapa oficial.

Referências consultadas:
- https://bleach.fandom.com/wiki/Karakura_Town/Image_Gallery — galeria que identifica um mapa publicado em Bleach: Official Character Book SOULs e imagens dos locais.
- https://bleach.fandom.com/wiki/Locations — locais do Mundo Humano.
- https://bleach-world.forum-actif.net/t2070-carte-de-karakura — mapa de fãs, usado como referência complementar.

Locais representados: Escola de Karakura, Clínica Kurosaki, Hospital de Karakura, Loja Urahara, Armazém Visored e Rio Onose. A Praça dos Espíritos é uma área de encontro criada para o jogo.

O desenho é feito em Canvas uma vez ao entrar na cidade. As dimensões e a transformação de posições do serviço de presença continuam compatíveis. O exterior tem colisões compartilhadas com os dados dos prédios, e o rio só permite travessia pelas duas pontes. Urahara fica diante da loja; Ryūken, Sado e Inoue continuam no hospital. Os distritos de combate continuam acessíveis pelo menu existente.

Validação: compilação Vite; verificação de caminhos até os NPCs, entrada do hospital e as duas margens; colisões do rio e edifícios; conversão de coordenadas do serviço de presença. A execução visual no navegador ainda precisa de confirmação, pois o Chromium deste ambiente não iniciou.

## Loja Urahara e subterrâneo

Referências: https://bleach.fandom.com/wiki/Urahara_Shop e https://bleach.fandom.com/wiki/Trials_of_the_Shattered_Shaft, além de imagens do anime mostrando as salas de tatami e shoji.

A loja contém balcão de doces, prateleiras, tatami, mesa baixa e alçapão. Urahara atende no interior. A escada conecta o piso da loja à câmara desértica subterrânea, com formações rochosas, árvores secas e teto representado em azul. O Senkaimon está representado como cenário inativo. O subterrâneo é explorável; não concede XP e não adiciona novas viagens ou combates.

Validação adicional: `node --test tests/urahara.test.js` e simulação do ciclo completo cidade → loja → diálogo/classe de Urahara → subterrâneo → loja → cidade → hospital → cidade, incluindo restauração do salvamento no subterrâneo. Cenas renderizadas em Canvas foram inspecionadas. O teste da aplicação em navegador continua pendente.
