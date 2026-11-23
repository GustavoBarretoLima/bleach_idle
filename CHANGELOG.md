# Changelog

## Em desenvolvimento

- Corrigida a folha do Ichigo LOBOTS: Shikai sem máscara e com Zangetsu larga (arquivo `ichigo-form-2.png` da galeria), substituindo a forma mascarada de espada fina usada por engano.
- Indicadores de corte e guarda aproximados do personagem para reduzir a separação visual em relação à espada.

- Ichigo Shikai usa a folha do Legend of Bleach (LOBOTS), com quatro direções sem espelhamento, caminhada e corrida em escala uniforme.
- Ataque, defesa e parry adaptados à mesma folha para evitar mudanças de estilo entre ações; espada e cabo permanecem unidos na textura original.
- Origem e limitações da arte de terceiros documentadas em `src/ichigo/lobots/README.md`.

- Corrigida a animação de ataque do Ichigo Shikai: arco de corte mais curto por direção, preparação, impacto e recuperação antes de voltar ao ombro.
- Corrigidos os pontos de encaixe do cabo nos punhos dos quadros de impacto de frente, costas e direita.
- Zangetsu permanece ancorada à mão e passa atrás do corpo na preparação/retorno; rastro breve indica a direção do golpe.

- Ichigo Shikai recebe sprites mais nítidas para repouso, caminhada, corrida e ataque, com quatro direções desenhadas separadamente.
- Zangetsu baseada na referência enviada, com cabo e lâmina em uma única textura rígida, ancorada à mão e sem deformação entre poses.
- Nova animação de defesa: preparação, levantamento, guarda, reação ao impacto e retorno; parry usa recuo e faíscas no ponto de contato.
- Animações respeitam movimento reduzido; a janela de parry e os atalhos J/K permanecem iguais.

- Combate manual por teclado: J ataca, K defende; parry nos primeiros 180 ms da defesa anula o golpe e atordoa o inimigo por 750 ms.
- Dez slots de magia com seleção de habilidades aprendidas, atalhos configuráveis, proteção contra conflitos e salvamento no navegador.
- Barra de combate utilizável por toque, indicação de recarga compartilhada, efeitos de defesa/parry e caça automática opcional.

- Primeira etapa visual de Karakura e Loja Urahara: apresentação em Phaser integrada ao React, pisos em mapas Tiled e reaproveitamento das árvores do Godot.
- Fachadas, telhados, calçadas, pontes, vitrines, mobiliário e detalhes internos redesenhados; água animada, lanternas e iluminação ambiente leve.
- Copas em profundidade com transparência perto do jogador, efeitos que respeitam movimento reduzido e apresentação Canvas de contingência.
- Testes dos mapas, acessos e pontes, além de verificação de navegação em desktop/mobile via Playwright.

- Recuperadas as folhas originais de movimento do Ichigo Shikai, com Zangetsu incorporada às poses de caminhada e corrida e escala proporcional.
- Ichigo Kurosaki disponível como personagem jogável de teste, iniciando como Shinigami com Shikai e Zangetsu.
- Partidas existentes recebem o personagem de teste sem perder níveis, itens ou progresso; Bankai já liberada é mantida.

- Karakura recriada com ruas, escola, clínica, hospital, rio e pontes.
- Interior da Loja Urahara com balcão de doces, artigos espirituais, portas shoji, tatami e mesa de chá.
- Urahara atende dentro da loja e mantém a escolha da classe Shinigami.
- Alçapão e escada conectam a loja à câmara subterrânea de treinamento, com deserto, formações rochosas e árvores secas.
- Portas e escada funcionam por toque, botão ou tecla E nas proximidades; os botões levam o personagem até o acesso.
- Retorno pela escada, saída para Karakura e restauração do local após recarregar.
