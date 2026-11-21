// Tarefa F4 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: D em G1–G2) e o computador
// atirando nas casas de AGUA_CPU (sempre água). Aqui só há tiros do jogador (acertos), então não há waitFor.
import { abrirJogo, alvo, screen, CENARIO_BATALHA } from './helpers.js';

test('TC-NV-19 afundar', async () => {
  const user = await abrirJogo(CENARIO_BATALHA);

  await user.click(alvo('G1'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'acerto');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Acertou!$/);

  await user.click(alvo('G2'));
  expect(alvo('G1')).toHaveAttribute('data-estado', 'afundado');
  expect(alvo('G2')).toHaveAttribute('data-estado', 'afundado');
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Afundou o Destroier!$/);
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('placar-meus')).toHaveTextContent(/^4$/);
});
