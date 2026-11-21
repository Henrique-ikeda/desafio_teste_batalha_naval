# Validação dos casos de teste do Felipe (TC-NV-13 a 28)

Num repositório "somente testes", ver um teste **falhar pelo motivo certo** não prova que ele está **certo**: um resultado esperado errado também falha. Este documento registra como os testes do Felipe foram validados dos dois lados, sem colocar código do jogo no repositório.

## Método

1. **Cópia fora do repositório.** O projeto foi copiado para uma pasta temporária, fora do clone. Nada dessa pasta foi commitado, e ela foi apagada no fim.
2. **Implementação de referência.** Na cópia, o `js/main.js` recebeu uma implementação mínima do jogo, escrita **só** a partir do PLANEJAMENTO.md: regras da seção 1, `data-testid`, `data-estado` e parâmetros de URL (`jogador`, `cpu`, `tiros-cpu`) da seção 3. Ela **não é entregável** e não está neste repositório.
3. **Testes contra a referência.** Os specs do Felipe (`tests/tiros.spec.js`, `tests/afundar.spec.js` e `tests/fim-de-jogo.spec.js`) rodaram sem nenhuma alteração. Num jogo correto, **todos precisam passar**.
4. **Variante assíncrona.** A mesma referência rodou com cada tiro do computador atrasado por `setTimeout` de 300 ms. A spec não diz se o computador atira na hora, então os testes usam `waitFor` para tudo o que depende do tiro dele e precisam passar nos dois casos.
5. **Mutação manual.** Um defeito por vez foi injetado na referência. Cada mutante precisa ser **morto**, isto é, derrubar pelo menos um teste.
6. **Intermitência.** A suíte rodou 3 vezes seguidas em cada variante.

## Resultados

| Execução | Resultado |
|---|---|
| Referência síncrona | 19/19 testes passaram (os 16 TCs; o TC-NV-20 tem 4 casos) |
| Referência assíncrona (computador com 300 ms por tiro) | 19/19 passaram |
| 3 repetições, síncrona e assíncrona | 19/19 em todas: nenhum teste intermitente |
| Repositório real (`js/main.js` vazio), `npm run verificar` | Todos **falham pelo motivo certo**: `TestingLibraryElementError` (casa não encontrada) |

### Mutantes: 15 de 15 mortos

| # | Defeito injetado | Mortos por |
|---|---|---|
| 1 | Quem acerta **não** joga de novo | TC-NV-15, 21, 28 |
| 2 | Água **não** passa a vez | TC-NV-16, 17, 18, 22, 25, 26, 27, 28 |
| 3 | Casa repetida conta como tiro | TC-NV-18 |
| 4 | O computador repete casa (sorteio com reposição) | TC-NV-25 (morto nas 8 execuções) |
| 5 | O computador acerta e **não** atira de novo | TC-NV-17, 22, 26, 27, 28 |
| 6 | Navio afunda com uma casa a menos | TC-NV-19, 20, 21, 22, 27, 28 |
| 7 | Mensagem de afundar com o nome errado | TC-NV-19, 20, 28 |
| 8 | `placar-cpu` não diminui | TC-NV-19, 20, 21, 28 |
| 9 | `placar-meus` não diminui | TC-NV-22, 26, 28 |
| 10 | `acertos` não aumenta | TC-NV-21, 23, 24 |
| 11 | A vitória não bloqueia novos tiros | TC-NV-21 |
| 12 | A derrota não bloqueia novos tiros | TC-NV-27 |
| 13 | A derrota não revela a frota do computador | TC-NV-22, 27, 28 |
| 14 | A derrota revela também por cima das casas já afundadas | TC-NV-28 |
| 15 | Nova partida não zera `tiros` | TC-NV-24 |

Os mutantes 12 e 14 só morrem com os TCs adicionais (27 e 28): sem eles, nenhum teste do plano pegava esses defeitos. O mutante 9 já morria pelo TC-NV-22; o TC-NV-26 o pega também sem precisar de uma derrota.

## Decisões tomadas a partir da validação

- **TC-NV-25 atira nas 86 casas de água do alvo**, e não só nas 20 das colunas I e J. Com 20 rodadas, um computador que sorteia com reposição passa despercebido em cerca de 15% das execuções, porque a repetição pode cair numa casa já acertada, e acerto dá novo tiro. Com 86 rodadas, ele foi pego em todas as execuções.
- **Esperas generosas.** `waitFor` com até 5 s por tiro do computador (15 s para as 14 jogadas seguidas da derrota) e timeout de 120 s no TC-NV-25. Elas só custam tempo num jogo lento; no repositório sem jogo, os testes falham já no primeiro clique.
- **Primeiro o positivo, depois as negativas.** Em todo teste que depende do computador, o `waitFor` espera um efeito que só existe com o jogo (por exemplo, `meu-I1` = `erro` e a `vez` de volta para "Você") e só depois confere contagens e o "nada mudou".

## Ambiguidades da especificação (decisão pendente da dupla)

Nenhuma delas virou regra nos testes. Os testes foram escritos para valer em qualquer escolha.

1. **Tiro antes de Começar.** A seção 1 não diz o que acontece ao clicar no alvo durante a montagem. Proposta de regra: "Durante a montagem, clicar no alvo não faz nada." Proposta de TC: abrir sem `jogador`, clicar `alvo-A1` → `alvo-A1` = `oculto`, `tiros` vazio ou 0, `frota-P` ainda na lista. O TC só será implementado se a regra entrar na seção 1.
2. **O que `vez` mostra durante o turno do computador** (com o computador atirando com atraso). Os testes só exigem "Você" quando a vez volta.
3. **Mensagem durante e depois do turno do computador.** A spec não diz se o tiro do computador muda a `mensagem` nem se há aviso quando ele afunda um navio seu. Por isso o TC-NV-26 confere o tabuleiro e o `placar-meus`, mas não a `mensagem`.
4. **`tiros-cpu` com casa repetida ou já atingida.** A spec não diz o que fazer (pular? ignorar?). Por isso o TC-NV-25 não usa `tiros-cpu`.
