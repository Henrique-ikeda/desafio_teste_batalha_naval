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

## Ambiguidades da spec (decisão pendente da dupla)

Nenhuma delas virou regra nem teste: ficam registradas para a dupla decidir.

1. **Seleção depois de uma recusa:** a seção 1 não diz se o navio continua selecionado depois de uma posição inválida. O TC-NV-08 clica `frota-D` de novo (é o que a seção 5 define como "posicionar"), e assim vale nas duas leituras.
2. **Clicar no próprio tabuleiro depois de Começar:** clicar num navio posicionado durante a batalha não deveria devolvê-lo, mas isso não está escrito. Proposta de TC: `CENARIO_BATALHA`, clicar `meu-A1` → `meu-A1` continua `navio`, nenhum `frota-*` aparece.
3. **`btn-aleatorio` e `btn-orientacao` depois de Começar:** desabilitados ou ignorados? Não está escrito.
4. **A mensagem "inválida" some** depois de uma jogada válida? Não está escrito.
5. **Clicar num navio posicionado com outro navio selecionado:** pela seção 1, ele só é devolvido "sem nenhum navio da lista selecionado". Mas o resultado (recusa com "inválida"? nada?) não está escrito.
6. **TC-NV-10:** a coluna de passos diz só "→ conferir". O teste confere o resultado esperado da linha e, a mais, 12 e 14 casas `navio`. O texto do TC não foi alterado.
7. **Tiro antes de Começar** (também levantada pelo Felipe): combinar uma proposta única.
