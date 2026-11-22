# Matriz regra → casos de teste — Batalha naval

Cada regra da seção 1 do PLANEJAMENTO.md (e o parâmetro `jogador` do contrato da seção 3, linha 17) tem pelo menos um caso de teste que obriga o jogo a cumpri-la.

| # | Regra (seção 1) | TCs |
|---|---|---|
| 1 | Dois tabuleiros 10 × 10 | 01 |
| 2 | Frota 5 + 4 + 3 + 2 | 02, 03, 04, 10, 11 |
| 3 | Horizontal → direita, vertical → baixo | 03, 04, 33, 48 |
| 4 | Não sai do tabuleiro | 05, 31, 47 |
| 5 | Não sobrepõe | 06 |
| 6 | Não encosta, nem de lado nem na diagonal | 07, 08, 11, 36, 49, 50 (o lado puro, sem diagonal, é isolado pelo 36 e pelo 49; o 07 também é recusado pela diagonal) |
| 7 | Devolver navio posicionado | 09, 32, 46 |
| 8 | Começar só com 4 navios (10, 46); Aleatório segue as regras e tira o que já estava (11, 34) | 10, 11, 34, 46 |
| 9 | Frota do computador escondida | 12 |
| 10 | Água / Acertou! | 13, 14 |
| 11 | Quem acerta atira de novo; quem erra passa a vez (os dois lados) | 15, 16, 17, 21, 22 |
| 12 | Sem tiro repetido (jogador e computador) | 18, 25 (probabilístico: o computador sorteia), 30, 44 |
| 13 | Afundar e "Afundou o *Nome*!"; placar (os dois lados); afundar mantém a vez | 19, 20, 26, 29 |
| 14 | Estatísticas de tiros e acertos | 18, 23 |
| 15 | Vitória, derrota (revela a frota do computador), nada depois do fim (nos dois casos) | 21, 22, 27, 28 |
| 16 | Nova partida volta à montagem (do meio e do fim; `cpu` e `tiros-cpu` continuam valendo) | 24, 42, 43 |
| 17 | Parâmetro `jogador` (contrato da seção 3) monta a sua frota e vai direto para a batalha | 35 |
| 18 | Navio continua selecionado depois da recusa; a mensagem "inválida" some ao posicionar | 37, 38, 47 |
| 19 | Clicar num navio posicionado com outro selecionado é recusado (não devolve) | 39 |
| 20 | Depois de Começar a montagem acaba (tabuleiro, Aleatório e Orientação) | 40 |
| 21 | Sem tiro antes de Começar | 41 |
| 22 | O computador monta a frota dele com as mesmas regras (frota sorteada) | 51 |
| 23 | `tiros-cpu` esgotado: o computador volta a sortear (contrato da seção 3) | 44 |
| 24 | O jogo acaba quando o 4º navio afunda, qualquer que seja (vitória e derrota) | 21, 22, 45 |

**Para que serve:** se alguém fosse implementar o jogo só a partir destes testes, toda regra do jogo teria um teste exigindo que ela exista.
