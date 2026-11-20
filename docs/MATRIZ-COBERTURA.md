# Matriz regra → casos de teste — Batalha naval

Cada regra da seção 1 do PLANEJAMENTO.md tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | Dois tabuleiros 10 × 10 | 01 |
| 2 | Frota 5 + 4 + 3 + 2 | 02, 03, 04, 10, 11 |
| 3 | Horizontal → direita, vertical → baixo | 03, 04 |
| 4 | Não sai do tabuleiro | 05 |
| 5 | Não sobrepõe | 06 |
| 6 | Não encosta, nem de lado nem na diagonal | 07, 08, 11 |
| 7 | Devolver navio posicionado | 09 |
| 8 | Começar só com 4 navios; Aleatório segue as regras | 10, 11 |
| 9 | Frota do computador escondida | 12 |
| 10 | Água / Acertou! | 13, 14 |
| 11 | Quem acerta atira de novo; quem erra passa a vez (os dois lados) | 15, 16, 17, 21, 22 |
| 12 | Sem tiro repetido | 18 |
| 13 | Afundar e "Afundou o *Nome*!"; placar | 19, 20 |
| 14 | Estatísticas de tiros e acertos | 18, 23 |
| 15 | Vitória, derrota (revela a frota do computador), nada depois do fim | 21, 22 |
| 16 | Nova partida volta à montagem | 24 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
