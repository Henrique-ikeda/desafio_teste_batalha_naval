// Tarefa F5 (Felipe). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
// Cenário padrão: CENARIO_BATALHA = as duas frotas fixas (FROTA_FIXA: P em A1–A5, E em C1–C4,
// S em E1–E3, D em G1–G2) e o computador atirando primeiro nas casas de AGUA_CPU (I1, I2, …: sempre água).
import { abrirJogo, alvo, screen, casasNoEstado, CENARIO_BATALHA, TODAS_CASAS_FROTA_FIXA } from './helpers.js';

/** Casas já atingidas de um lado (erro + acerto + afundado). */
const atingidas = (lado) => ['erro', 'acerto', 'afundado'].reduce((n, e) => n + casasNoEstado(lado, e).length, 0);
const texto = (id) => screen.getByTestId(id);

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
