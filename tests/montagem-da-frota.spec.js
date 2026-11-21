// Tarefas A2–A5 (Henrique). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, alvo, casasDe, casasNoEstado, meu, screen, TODAS_AS_CASAS, within } from './helpers.js';

test('TC-NV-01 dois tabuleiros 10 × 10', async () => {
  await abrirJogo();
  expect(casasDe('meu')).toHaveLength(100);
  expect(casasNoEstado('meu', 'agua')).toHaveLength(100);
  expect(casasDe('alvo')).toHaveLength(100);
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(100);
  for (const casa of TODAS_AS_CASAS) {
    expect(meu(casa)).toBeInTheDocument();
    expect(alvo(casa)).toBeInTheDocument();
  }
  expect(meu('A1')).toBeInTheDocument();
  expect(meu('J10')).toBeInTheDocument();
  expect(screen.queryByTestId('meu-K1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('meu-A11')).not.toBeInTheDocument();
  expect(screen.queryByTestId('alvo-K1')).not.toBeInTheDocument();
  expect(screen.queryByTestId('alvo-A11')).not.toBeInTheDocument();
});

test('TC-NV-02 lista da frota', async () => {
  await abrirJogo();
  const lista = screen.getByTestId('lista-frota');
  // Cada navio: letra do data-testid e tamanho que aparece no texto do botão.
  for (const [letra, tamanho] of [['P', 5], ['E', 4], ['S', 3], ['D', 2]]) {
    const botao = screen.getByTestId(`frota-${letra}`);
    expect(botao).toBeVisible();
    expect(botao).toHaveTextContent(new RegExp(`\\b${tamanho}\\b`));
    expect(within(lista).getByTestId(`frota-${letra}`)).toBe(botao);
  }
  expect(screen.getByTestId('btn-orientacao')).toHaveTextContent(/^Horizontal$/);
  expect(screen.getByTestId('btn-comecar')).toBeDisabled();
});
