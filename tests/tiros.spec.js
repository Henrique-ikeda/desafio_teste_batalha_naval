// Tarefas F2 e F3 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: P em A1–A5, E em C1–C4,
// S em E1–E3, D em G1–G2) e o computador atirando primeiro nas casas de AGUA_CPU (I1, I2, …: sempre água).
import { waitFor } from '@testing-library/dom';
import { abrirJogo, alvo, meu, screen, casasNoEstado, CENARIO_BATALHA } from './helpers.js';

// A spec não diz se o computador atira na hora ou com atraso: tudo que depende do tiro dele
// é conferido com waitFor, para o teste valer nas duas implementações.
const ESPERA = { timeout: 5000 };
/** Casas já atingidas de um lado (erro + acerto + afundado). */
const atingidas = (lado) => ['erro', 'acerto', 'afundado'].reduce((n, e) => n + casasNoEstado(lado, e).length, 0);
// O computador acerta A1 e A2 (porta-aviões, 5 casas: não afunda) e erra em I1.
const CPU_ACERTA_DUAS = { ...CENARIO_BATALHA, 'tiros-cpu': 'A1,A2,I1' };
// O computador afunda o seu destroier (G1–G2) e erra em I1.
const CPU_AFUNDA_D = { ...CENARIO_BATALHA, 'tiros-cpu': 'G1,G2,I1' };

test('TC-NV-13 água', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('J10'));
  expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Água!$/);
});

test('TC-NV-14 acerto', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Acertou!$/);
});

test('TC-NV-23 estatísticas', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  await user.click(alvo('J10'));
  await waitFor(() => {
    expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^2$/);
  expect(screen.getByTestId('acertos')).toHaveTextContent(/^1$/);
});

test('TC-NV-15 quem acerta atira de novo', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Acertou!$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  expect(atingidas('meu')).toBe(0);
  await user.click(alvo('A2'));
  expect(alvo('A2')).toHaveAttribute('data-estado', 'acerto');
  expect(atingidas('meu')).toBe(0);
});

test('TC-NV-16 água passa a vez', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('J10'));
  expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
  await waitFor(() => {
    expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  expect(atingidas('meu')).toBe(1);
  expect(meu('I2')).toHaveAttribute('data-estado', 'agua');
});

test('TC-NV-17 computador acerta e repete', async () => {
  const user = await abrirJogo(CPU_ACERTA_DUAS);
  await user.click(alvo('J10'));
  await waitFor(() => {
    expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  expect(meu('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(meu('A2')).toHaveAttribute('data-estado', 'acerto');
  expect(atingidas('meu')).toBe(3);
  expect(meu('A3')).toHaveAttribute('data-estado', 'navio');
});

test('TC-NV-18 casa repetida não conta', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('J10'));
  await waitFor(() => {
    expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  await user.click(alvo('J10'));
  expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
  expect(screen.getByTestId('tiros')).toHaveTextContent(/^1$/);
  expect(casasNoEstado('meu', 'erro')).toHaveLength(1);
  expect(meu('I2')).toHaveAttribute('data-estado', 'agua');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
});

test('TC-NV-26 computador afunda um navio seu', async () => {
  const user = await abrirJogo(CPU_AFUNDA_D);
  await user.click(alvo('J10'));
  await waitFor(() => {
    expect(meu('I1')).toHaveAttribute('data-estado', 'erro');
    expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  }, ESPERA);
  expect(meu('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(meu('G2')).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('placar-meus')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^4$/);
  expect(atingidas('meu')).toBe(3);
});
