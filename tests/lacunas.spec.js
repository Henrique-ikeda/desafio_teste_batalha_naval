// Tarefa A7 (Henrique): lacunas de cobertura achadas na auditoria. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md. Cenário padrão: CENARIO_BATALHA.
import { waitFor } from '@testing-library/dom';
import { abrirJogo, alvo, meu, screen, within, posicionar, casasNoEstado, casasDe, CENARIO_BATALHA, TODAS_AS_CASAS, LETRAS, TODAS_CASAS_FROTA_FIXA, FROTA_FIXA } from './helpers.js';

// O Porta-aviões (A1–A5) por último: o jogo só acaba quando o 4º navio afunda, qualquer que seja ele.
const OUTROS_ANTES_DO_P = ['C1', 'C2', 'C3', 'C4', 'E1', 'E2', 'E3', 'G1', 'G2'];
const CASAS_P = ['A1', 'A2', 'A3', 'A4', 'A5'];

// A spec não diz se o computador atira na hora ou com atraso: tudo que depende do tiro dele
// é conferido com waitFor, para o teste valer nas duas implementações.
const ESPERA = { timeout: 5000 };
// Só a frota do computador é fixa; a sua sai do Aleatório.
const SO_CPU_FIXA = { cpu: FROTA_FIXA };
/** Casas já atingidas de um lado (erro + acerto + afundado). */
const atingidas = (lado) => ['erro', 'acerto', 'afundado'].reduce((n, e) => n + casasNoEstado(lado, e).length, 0);
// O computador acerta as 14 casas da sua frota, uma atrás da outra: o jogador perde.
const CPU_VENCE = { ...CENARIO_BATALHA, 'tiros-cpu': TODAS_CASAS_FROTA_FIXA.join(',') };

test('TC-NV-29 afundar não passa a vez', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('G1'));
  await user.click(alvo('G2'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(alvo('G2')).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Afundou o Destroier!$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^2$/);
  expect(atingidas('meu')).toBe(0);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^3$/);
  await user.click(alvo('J10'));
  await waitFor(() => {
    expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^2$/);
  expect(atingidas('meu')).toBe(1);
});

test('TC-NV-30 clique repetido em acerto e em afundado não conta', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  await user.click(alvo('G1'));
  await user.click(alvo('G2'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(alvo('G2')).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^3$/);
  await user.click(alvo('G1'));
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  expect(atingidas('meu')).toBe(0);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Afundou o Destroier!$/);
});

// Terceiro argumento: como levar a partida ao fim (vitória ou derrota) antes de pedir Nova partida.
test.each([
  ['vitória', CENARIO_BATALHA, async (user) => {
    for (const c of TODAS_CASAS_FROTA_FIXA) await user.click(alvo(c));
    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Você venceu!$/);
  }],
  ['derrota', CPU_VENCE, async (user) => {
    await user.click(alvo('J10'));
    await waitFor(() => expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Você perdeu!$/), { timeout: 15000 });
  }],
])('TC-NV-42 nova partida depois do fim e uma segunda partida (%s)', async (_nome, params, levarAoFim) => {
  const user = await abrirJogo(params);
  await levarAoFim(user);
  await user.click(screen.getByTestId('btn-nova-partida'));

  for (const l of ['P', 'E', 'S', 'D']) expect(screen.getByTestId(`frota-${l}`)).toBeVisible();
  expect(casasNoEstado('meu', 'agua')).toHaveLength(100);
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(100);
  expect(screen.getByTestId('btn-comecar')).toBeDisabled();
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('mensagem')).not.toHaveTextContent(/Você (venceu|perdeu)!/);

  await user.click(screen.getByTestId('btn-aleatorio'));
  await user.click(screen.getByTestId('btn-comecar'));
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^4$/);
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(99);
}, 30_000);

test('TC-NV-43 nova partida mantém a frota cpu', async () => {
  const user = await abrirJogo(SO_CPU_FIXA);
  await user.click(screen.getByTestId('btn-aleatorio'));
  await user.click(screen.getByTestId('btn-comecar'));
  await user.click(alvo('J10'));
  await waitFor(() => expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/), ESPERA);

  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('frota-P')).toBeVisible();
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(100);

  await user.click(screen.getByTestId('btn-aleatorio'));
  await user.click(screen.getByTestId('btn-comecar'));
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^4$/);
});

// O computador só tem 1 tiro na lista (I1); depois dele volta a sortear (seção 3, parâmetro tiros-cpu).
const SO_UM_TIRO_CPU = { jogador: FROTA_FIXA, cpu: FROTA_FIXA, 'tiros-cpu': 'I1' };
const minhaVez = () => /^Você$/.test(screen.getByTestId('vez').textContent.trim());
const perdeu = () => /^Você perdeu!$/.test(screen.getByTestId('mensagem').textContent.trim());

test('TC-NV-44 tiros-cpu esgotado: o computador volta a sortear e não repete', async () => {
  const user = await abrirJogo(SO_UM_TIRO_CPU);
  let antes = 0;
  for (const casa of ['J10', 'J9', 'J8']) {
    await user.click(alvo(casa));
    await waitFor(() => {
      expect(alvo(casa)).toHaveAttribute('data-estado', 'erro');
      expect(atingidas('meu')).toBeGreaterThan(antes);
      expect(perdeu() || minhaVez()).toBe(true);
    }, ESPERA);
    if (casa === 'J10') expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    antes = atingidas('meu');
  }
  expect(atingidas('meu')).toBeGreaterThanOrEqual(3);
}, 30_000);

test('TC-NV-45 vitória com o Porta-aviões por último', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  for (const c of OUTROS_ANTES_DO_P) await user.click(alvo(c));
  for (const c of ['A1', 'A2', 'A3', 'A4']) await user.click(alvo(c));
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('mensagem')).not.toHaveTextContent(/Você venceu!/);
  expect(alvo('A5')).toHaveAttribute('data-estado', 'oculto');
  await user.click(alvo('A5'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Você venceu!$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^14$/);
}, 30_000);

test('TC-NV-45 derrota com o Porta-aviões por último', async () => {
  const params = { ...CENARIO_BATALHA, 'tiros-cpu': [...OUTROS_ANTES_DO_P, ...CASAS_P].join(',') };
  const user = await abrirJogo(params);
  await user.click(alvo('J10'));
  await waitFor(() => expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Você perdeu!$/), { timeout: 15000 });
  expect(screen.getByTestId('placar-meus')).toHaveTextContent(/^0$/);
  for (const c of CASAS_P) expect(meu(c)).toHaveAttribute('data-estado', 'afundado');
}, 30_000);

test('TC-NV-46 Começar volta a desabilitar depois de devolver um navio', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1', 'H');
  await posicionar(user, 'E', 'A3', 'H');
  await posicionar(user, 'S', 'A5', 'H');
  await posicionar(user, 'D', 'A7', 'H');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(14);
  expect(screen.getByTestId('btn-comecar')).toBeEnabled();

  // Nenhum navio selecionado: clicar numa casa ocupada pelo P devolve o P.
  await user.click(meu('C1'));
  expect(screen.getByTestId('btn-comecar')).toBeDisabled();
  expect(within(screen.getByTestId('lista-frota')).getByTestId('frota-P')).toBeVisible();
  expect(casasNoEstado('meu', 'navio')).toHaveLength(9);
});

// Recusa por sair do tabuleiro, sobrepor, encostar pelo lado ou pela ponta: o navio continua selecionado,
// então a casa válida seguinte posiciona ele sem precisar clicar em frota-<letra> de novo.
test.each([
  { motivo: 'sair', antes: null, navio: 'P', recusa: 'G1', valida: 'A1', casas: ['A1', 'B1', 'C1', 'D1', 'E1'] },
  { motivo: 'sobrepor', antes: ['P', 'A1'], navio: 'E', recusa: 'C1', valida: 'A3', casas: ['A3', 'B3', 'C3', 'D3'] },
  { motivo: 'lado', antes: ['P', 'A1'], navio: 'E', recusa: 'A2', valida: 'A4', casas: ['A4', 'B4', 'C4', 'D4'] },
  { motivo: 'ponta', antes: ['P', 'A1'], navio: 'D', recusa: 'F1', valida: 'A3', casas: ['A3', 'B3'] },
])('TC-NV-47 navio continua selecionado depois da recusa por $motivo', async ({ antes, navio, recusa, valida, casas }) => {
  const user = await abrirJogo();
  if (antes) await posicionar(user, antes[0], antes[1], 'H');
  const navios0 = casasNoEstado('meu', 'navio').length;

  // Seleciona o navio à mão, sem posicionar: a orientação continua Horizontal.
  await user.click(screen.getByTestId(`frota-${navio}`));
  await user.click(meu(recusa));
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(casasNoEstado('meu', 'navio')).toHaveLength(navios0);
  expect(within(screen.getByTestId('lista-frota')).getByTestId(`frota-${navio}`)).toBeVisible();

  // Sem clicar no navio de novo: a casa válida posiciona ele.
  await user.click(meu(valida));
  for (const c of casas) expect(meu(c)).toHaveAttribute('data-estado', 'navio');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(navios0 + casas.length);
  expect(screen.queryByTestId(`frota-${navio}`)).not.toBeInTheDocument();
});

test('TC-NV-48 submarino e destroier na vertical', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'S', 'J1', 'V');
  await posicionar(user, 'D', 'A9', 'V');

  // S (3 casas) em J1–J3 e D (2 casas) em A9–A10, ambos na vertical; nada vai para a direita.
  expect(meu('J1')).toHaveAttribute('data-estado', 'navio');
  expect(meu('J2')).toHaveAttribute('data-estado', 'navio');
  expect(meu('J3')).toHaveAttribute('data-estado', 'navio');
  expect(meu('J4')).toHaveAttribute('data-estado', 'agua');
  expect(meu('A9')).toHaveAttribute('data-estado', 'navio');
  expect(meu('A10')).toHaveAttribute('data-estado', 'navio');
  expect(meu('B9')).toHaveAttribute('data-estado', 'agua');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(5);
  expect(screen.queryByTestId('frota-S')).not.toBeInTheDocument();
  expect(screen.queryByTestId('frota-D')).not.toBeInTheDocument();
});

test('TC-NV-49 encostar na ponta, na mesma coluna', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'E', 'A1', 'V'); // A1–A4
  // D (2 casas) na vertical em A5–A6: A5 encosta em A4 só pela ponta (sem diagonal).
  await posicionar(user, 'D', 'A5', 'V');

  expect(meu('A5')).toHaveAttribute('data-estado', 'agua');
  expect(meu('A6')).toHaveAttribute('data-estado', 'agua');
  for (const c of ['A1', 'A2', 'A3', 'A4']) expect(meu(c)).toHaveAttribute('data-estado', 'navio');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(4);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(within(screen.getByTestId('lista-frota')).getByTestId('frota-D')).toBeVisible();
});

// P em C3–G3. O D (2 casas, horizontal) encosta em C3 ou G3 só pela diagonal, num dos quatro cantos: tem de ser recusado.
test.each([
  { canto: 'de cima à esquerda', casa: 'A2', casasD: ['A2', 'B2'] },   // B2 toca C3
  { canto: 'de cima à direita', casa: 'H2', casasD: ['H2', 'I2'] },    // H2 toca G3
  { canto: 'de baixo à esquerda', casa: 'A4', casasD: ['A4', 'B4'] },  // B4 toca C3
  { canto: 'de baixo à direita', casa: 'H4', casasD: ['H4', 'I4'] },   // H4 toca G3
])('TC-NV-50 encostar na diagonal no canto $canto', async ({ casa, casasD }) => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'C3', 'H');
  await posicionar(user, 'D', casa, 'H');

  for (const c of casasD) expect(meu(c)).toHaveAttribute('data-estado', 'agua');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(5);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  expect(within(screen.getByTestId('lista-frota')).getByTestId('frota-D')).toBeVisible();
});

// Sem cpu: o computador sorteia a frota. Os tiros dele acertam as 14 casas da sua frota (você perde na 1ª água).
const CPU_SORTEADA_VENCE = { jogador: FROTA_FIXA, 'tiros-cpu': TODAS_CASAS_FROTA_FIXA.join(',') };

// Casas do alvo que mostram navio (navio, acerto ou afundado), como [coluna 0–9, linha 1–10].
const casasDoAlvoComNavio = () => casasDe('alvo')
  .filter((c) => ['navio', 'acerto', 'afundado'].includes(c.getAttribute('data-estado')))
  .map((c) => {
    const id = c.getAttribute('data-testid').slice(5);
    return [LETRAS.indexOf(id[0]), Number(id.slice(1))];
  });

// Componentes conexos das casas dadas, com vizinhança de 8 direções. Cada grupo é uma lista de [x, y].
const gruposAlvo = (casas) => {
  const vistos = new Set();
  const grupos = [];
  for (let i = 0; i < casas.length; i++) {
    if (vistos.has(i)) continue;
    vistos.add(i);
    const grupo = [];
    const pilha = [i];
    while (pilha.length) {
      const atual = pilha.pop();
      const [x, y] = casas[atual];
      grupo.push(casas[atual]);
      casas.forEach(([a, b], j) => {
        if (!vistos.has(j) && Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1) {
          vistos.add(j);
          pilha.push(j);
        }
      });
    }
    grupos.push(grupo);
  }
  return grupos;
};

// Grupo reto: todas na mesma linha com max-min da coluna === n-1, ou todas na mesma coluna com max-min da linha === n-1.
const emLinhaRetaAlvo = (grupo) => {
  const n = grupo.length;
  const xs = grupo.map(([x]) => x);
  const ys = grupo.map(([, y]) => y);
  const mesmaLinha = ys.every((y) => y === ys[0]) && Math.max(...xs) - Math.min(...xs) === n - 1;
  const mesmaColuna = xs.every((x) => x === xs[0]) && Math.max(...ys) - Math.min(...ys) === n - 1;
  return mesmaLinha || mesmaColuna;
};

test('TC-NV-51 frota sorteada do computador segue as regras', async () => {
  const user = await abrirJogo(CPU_SORTEADA_VENCE);
  for (const casa of TODAS_AS_CASAS) {
    if (/^Você perdeu!$/.test(screen.getByTestId('mensagem').textContent.trim())) break;
    await user.click(alvo(casa));
    await waitFor(() => expect(/^Você$/.test(screen.getByTestId('vez').textContent.trim()) || /^Você perdeu!$/.test(screen.getByTestId('mensagem').textContent.trim())).toBe(true), ESPERA);
  }
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Você perdeu!$/);

  const casas = casasDoAlvoComNavio();
  expect(casas).toHaveLength(14);
  const grupos = gruposAlvo(casas);
  expect(grupos.map((g) => g.length).sort((a, b) => a - b)).toEqual([2, 3, 4, 5]);
  for (const g of grupos) expect(emLinhaRetaAlvo(g)).toBe(true);
}, 60_000);
