# Sprites originais recuperadas

Arquivos originais criados para BleachSoulBreak-Godot em 02/11/2026, recuperados sem redesenho ou alteração dos pixels:

- `shikai-walk.png`: “Folha de sprites: Ichigo parado e caminhando.png” (`libfile_78748da23f848191b75556e64e12ff83`).
- `shikai-run.png`: “Sprite sheet do Ichigo Shikai correndo.png” (`libfile_634950b7246481919ca844951c0ec197`).

`frames.js` contém os recortes das poses completas e as âncoras dos pés. Caminhada usa a primeira coluna como repouso e as quatro seguintes como ciclo; corrida usa as quatro colunas. As quatro linhas correspondem às vistas frente/esquerda, costas/esquerda, costas/direita e frente/direita, mapeadas para baixo, esquerda, cima e direita. Não há espelhamento.

`movement.js` desenha personagem e espada juntos, com uma escala única de 0,14 nos dois eixos. A restauração afeta repouso, caminhada e corrida do Shikai. Ataques e demais formas continuam no atlas existente.
