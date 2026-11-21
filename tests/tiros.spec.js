// Tarefas F2 e F3 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: P em A1–A5, E em C1–C4,
// S em E1–E3, D em G1–G2) e o computador atirando primeiro nas casas de AGUA_CPU (I1, I2, …: sempre água).
import { abrirJogo, alvo, screen, CENARIO_BATALHA } from './helpers.js';

test('TC-NV-13 água', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);
  await user.click(alvo('J10'));
  expect(alvo('J10')).toHaveAttribute('data-estado', 'erro');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Água!$/);
});
