// Tarefa A7 (Henrique): lacunas de cobertura achadas na auditoria. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md. Cenário padrão: CENARIO_BATALHA.
import { waitFor } from '@testing-library/dom';
import { abrirJogo, alvo, meu, screen, casasNoEstado, CENARIO_BATALHA, TODAS_CASAS_FROTA_FIXA, FROTA_FIXA } from './helpers.js';

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
