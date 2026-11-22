# Validação dos testes do Henrique (montagem da frota)

Num repositório "somente testes", falhar pelo motivo certo não prova que o teste está **certo**: um resultado esperado errado também falha. Este documento registra como os testes de `tests/montagem-da-frota.spec.js` (TC-NV-01 a 12 e os adicionais 31 a 36) foram validados pelos dois lados, sem colocar código do jogo no repositório.

## Método

1. O repositório foi copiado para um diretório temporário, fora do clone. **Nada desse diretório foi commitado**, e ele foi apagado no fim.
2. Lá, foi escrita uma **implementação de referência** mínima da montagem da frota em `js/main.js`, lida só do PLANEJAMENTO.md (seções 1 e 3: parâmetros `jogador`, `cpu` e `tiros-cpu`, `data-testid`, `data-estado` e regras). É uma leitura da spec independente da validação do Felipe ([VALIDACAO-TESTES-FELIPE.md](VALIDACAO-TESTES-FELIPE.md)). A implementação não é entregável e não está neste repositório.
3. Só o `tests/montagem-da-frota.spec.js` rodou contra ela: **20 de 20 testes passaram** (o TC-NV-31 tem 3 casos no `test.each`).
4. **Aleatoriedade:** TC-NV-11 e TC-NV-34 rodaram **50 vezes cada** contra a referência.
5. **Mutação manual:** um defeito por vez foi injetado na referência, e a suíte rodou contra cada mutante. Um mutante está "morto" quando pelo menos um teste falha.
6. A suíte completa rodou **3 vezes seguidas** sem mutante, para descartar teste intermitente.

## Resultados

| Verificação | Resultado |
|---|---|
| Suíte contra a referência | 20/20 passando |
| 3 rodadas seguidas | 20/20 nas três (sem intermitência) |
| TC-NV-11, 50 rodadas | 50/50 |
| TC-NV-34, 50 rodadas | 50/50 |
| Mutantes | 15 de 16 mortos; o que sobrevive é equivalente (ver abaixo) |

### Mutante → testes que o mataram

| # | Defeito injetado na referência | Morto por |
|---|---|---|
| 1 | Tabuleiro com 11 colunas | TC-NV-01, 05, 11, 34 |
| 2 | Porta-aviões com 4 casas | TC-NV-02, 03, 05, 06, 07, 08, 09, 10, 11, 31, 32, 34, 35 |
| 3 | Vertical cresce para cima | TC-NV-04, 31, 35 |
| 4 | `btn-orientacao` não troca o texto | TC-NV-04, 33 |
| 5 | Aceita navio saindo do tabuleiro | TC-NV-05, 31 |
| 6 | Sobreposição aceita sem checar o resto | TC-NV-06, 11, 34 |
| 7 | Aceita encostar de lado | TC-NV-11, **36** |
| 8 | Aceita encostar na diagonal | TC-NV-08, 11 |
| 9 | Devolver não limpa as casas | TC-NV-09, 32 |
| 10 | Devolver não volta para a lista | TC-NV-09, 32 |
| 11 | `btn-comecar` habilitado com 3 navios | TC-NV-10 |
| 12 | Aleatório ignora a regra de não encostar | TC-NV-11 |
| 13 | Aleatório soma à frota em vez de substituir | TC-NV-11, 34 |
| 14 | Frota do computador visível (`navio` no alvo) | TC-NV-01, 12 |
| 15 | Recusa inválida sem mensagem | TC-NV-05, 06, 07, 08, 31 |
| 16 | Só a checagem de sobreposição desligada | **sobrevive: mutante equivalente** |

**Mutante 16 (equivalente):** com a regra de não encostar, toda sobreposição também encosta no outro navio. Um navio tem pelo menos 2 casas, e a casa vizinha à sobreposta toca o navio de baixo. Por isso, desligar só a checagem de sobreposição não muda nenhum comportamento visível, e nenhum teste de interface consegue distinguir. O mutante 6, uma variante não equivalente (a sobreposição faz a validação aceitar), é morto pelo TC-NV-06.

**Mutante 7 e o TC-NV-36:** na primeira rodada, "aceita encostar de lado" **sobreviveu** aos TCs 01 a 12. O TC-NV-07 encosta dois navios paralelos (P em A1–E1, E em A2–D2), e esse encaixe também toca na diagonal, então a checagem diagonal recusava sozinha. O único "encostar só de lado" puro é **ponta com ponta na mesma linha**. Daí o TC-NV-36 (P em A1–E1, D em F1–G1), que mata o mutante.

## Como os testes evitam depender de sorte

- **TC-NV-11 e TC-NV-34** não conferem posições, e sim a **propriedade** da frota. As casas `navio` são agrupadas por vizinhança de 8 direções (inclusive diagonal). Precisam sair exatamente 4 grupos, de tamanhos {2, 3, 4, 5}, cada um em linha reta e contíguo. Um único conjunto de asserções prova que não há sobreposição, que nenhum navio encosta (nem na diagonal) e que nenhum dobra. O helper fica local no spec (`gruposComCasas`, `emLinhaReta`, `conferirFrotaValida`).
- **TC-NV-12** usa `cpu=FROTA_FIXA`: a sua frota é aleatória, mas o teste só confere o alvo, que é fixo.

## Ambiguidades da spec (resolvidas na tarefa A6)

As ambiguidades encontradas na validação viraram regras escritas na seção 1 do PLANEJAMENTO.md e casos de teste novos (branch `henrique/a6-regras-pendentes`):

| Ambiguidade | Regra adotada (seção 1) | TC |
|---|---|---|
| O navio continua selecionado depois de uma posição recusada? | Sim: basta clicar em outra casa | TC-NV-37 |
| A mensagem "inválida" some depois de uma jogada válida? | Sim: é apagada quando um navio é posicionado | TC-NV-38 |
| Clicar num navio posicionado com outro navio selecionado | É uma tentativa de posicionar o selecionado ali: recusada ("inválida"), nada é devolvido | TC-NV-39 |
| Clicar no próprio tabuleiro, Aleatório e Orientação depois de Começar | A montagem acabou: o clique no tabuleiro não faz nada; os dois botões ficam desabilitados | TC-NV-40 |
| Tiro antes de Começar (proposta do Felipe na validação dele) | Durante a montagem, clicar no alvo não faz nada | TC-NV-41 |
| Passos do TC-NV-10 diziam só "→ conferir" | Passos explicitados (o que conferir com 3 e com 4 navios); o resultado esperado não mudou | — |

O TC-NV-08 continua clicando `frota-D` de novo antes de G2 (é o que a seção 5 chama de "posicionar"); a regra da seleção é coberta à parte pelo TC-NV-37.

## Lacunas fechadas (A7)

A auditoria de completude achou regras sem teste ou com um exemplo só. A tarefa A7 acrescentou 15 casos em `tests/lacunas.spec.js` (TC-NV-29, 30 e 42 a 51), validados com o mesmo método: uma implementação de referência nova, escrita em diretório temporário só a partir das seções 1 e 3 e apagada no fim, e um mutante por regra.

| Verificação | Resultado |
|---|---|
| Suíte inteira (antiga + nova) contra a referência | 64/64 síncrona e 64/64 assíncrona (`setTimeout` no computador) |
| 3 rodadas seguidas (assíncrona) | 64/64 nas três |
| TC-NV-44 e TC-NV-51 (com sorteio), 50 rodadas | 50/50 cada |

### Mutantes: antes × depois

"Antes" = suíte de 44 testes que já estava na `main`; "depois" = suíte com a A7.

| Mutante (um defeito por vez) | Antes | Depois |
|---|---|---|
| Nova partida mantém os tiros no alvo | sobrevive | morto por 42 |
| Clicar de novo numa casa de acerto conta como tiro | sobrevive | morto por 30 |
| Nova partida depois do fim não volta à montagem | sobrevive | morto por 42 |
| Nova partida perde `cpu`/`tiros-cpu` | sobrevive | morto por 42, 43 |
| `tiros-cpu` esgotado: o computador para de atirar | sobrevive | morto por 44 |
| Vitória/derrota só quando o último navio é o Destroier | sobrevive | morto por 45 |
| Começar continua habilitado depois de devolver um navio | sobrevive | morto por 46 |
| Navio perde a seleção após recusa por sair / sobrepor / lado | sobrevive (os 3) | morto por 47 (os 3) |
| Submarino e Destroier não funcionam na vertical | sobrevive | morto por 48 |
| Encostar na vertical pela ponta é aceito | sobrevive | morto por 49 |
| Frota sorteada do computador pode encostar ou sobrepor | sobrevive | morto por 51 em 11 de 20 rodadas (ver abaixo) |
| Sobreposição só detectada na casa inicial | sobrevive | **sobrevive: equivalente** |
| Afundar passa a vez; afundar não conta acerto | morto por 21 | morto por 21, 29, 30 |
| Nova partida reaplica `jogador` | morto por 24 | morto por 24, 42 |
| Computador só afunda o Destroier; placar-meus só conta o D | morto por 22 | morto por 22, 45 |
| Diagonal só num dos quatro cantos | morto por 11 (aleatório) | morto por 11, 50 |
| Borda só na coluna / só na linha | morto por 31 / 05 | morto por 31 / 05, 47 |
| Computador atira depois da vitória | morto por 21 | morto por 21 |

Antes: 9 de 23 mortos. Depois: 21 de 23 mortos, e os dois que restam não são lacuna de teste:

- **Sobreposição só na casa inicial (equivalente):** com a regra de não encostar, uma sobreposição no meio do navio também encosta no outro navio pela casa vizinha, então a recusa acontece de qualquer jeito e nenhum teste de interface distingue.
- **Frota sorteada inválida (probabilístico):** o mutante só gera defeito visível quando o sorteio encosta ou sobrepõe navios. Quando o sorteio sai válido por acaso, não há o que detectar. Nas 20 rodadas, o TC-NV-51 pegou o defeito nas 11 em que ele apareceu, e o teste passou 50/50 contra a referência correta.

O TC-NV-49 foi corrigido durante a validação. A primeira versão (D vertical tocando a ponta de um navio horizontal) também tocava na diagonal, então não isolava o "encostar pela ponta". A versão final encosta dois navios verticais ponta com ponta na mesma coluna, o equivalente vertical do TC-NV-36.

### Ambiguidades que continuam abertas

O que `vez` mostra durante o turno do computador; a mensagem quando o computador acerta ou afunda um navio seu; clique do jogador durante a vez do computador; qual casa o computador sorteia depois que `tiros-cpu` acaba (o TC-NV-44 só exige casa nova); o estado inicial exato dos placares. Nenhum TC da A7 depende delas.
