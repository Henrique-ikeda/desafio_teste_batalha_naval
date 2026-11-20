# Planejamento — desafio_teste_batalha_naval

Batalha naval em tabuleiro **10 × 10**, jogador contra o computador, com 1 porta-aviões (5 casas), 1 encouraçado (4), 1 submarino (3) e 1 destroier (2): **Casos de teste de interface em JavaScript**. O jogo em si não é implementado (a entrega são só os testes); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Henrique (RA_HENRIQUE) | Henrique-ikeda | Setup do projeto e testes de: tabuleiros, montagem da frota, regra de não encostar e aleatório (tarefas A1–A5) |
| Felipe (RA_FELIPE) | GITHUB_FELIPE | CI, README e testes de: tiros, quem acerta joga de novo, afundar, estatísticas, vitória, derrota e nova partida (tarefas F1–F5) |

---

## 1. Regras do jogo (o que os testes verificam)

- Dois tabuleiros **10 × 10**: o **seu** e o **alvo** (do computador). Colunas **A–J**, linhas **1–10**; casa = letra + número (ex.: `C7`).
- **Frota de cada lado** (4 navios, 14 casas), sempre em linha reta:

  | Navio | Letra | Casas |
  |---|---|---|
  | Porta-aviões | P | 5 |
  | Encouraçado | E | 4 |
  | Submarino | S | 3 |
  | Destroier (ou Hidroavião) | D | 2 |

- **Fase 1 — montagem da frota:** o jogador clica num navio da lista, escolhe a orientação (**Horizontal** = para a direita, **Vertical** = para baixo) e clica na casa inicial do seu tabuleiro.
  - O navio **não pode** sair do tabuleiro, ficar em cima de outro nem **encostar** em outro navio, nem de lado nem na **diagonal** (tem que sobrar pelo menos uma casa de água em volta). Posição recusada: nada muda e a mensagem avisa com a palavra "inválida".
  - Clicar num navio já posicionado (sem nenhum navio da lista selecionado) **devolve** o navio para a lista.
  - **Aleatório** tira o que já estava e posiciona os 4 navios seguindo as mesmas regras.
  - **Começar** só fica habilitado com os 4 navios posicionados.
- O computador monta a frota dele em segredo, com as mesmas regras. Os navios dele ficam escondidos.
- **Fase 2 — batalha:** o jogador atira clicando numa casa do alvo.
  - **Acertou** (casa com navio): mensagem "Acertou!" e o jogador **atira de novo**.
  - **Água:** mensagem "Água!" e a vez passa para o computador, que atira no seu tabuleiro seguindo a mesma regra (acertou, atira de novo; errou, a vez volta para você).
  - Quando todas as casas de um navio foram atingidas, ele **afunda**: suas casas viram "afundado" e a mensagem diz "Afundou o *Nome*!" (ex.: "Afundou o Destroier!").
  - Não se atira duas vezes na mesma casa: clicar numa casa já atirada não faz nada e não conta como tiro. O computador também nunca repete.
- **Placar:** quantos navios de cada lado ainda não afundaram. **Estatísticas:** tiros e acertos do jogador.
- **Fim:** quem afundar os 4 navios do outro vence: "Você venceu!" ou "Você perdeu!". Ao perder, os navios do computador que sobraram aparecem. Depois do fim não se atira mais.
- **Nova partida:** volta para a fase 1, com a lista dos 4 navios e os tabuleiros limpos.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Entrega | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado |
| Executor dos testes | [Jest](https://jestjs.io) 29, com `babel-jest` (converte os ES Modules para CommonJS só nos testes) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`testEnvironment: 'jsdom'`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos fixos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (jest) — TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
```

### Por que os testes ficam falhando

O jogo não existe. Cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `Unable to find an element by: [data-testid="..."]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-*` de estado, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- As casas (`meu-XN`, `alvo-XN`) são criados pelo jogo e **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário.

### Como um teste abre o jogo — `tests/helpers.js`

`abrirJogo(params)` põe os parâmetros na URL, carrega o `index.html`, importa o `js/main.js` de novo (cada teste começa um jogo novo) e devolve o `user` do user-event para clicar como um jogador.

```js
import { abrirJogo, alvo, screen, CENARIO_BATALHA } from './helpers.js';

test('TC-NV-14 acerto', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Acertou!$/);
});
```

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê e clica: `screen.getByTestId(...)`, os atalhos do `helpers.js` e `user.click`/`user.dblClick`/`cliqueDireito(user, el)`. Nada de importar `js/*.js` ou chamar funções internas.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- A frota do computador e os tiros dele são controlados pelos **parâmetros de URL `cpu` e `tiros-cpu`**, e a frota do jogador pelo parâmetro `jogador` (seção 3). Um teste nunca depende de sorte; sem os parâmetros, o teste só pode conferir regras que valem para qualquer sorteio.
- Cada caso de teste da seção 5 vira um `test('TC-NV-NN ...')` com o **mesmo ID no título** (o verificador exige). Caso parametrizado → `test.each`, que conta como um caso só.
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd A2)
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd A2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/MATRIZ-COBERTURA.md         cada regra da seção 1 → casos de teste que a cobrem
```

### Estrutura e dono de cada arquivo

```
desafio_teste_batalha_naval/
├── index.html                    A1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js                    A1  vazio (o jogo não é implementado)
├── tests/helpers.js              A1  abrirJogo(), FROTA_FIXA e atalhos
├── tests/montagem-da-frota.spec.jsHenrique  (A2, A3, A4, A5)
├── tests/tiros.spec.js           Felipe    (F2, F3)
├── tests/afundar.spec.js         Felipe    (F4)
├── tests/fim-de-jogo.spec.js     Felipe    (F5)
├── .github/workflows/testes.yml  Felipe    (F1)
├── README.md                     Felipe    (F1; cada um atualiza a sua parte da tabela)
├── babel.config.cjs              A1  só para os testes (Jest): ESM → CommonJS
└── package.json                  A1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `tabuleiro-meu` / `tabuleiro-alvo` | Os dois tabuleiros |
| `lista-frota` | Lista dos navios a posicionar |
| `meu-A1` … `meu-J10` | Casas do seu tabuleiro. `data-estado` = `agua` \| `navio` \| `acerto` \| `erro` \| `afundado` |
| `alvo-A1` … `alvo-J10` | Casas do tabuleiro do computador. `data-estado` = `oculto` \| `erro` \| `acerto` \| `afundado` \| `navio` (só revelado quando você perde) |
| `frota-P`, `frota-E`, `frota-S`, `frota-D` | Botões da lista de navios a posicionar, com o nome e o tamanho no texto (ex.: "Porta-aviões (5)"). **Saem da página** quando o navio é posicionado e voltam se ele for devolvido |
| `btn-orientacao` | Alterna a orientação; o texto mostra "Horizontal" ou "Vertical" |
| `btn-aleatorio` | Posiciona a sua frota aleatoriamente |
| `btn-comecar` | Começa a batalha |
| `vez` | Na batalha: "Você" ou "Computador" |
| `placar-meus` / `placar-cpu` | Navios ainda não afundados de cada lado (número) |
| `tiros` / `acertos` | Seus tiros e acertos na partida (número) |
| `mensagem` | "Água!", "Acertou!", "Afundou o Destroier!", "Você venceu!", "Você perdeu!", avisos com "inválida" |
| `btn-nova-partida` | Volta para a montagem da frota |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `cpu` | `?cpu=P:A1:V,E:C1:V,S:E1:V,D:G1:V` | Frota fixa do computador. Formato `Letra:Casa:Orientação` (H ou V) |
| `jogador` | `?jogador=P:A1:V,E:C1:V,S:E1:V,D:G1:V` | Monta a sua frota e pula direto para a batalha |
| `tiros-cpu` | `?tiros-cpu=I1,I2,I3` | Ordem dos tiros do computador (depois de acabar a lista, volta a ser aleatório) |

`jogador` vale só ao abrir a página; a "Nova partida" sempre volta para a montagem. `cpu` e `tiros-cpu` continuam valendo.

### Cenário fixo usado nos testes

`FROTA_FIXA` = `P:A1:V,E:C1:V,S:E1:V,D:G1:V` — os quatro navios em pé, separados por uma coluna de água (respeita a regra de não encostar):

```
     A B C D E F G H I J
  1  P . E . S . D . . .
  2  P . E . S . D . . .
  3  P . E . S . . . . .
  4  P . E . . . . . . .
  5  P . . . . . . . . .
  6  . . . . . . . . . .
  …
 10  . . . . . . . . . .
```

Casas da frota (14): `A1`–`A5`, `C1`–`C4`, `E1`–`E3`, `G1`–`G2`.

`AGUA_CPU` = as 20 casas das colunas I e J (`I1`…`I10`, `J1`…`J10`), sem navio na `FROTA_FIXA`: o computador sempre erra.

`CENARIO_BATALHA` = `?jogador=FROTA_FIXA&cpu=FROTA_FIXA&tiros-cpu=AGUA_CPU`.

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx jest tests/<arquivo>.spec.js -t "TC-NV-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-NV-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da A1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da A1: se precisar mudar, combinem antes e façam um commit pequeno e separado. Tarefas que usam o mesmo arquivo: faça o merge de uma antes de começar a outra.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd A2` no Claude Code ou `$tdd A2` no Codex; depois, "go" escreve o próximo TC. Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Henrique (tarefas A)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **A1** Setup: `package.json`, `babel.config.cjs`, `js/main.js` vazio, `.gitignore`, `index.html` esqueleto, `tests/helpers.js`, verificador, skill, sub-agentes e hooks, PLANEJAMENTO e docs | `main` (repositório vazio, commit direto) | tudo | — |
| **A2** Tabuleiros e frota | `henrique/a2-tabuleiros` | tests/montagem-da-frota.spec.js | 01, 02, 12 |
| **A3** Posicionar, girar e devolver | `henrique/a3-posicionar` | tests/montagem-da-frota.spec.js | 03, 04, 09 |
| **A4** Posições inválidas (sair, sobrepor, encostar) | `henrique/a4-invalidas` | tests/montagem-da-frota.spec.js | 05, 06, 07, 08 |
| **A5** Começar e aleatório | `henrique/a5-aleatorio` | tests/montagem-da-frota.spec.js | 10, 11 |

### Felipe (tarefas F)

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **F1** CI no GitHub Actions + README (conferir e completar) | `felipe/f1-ci-readme` | .github/workflows, README.md | — |
| **F2** Tiros e estatísticas | `felipe/f2-tiros` | tests/tiros.spec.js | 13, 14, 18, 23 |
| **F3** Quem acerta joga de novo | `felipe/f3-vez` | tests/tiros.spec.js | 15, 16, 17 |
| **F4** Afundar | `felipe/f4-afundar` | tests/afundar.spec.js | 19, 20 |
| **F5** Vitória, derrota e nova partida | `felipe/f5-fim` | tests/fim-de-jogo.spec.js | 21, 22, 24 |

## 5. Casos de teste (interface)

"Posicionar X em Y, H/V" = clicar `frota-X`, deixar `btn-orientacao` em Horizontal ou Vertical e clicar `meu-Y`.

### Henrique — tabuleiros e montagem da frota

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-NV-01 | Dois tabuleiros 10 × 10 | Abrir a página | 100 casas `meu-*` com `agua` e 100 casas `alvo-*` com `oculto`; existem `meu-A1` e `meu-J10`, e não existe `meu-K1` nem `meu-A11` |
| TC-NV-02 | Lista da frota | Abrir a página | `frota-P`, `frota-E`, `frota-S`, `frota-D` visíveis com os tamanhos 5, 4, 3, 2 no texto; `btn-orientacao` = "Horizontal"; `btn-comecar` desabilitado |
| TC-NV-03 | Posicionar na horizontal | Posicionar P em A1, H | `meu-A1` a `meu-E1` = `navio`; `meu-F1` = `agua`; `frota-P` sai da página |
| TC-NV-04 | Girar para vertical | Clicar `btn-orientacao`; posicionar E em J1 | `btn-orientacao` = "Vertical"; `J1`, `J2`, `J3`, `J4` = `navio`; `J5` = `agua` |
| TC-NV-05 | Sair do tabuleiro | Posicionar P em G1, H (iria de G1 a K1) | Nenhuma casa muda (100 `agua`); `mensagem` contém "inválida"; `frota-P` continua na lista |
| TC-NV-06 | Sobreposição | Posicionar P em A1, H; depois E em C1, V | Só as 5 casas do P = `navio`; `mensagem` contém "inválida"; `frota-E` continua na lista |
| TC-NV-07 | Encostar de lado | Posicionar P em A1, H; depois E em A2, H | Só as 5 casas do P = `navio`; `mensagem` contém "inválida"; `frota-E` continua |
| TC-NV-08 | Encostar na diagonal | Posicionar P em A1, H; D em F2, H (F2 encosta em E1 na diagonal); depois D em G2, H | Em F2: recusado, "inválida", `frota-D` continua. Em G2: aceito, `meu-G2` e `meu-H2` = `navio` |
| TC-NV-09 | Devolver um navio | Posicionar P em A1, H; clicar `meu-C1` | `meu-A1` a `meu-E1` voltam a `agua`; `frota-P` volta para a lista |
| TC-NV-10 | Começar só com a frota completa | Posicionar P em A1, H; E em A3, H; S em A5, H → conferir; D em A7, H → conferir | `btn-comecar` desabilitado com 3 navios; habilitado com 4 |
| TC-NV-11 | Aleatório respeita as regras | 10 vezes: clicar `btn-aleatorio` | A cada vez: exatamente 14 casas `navio`; os grupos de casas `navio` que se tocam (inclusive na diagonal) são 4, com tamanhos 2, 3, 4 e 5; a lista de navios fica vazia; `btn-comecar` habilitado |
| TC-NV-12 | Frota do computador escondida | `?cpu=FROTA_FIXA`. Clicar `btn-aleatorio`, `btn-comecar`; depois atirar em `alvo-A1` | Antes do tiro: `vez` = "Você" e as 100 casas do alvo `oculto`, inclusive as 14 da frota. O tiro em A1 dá `acerto` (o navio estava lá, escondido) |

### Felipe — batalha e fim de jogo

Todos com `CENARIO_BATALHA` (`?jogador=FROTA_FIXA&cpu=FROTA_FIXA&tiros-cpu=AGUA_CPU`), salvo quando dito outro.

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-NV-13 | Água | Atirar em `alvo-J10` | `alvo-J10` = `erro`; `mensagem` = "Água!" |
| TC-NV-14 | Acerto | Atirar em `alvo-A1` | `alvo-A1` = `acerto`; `mensagem` = "Acertou!" |
| TC-NV-15 | Quem acerta atira de novo | Atirar em `alvo-A1` | `vez` = "Você"; nenhuma casa do seu tabuleiro foi atingida (0 casas `erro`, `acerto` ou `afundado` em `meu-*`) |
| TC-NV-16 | Água passa a vez | Atirar em `alvo-J10` | O computador atirou uma vez: `meu-I1` = `erro` e é a única casa atingida no seu tabuleiro; depois a `vez` volta para "Você" |
| TC-NV-17 | Computador acerta e repete | `tiros-cpu=A1,A2,I1`. Atirar em `alvo-J10` | `meu-A1` = `acerto`, `meu-A2` = `acerto`, `meu-I1` = `erro` (três tiros seguidos do computador); `vez` = "Você" |
| TC-NV-18 | Casa repetida não conta | Atirar em `alvo-J10`; atirar de novo em `alvo-J10` | `tiros` = 1; só 1 casa `erro` no seu tabuleiro (o computador atirou uma vez só) |
| TC-NV-19 | Afundar | Atirar em `alvo-G1` e `alvo-G2` | As duas = `afundado`; `mensagem` = "Afundou o Destroier!"; `placar-cpu` = 3 |
| TC-NV-20 | Mensagem de cada navio (parametrizado) | Afundar P (`A1`–`A5`), E (`C1`–`C4`), S (`E1`–`E3`) ou D (`G1`–`G2`) | "Afundou o Porta-aviões!" / "Afundou o Encouraçado!" / "Afundou o Submarino!" / "Afundou o Destroier!"; `placar-cpu` = 3 |
| TC-NV-21 | Vitória | Atirar nas 14 casas da frota do computador | `mensagem` = "Você venceu!"; `placar-cpu` = 0; o computador não atirou nenhuma vez (só acertos); atirar em `alvo-J10` depois não muda nada (`tiros` continua 14) |
| TC-NV-22 | Derrota | `tiros-cpu` = as 14 casas da `FROTA_FIXA`. Atirar em `alvo-J10` | O computador acerta 14 seguidas: `mensagem` = "Você perdeu!"; `placar-meus` = 0; as 14 casas da frota do computador aparecem como `navio` no alvo |
| TC-NV-23 | Estatísticas | Atirar em `alvo-A1` (acerto) e depois em `alvo-J10` (água) | `tiros` = 2; `acertos` = 1 |
| TC-NV-24 | Nova partida | Atirar em `alvo-A1`; clicar `btn-nova-partida` | Volta à montagem: `frota-P`, `E`, `S`, `D` na lista; 100 casas `meu-*` com `agua`; 100 `alvo-*` com `oculto`; `btn-comecar` desabilitado; `tiros` = 0 |

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Henrique** cria o repositório e adiciona `GITHUB_FELIPE` como colaborador (Settings → Collaborators). **Felipe** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main` (fora o setup inicial, com o repositório vazio). Uma branch por tarefa: `henrique/a2-...`, `felipe/f2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas. O CI precisa estar verde no PR.
7. Ordem: **A1 entra primeiro** (estrutura do projeto). Depois disso as tarefas A e F andam em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo**
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: especificação, colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → resultado esperado)
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main`
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_batalha_naval`
