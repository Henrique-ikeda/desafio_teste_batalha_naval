# Matriz regra → casos de teste — Batalha naval

Cada regra da seção 1 do PLANEJAMENTO.md (e o parâmetro `jogador` do contrato da seção 3, linha 17) tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | Dois tabuleiros 10 × 10 | 01 |
| 2 | Frota 5 + 4 + 3 + 2 | 02, 03, 04, 10, 11 |
| 3 | Horizontal → direita, vertical → baixo | 03, 04, 33 |
| 4 | Não sai do tabuleiro | 05, 31 |
| 5 | Não sobrepõe | 06 |
| 6 | Não encosta, nem de lado nem na diagonal | 07, 08, 11 |
| 7 | Devolver navio posicionado | 09, 32 |
| 8 | Começar só com 4 navios; Aleatório segue as regras (e tira o que já estava) | 10, 11, 34 |
| 9 | Frota do computador escondida | 12 |
| 10 | Água / Acertou! | 13, 14 |
| 11 | Quem acerta atira de novo; quem erra passa a vez (os dois lados) | 15, 16, 17, 21, 22 |
| 12 | Sem tiro repetido (jogador e computador) | 18, 25 |
| 13 | Afundar e "Afundou o *Nome*!"; placar (os dois lados) | 19, 20, 26 |
| 14 | Estatísticas de tiros e acertos | 18, 23 |
| 15 | Vitória, derrota (revela a frota do computador), nada depois do fim (nos dois casos) | 21, 22, 27, 28 |
| 16 | Nova partida volta à montagem | 24 |
| 17 | Parâmetro `jogador` (contrato da seção 3) monta a sua frota e vai direto para a batalha | 35 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
