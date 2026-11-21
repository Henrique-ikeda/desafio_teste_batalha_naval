# desafio_teste_batalha_naval

[![Testes](https://github.com/Henrique-ikeda/desafio_teste_batalha_naval/actions/workflows/testes.yml/badge.svg)](https://github.com/Henrique-ikeda/desafio_teste_batalha_naval/actions/workflows/testes.yml)

Desafio de testes: casos de teste para testar a **batalha naval** em tabuleiro **10 × 10**, com 1 porta-aviões (5 casas), 1 encouraçado (4), 1 submarino (3) e 1 destroier ou hidroavião (2), com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Especificação do desafio

- Dois tabuleiros 10 × 10 (colunas A–J, linhas 1–10): o seu e o do computador.
- Frota de cada lado: Porta-aviões (5 casas), Encouraçado (4), Submarino (3) e Destroier (2), em linha reta.
- Montagem: escolher o navio, a orientação e a casa inicial; navios não podem sair do tabuleiro, sobrepor nem encostar (nem na diagonal); clicar num navio posicionado devolve ele; botão Aleatório.
- Batalha: atirar no tabuleiro do computador; quem acerta atira de novo; quem erra passa a vez.
- "Afundou o …!" quando todas as casas do navio são atingidas; placar de navios e estatísticas de tiros e acertos.
- Vence quem afundar os 4 navios do outro; ao perder, a frota do computador é revelada; botão de nova partida.

Regras completas, contrato da tela e divisão das tarefas: [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Henrique Kendi Ikeda | 24039456-2 | [Henrique-ikeda](https://github.com/Henrique-ikeda) | Tarefas A1–A5: estrutura do projeto e 12 casos de teste (tabuleiros, montagem da frota, regra de não encostar e aleatório) |
| Felipe Galeti Gôngora | 24036480-2 | [FGaleti](https://github.com/FGaleti) | Tarefas F1–F5: CI, README, 12 casos de teste do plano (tiros, quem acerta joga de novo, afundar, estatísticas, vitória, derrota e nova partida) e casos adicionais a partir do TC-NV-25 |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits: cada caso de teste tem o seu commit `test: TC-NV-NN ...`, feito da conta de quem o escreveu, e chega à `main` por Pull Request revisado pelo outro integrante.

## Como rodar

Requisitos: Node.js 18 ou superior (a CI testa 18, 20 e 22, no Ubuntu e no Windows).

```bash
npm install                 # ou npm ci
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-NV-NN"   # um caso só
```

## Funcionamento dos casos de teste

> **Para o corretor:** `npm test` termina com falhas **de propósito** (o jogo não é implementado; a entrega são os casos de teste). O comando que valida a entrega é `npm run verificar`, que sai com código 0 quando todos os testes falham pelo motivo certo.

**Situação:** somente os casos de teste. O jogo não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (`meu-A1` … `meu-J10`, `alvo-A1` … `alvo-J10`, `frota-P`/`E`/`S`/`D`, `btn-orientacao`, `btn-aleatorio`, `btn-comecar`, `vez`, `placar-meus`, `placar-cpu`, `tiros`, `acertos`, `mensagem`, `btn-nova-partida`). O estado de cada casa fica em `data-estado`.
- **Sem depender de sorte:** as frotas e os tiros do computador são passados pelos parâmetros de URL `jogador`, `cpu` e `tiros-cpu`. A `FROTA_FIXA` deixa os quatro navios em pé nas colunas A, C, E e G, e os tiros `AGUA_CPU` caem nas colunas I e J (sempre água), então cada caso sabe de antemão onde cada tiro cai.
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-NV-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md. A [matriz de cobertura](docs/MATRIZ-COBERTURA.md) liga cada regra do jogo aos seus casos.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`. Uso de IA documentado em [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).
- **Integração contínua:** o GitHub Actions ([`.github/workflows/testes.yml`](.github/workflows/testes.yml)) roda `npm ci` e `npm run verificar` em todo push e Pull Request, com Node 18, 20 e 22 no Ubuntu e no Windows, e guarda como artefato o relatório JSON do Jest e a saída do verificador. Na entrega, o job `verificar-completo` (rodado à mão ou num PR com o rótulo `entrega`) roda `npm run verificar:completo`, que também exige um teste para cada caso da tabela abaixo.

## Casos de teste (24)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-NV-01 | Dois tabuleiros 10 × 10 | `tests/montagem-da-frota.spec.js` | 100 casas `meu-*` com `agua` e 100 casas `alvo-*` com `oculto`; existem `meu-A1` e `meu-J10`, e não existe `meu-K1` nem `meu-A11` | Henrique |
| TC-NV-02 | Lista da frota | `tests/montagem-da-frota.spec.js` | `frota-P`, `frota-E`, `frota-S`, `frota-D` visíveis com os tamanhos 5, 4, 3, 2 no texto; `btn-orientacao` = "Horizontal"; `btn-comecar` desabilitado | Henrique |
| TC-NV-03 | Posicionar na horizontal | `tests/montagem-da-frota.spec.js` | `meu-A1` a `meu-E1` = `navio`; `meu-F1` = `agua`; `frota-P` sai da página | Henrique |
| TC-NV-04 | Girar para vertical | `tests/montagem-da-frota.spec.js` | `btn-orientacao` = "Vertical"; `J1`, `J2`, `J3`, `J4` = `navio`; `J5` = `agua` | Henrique |
| TC-NV-05 | Sair do tabuleiro | `tests/montagem-da-frota.spec.js` | Nenhuma casa muda (100 `agua`); `mensagem` contém "inválida"; `frota-P` continua na lista | Henrique |
| TC-NV-06 | Sobreposição | `tests/montagem-da-frota.spec.js` | Só as 5 casas do P = `navio`; `mensagem` contém "inválida"; `frota-E` continua na lista | Henrique |
| TC-NV-07 | Encostar de lado | `tests/montagem-da-frota.spec.js` | Só as 5 casas do P = `navio`; `mensagem` contém "inválida"; `frota-E` continua | Henrique |
| TC-NV-08 | Encostar na diagonal | `tests/montagem-da-frota.spec.js` | Em F2: recusado, "inválida", `frota-D` continua. Em G2: aceito, `meu-G2` e `meu-H2` = `navio` | Henrique |
| TC-NV-09 | Devolver um navio | `tests/montagem-da-frota.spec.js` | `meu-A1` a `meu-E1` voltam a `agua`; `frota-P` volta para a lista | Henrique |
| TC-NV-10 | Começar só com a frota completa | `tests/montagem-da-frota.spec.js` | `btn-comecar` desabilitado com 3 navios; habilitado com 4 | Henrique |
| TC-NV-11 | Aleatório respeita as regras | `tests/montagem-da-frota.spec.js` | A cada vez: exatamente 14 casas `navio`; os grupos de casas `navio` que se tocam (inclusive na diagonal) são 4, com tamanhos 2, 3, 4 e 5; a lista de navios fica vazia; `btn-comecar` habilitado | Henrique |
| TC-NV-12 | Frota do computador escondida | `tests/montagem-da-frota.spec.js` | Antes do tiro: `vez` = "Você" e as 100 casas do alvo `oculto`, inclusive as 14 da frota. O tiro em A1 dá `acerto` (o navio estava lá, escondido) | Henrique |
| TC-NV-13 | Água | `tests/tiros.spec.js` | `alvo-J10` = `erro`; `mensagem` = "Água!" | Felipe |
| TC-NV-14 | Acerto | `tests/tiros.spec.js` | `alvo-A1` = `acerto`; `mensagem` = "Acertou!" | Felipe |
| TC-NV-15 | Quem acerta atira de novo | `tests/tiros.spec.js` | `vez` = "Você"; nenhuma casa do seu tabuleiro foi atingida (0 casas `erro`, `acerto` ou `afundado` em `meu-*`) | Felipe |
| TC-NV-16 | Água passa a vez | `tests/tiros.spec.js` | O computador atirou uma vez: `meu-I1` = `erro` e é a única casa atingida no seu tabuleiro; depois a `vez` volta para "Você" | Felipe |
| TC-NV-17 | Computador acerta e repete | `tests/tiros.spec.js` | `meu-A1` = `acerto`, `meu-A2` = `acerto`, `meu-I1` = `erro` (três tiros seguidos do computador); `vez` = "Você" | Felipe |
| TC-NV-18 | Casa repetida não conta | `tests/tiros.spec.js` | `tiros` = 1; só 1 casa `erro` no seu tabuleiro (o computador atirou uma vez só) | Felipe |
| TC-NV-19 | Afundar | `tests/afundar.spec.js` | As duas = `afundado`; `mensagem` = "Afundou o Destroier!"; `placar-cpu` = 3 | Felipe |
| TC-NV-20 | Mensagem de cada navio (parametrizado) | `tests/afundar.spec.js` | "Afundou o Porta-aviões!" / "Afundou o Encouraçado!" / "Afundou o Submarino!" / "Afundou o Destroier!"; `placar-cpu` = 3 | Felipe |
| TC-NV-21 | Vitória | `tests/fim-de-jogo.spec.js` | `mensagem` = "Você venceu!"; `placar-cpu` = 0; o computador não atirou nenhuma vez (só acertos); atirar em `alvo-J10` depois não muda nada (`tiros` continua 14) | Felipe |
| TC-NV-22 | Derrota | `tests/fim-de-jogo.spec.js` | O computador acerta 14 seguidas: `mensagem` = "Você perdeu!"; `placar-meus` = 0; as 14 casas da frota do computador aparecem como `navio` no alvo | Felipe |
| TC-NV-23 | Estatísticas | `tests/tiros.spec.js` | `tiros` = 2; `acertos` = 1 | Felipe |
| TC-NV-24 | Nova partida | `tests/fim-de-jogo.spec.js` | Volta à montagem: `frota-P`, `E`, `S`, `D` na lista; 100 casas `meu-*` com `agua`; 100 `alvo-*` com `oculto`; `btn-comecar` desabilitado; `tiros` = 0 | Felipe |

## Estrutura

```
index.html                    esqueleto da tela (elementos da seção 3)
js/main.js                    ponto de entrada do jogo (vazio)
tests/helpers.js              abrirJogo(), FROTA_FIXA e atalhos
tests/*.spec.js               casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md               regras, contrato, tarefas e casos de teste
docs/                         matriz de cobertura e TDD com IA
```
