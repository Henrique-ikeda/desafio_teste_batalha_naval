// Tarefa F4 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: D em G1–G2) e o computador
// atirando nas casas de AGUA_CPU (sempre água). Aqui só há tiros do jogador (acertos), então não há waitFor.
import { abrirJogo, alvo, screen, CENARIO_BATALHA, CASAS_FROTA_FIXA } from './helpers.js';

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

// Cada navio da FROTA_FIXA do computador, com o nome que a mensagem de afundar deve mostrar.
const NAVIOS = [
  ['P', 'Porta-aviões'],
  ['E', 'Encouraçado'],
  ['S', 'Submarino'],
  ['D', 'Destroier'],
];
test.each(NAVIOS)('TC-NV-20 mensagem ao afundar cada navio (%s: %s)', async (letra, nome) => {
  const user = await abrirJogo(CENARIO_BATALHA);
  const casas = CASAS_FROTA_FIXA[letra];

  for (const casa of casas.slice(0, -1)) {
    await user.click(alvo(casa));
    expect(alvo(casa)).toHaveAttribute('data-estado', 'acerto');
    expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Acertou!$/);
  }

  await user.click(alvo(casas[casas.length - 1]));
  for (const casa of casas) {
    expect(alvo(casa)).toHaveAttribute('data-estado', 'afundado');
  }
  expect(screen.getByTestId('mensagem')).toHaveTextContent(new RegExp(`^Afundou o ${nome}!$`));
  expect(screen.getByTestId('placar-cpu')).toHaveTextContent(/^3$/);

  const outra = letra === 'D' ? 'A1' : 'G1';
  expect(alvo(outra)).toHaveAttribute('data-estado', 'oculto');
});
