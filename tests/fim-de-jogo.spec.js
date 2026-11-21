// Tarefa F5 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: P em A1–A5, E em C1–C4,
// S em E1–E3, D em G1–G2) e o computador atirando primeiro nas casas de AGUA_CPU (I1, I2, …: sempre água).
import { waitFor } from '@testing-library/dom';
import { abrirJogo, alvo, meu, screen, casasNoEstado, CENARIO_BATALHA, TODAS_CASAS_FROTA_FIXA } from './helpers.js';

/** Casas já atingidas de um lado (erro + acerto + afundado). */
const atingidas = (lado) => ['erro', 'acerto', 'afundado'].reduce((n, e) => n + casasNoEstado(lado, e).length, 0);
const texto = (id) => screen.getByTestId(id);
// O computador acerta as 14 casas da sua frota, uma atrás da outra (cada acerto dá direito a outro tiro).
const CPU_VENCE = { ...CENARIO_BATALHA, 'tiros-cpu': TODAS_CASAS_FROTA_FIXA.join(',') };

test('TC-NV-21 vitória', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  for (const casa of TODAS_CASAS_FROTA_FIXA) {
    await user.click(alvo(casa));
  }
  expect(texto('mensagem')).toHaveTextContent(/^Você venceu!$/);
  expect(texto('placar-cpu')).toHaveTextContent(/^0$/);
  expect(texto('acertos')).toHaveTextContent(/^14$/);
  expect(texto('tiros')).toHaveTextContent(/^14$/);
  expect(atingidas('meu')).toBe(0);
  const casasAfundadas = TODAS_CASAS_FROTA_FIXA.map((casa) => alvo(casa));
  expect(casasAfundadas).toHaveLength(14);
  for (const casa of casasAfundadas) {
    expect(casa).toHaveAttribute('data-estado', 'afundado');
  }

  await user.click(alvo('J10'));
  expect(alvo('J10')).toHaveAttribute('data-estado', 'oculto');
  expect(texto('tiros')).toHaveTextContent(/^14$/);
  expect(texto('mensagem')).toHaveTextContent(/^Você venceu!$/);
  expect(atingidas('meu')).toBe(0);
});

test('TC-NV-22 derrota', async () => {
  const user = await abrirJogo(CPU_VENCE);
  await user.click(alvo('J10'));
  await waitFor(() => expect(texto('mensagem')).toHaveTextContent(/^Você perdeu!$/), { timeout: 15000 });
  expect(texto('placar-meus')).toHaveTextContent(/^0$/);
  for (const casa of TODAS_CASAS_FROTA_FIXA) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'afundado');
  }
  expect(atingidas('meu')).toBe(14);
  for (const casa of TODAS_CASAS_FROTA_FIXA) {
    expect(alvo(casa)).toHaveAttribute('data-estado', 'navio');
  }
  expect(casasNoEstado('alvo', 'navio')).toHaveLength(14);
  expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
}, 30_000);

test('TC-NV-24 nova partida', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(texto('tiros')).toHaveTextContent(/^1$/);
  expect(texto('acertos')).toHaveTextContent(/^1$/);
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('frota-P')).toBeVisible();
  expect(screen.getByTestId('frota-E')).toBeVisible();
  expect(screen.getByTestId('frota-S')).toBeVisible();
  expect(screen.getByTestId('frota-D')).toBeVisible();
  expect(casasNoEstado('meu', 'agua')).toHaveLength(100);
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(100);
  expect(screen.getByTestId('btn-comecar')).toBeDisabled();
  expect(texto('tiros')).toHaveTextContent(/^0$/);
  expect(texto('acertos')).toHaveTextContent(/^0$/);
});

test('TC-NV-27 derrota bloqueia novos tiros', async () => {
  const user = await abrirJogo(CPU_VENCE);
  await user.click(alvo('J10'));
  await waitFor(() => expect(texto('mensagem')).toHaveTextContent(/^Você perdeu!$/), { timeout: 15000 });
  expect(texto('tiros')).toHaveTextContent(/^1$/);
  expect(alvo('A1')).toHaveAttribute('data-estado', 'navio');
  await user.click(alvo('J9'));
  expect(alvo('J9')).toHaveAttribute('data-estado', 'oculto');
  expect(texto('tiros')).toHaveTextContent(/^1$/);
  expect(texto('mensagem')).toHaveTextContent(/^Você perdeu!$/);
  expect(atingidas('meu')).toBe(14);
}, 30_000);

test('TC-NV-28 derrota revela só os navios que sobraram', async () => {
  const user = await abrirJogo(CPU_VENCE);
  await user.click(alvo('G1'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'acerto');
  await user.click(alvo('G2'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(alvo('G2')).toHaveAttribute('data-estado', 'afundado');
  expect(texto('mensagem')).toHaveTextContent(/^Afundou o Destroier!$/);
  await user.click(alvo('J10'));
  await waitFor(() => expect(texto('mensagem')).toHaveTextContent(/^Você perdeu!$/), { timeout: 15000 });
  expect(alvo('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(alvo('G2')).toHaveAttribute('data-estado', 'afundado');
  const restantes = TODAS_CASAS_FROTA_FIXA.filter((c) => !['G1', 'G2'].includes(c));
  expect(restantes).toHaveLength(12);
  for (const casa of restantes) {
    expect(alvo(casa)).toHaveAttribute('data-estado', 'navio');
  }
  expect(casasNoEstado('alvo', 'navio')).toHaveLength(12);
  expect(texto('placar-cpu')).toHaveTextContent(/^3$/);
  expect(texto('placar-meus')).toHaveTextContent(/^0$/);
}, 30_000);
