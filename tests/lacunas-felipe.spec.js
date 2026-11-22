// Tarefa F6 (Felipe): lacunas de cobertura achadas na auditoria. Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md. Cenário padrão: CENARIO_BATALHA.
import { waitFor } from '@testing-library/dom';
import { abrirJogo, alvo, meu, screen, casasNoEstado, CENARIO_BATALHA } from './helpers.js';

// A spec não diz se o computador atira na hora ou com atraso: tudo que depende do tiro dele
// é conferido com waitFor, para o teste valer nas duas implementações.
const ESPERA = { timeout: 5000 };
/** Casas já atingidas de um lado (erro + acerto + afundado). */
const atingidas = (lado) => ['erro', 'acerto', 'afundado'].reduce((n, e) => n + casasNoEstado(lado, e).length, 0);

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
