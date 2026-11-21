// Tarefas A2–A5 (Henrique). Contrato: seções 1, 3 e 5 do PLANEJAMENTO.md.
import { abrirJogo, alvo, casasDe, casasNoEstado, FROTA_FIXA, LETRAS, meu, posicionar, screen, TODAS_AS_CASAS, TODAS_CASAS_FROTA_FIXA, within } from './helpers.js';

// Só a frota do computador é fixa (FROTA_FIXA: P em A1–A5, E em C1–C4, S em E1–E3, D em G1–G2); a sua sai do Aleatório.
const SO_CPU_FIXA = { cpu: FROTA_FIXA };

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

test('TC-NV-12 frota do computador escondida', async () => {
  const user = await abrirJogo(SO_CPU_FIXA);
  await user.click(screen.getByTestId('btn-aleatorio'));
  expect(screen.getByTestId('btn-comecar')).toBeEnabled();
  await user.click(screen.getByTestId('btn-comecar'));

  expect(screen.getByTestId('vez')).toHaveTextContent(/^Você$/);
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(100);
  expect(casasNoEstado('alvo', 'navio')).toHaveLength(0);
  for (const casa of TODAS_CASAS_FROTA_FIXA) {
    expect(alvo(casa)).toHaveAttribute('data-estado', 'oculto');
  }

  await user.click(alvo('A1'));
  expect(alvo('A1')).toHaveAttribute('data-estado', 'acerto');
  expect(casasNoEstado('alvo', 'oculto')).toHaveLength(99);
});

test('TC-NV-03 posicionar na horizontal', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1', 'H');

  // P (5 casas) em A1 para a direita: A1 a E1.
  for (const casa of ['A1', 'B1', 'C1', 'D1', 'E1']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'navio');
  }
  // Fronteira: a sexta casa da linha não pode virar navio.
  expect(meu('F1')).toHaveAttribute('data-estado', 'agua');
  // Não cresceu para baixo.
  expect(meu('A2')).toHaveAttribute('data-estado', 'agua');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(5);

  // O botão do P sai da lista; os outros continuam.
  expect(screen.queryByTestId('frota-P')).not.toBeInTheDocument();
  const lista = screen.getByTestId('lista-frota');
  for (const letra of ['E', 'S', 'D']) {
    expect(within(lista).getByTestId(`frota-${letra}`)).toBeVisible();
  }
});

test('TC-NV-04 girar para vertical', async () => {
  const user = await abrirJogo();
  // Clique à mão (sem o helper posicionar, que mexe sozinho na orientação).
  await user.click(screen.getByTestId('btn-orientacao'));
  expect(screen.getByTestId('btn-orientacao')).toHaveTextContent(/^Vertical$/);

  await user.click(screen.getByTestId('frota-E'));
  await user.click(meu('J1'));

  // E (4 casas) em J1 para baixo: J1 a J4.
  for (const casa of ['J1', 'J2', 'J3', 'J4']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'navio');
  }
  // Fronteira: a quinta casa da coluna não pode virar navio.
  expect(meu('J5')).toHaveAttribute('data-estado', 'agua');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(4);

  // Nada na linha 1 fora da coluna J.
  for (const letra of LETRAS.filter((l) => l !== 'J')) {
    expect(meu(`${letra}1`)).toHaveAttribute('data-estado', 'agua');
  }

  // O botão do E sai da lista; a orientação continua vertical.
  expect(screen.queryByTestId('frota-E')).not.toBeInTheDocument();
  expect(screen.getByTestId('btn-orientacao')).toHaveTextContent(/^Vertical$/);
});

test('TC-NV-09 devolver um navio', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1', 'H');

  // Pré-condição: o P está posicionado, então há o que devolver.
  expect(casasNoEstado('meu', 'navio')).toHaveLength(5);
  expect(screen.queryByTestId('frota-P')).not.toBeInTheDocument();

  // Nenhum navio da lista selecionado: clicar num navio já posicionado devolve o P.
  await user.click(meu('C1'));

  // As 5 casas do P voltam a água.
  for (const casa of ['A1', 'B1', 'C1', 'D1', 'E1']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'agua');
  }
  expect(casasNoEstado('meu', 'navio')).toHaveLength(0);
  expect(casasNoEstado('meu', 'agua')).toHaveLength(100);

  // O P volta para a lista de navios a posicionar.
  const lista = screen.getByTestId('lista-frota');
  expect(within(lista).getByTestId('frota-P')).toBeVisible();
  expect(within(lista).getByTestId('frota-P')).toHaveTextContent(/\b5\b/);
});

test('TC-NV-32 reposicionar um navio devolvido', async () => {
  const user = await abrirJogo();
  await posicionar(user, 'P', 'A1', 'H');
  // Devolve o P (nenhum navio da lista selecionado): clicar num navio posicionado.
  await user.click(meu('C1'));
  // Põe o P de novo, agora em A3 na horizontal.
  await posicionar(user, 'P', 'A3', 'H');

  // As casas da posição antiga voltaram a água.
  for (const casa of ['A1', 'B1', 'C1', 'D1', 'E1']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'agua');
  }
  // As casas da posição nova são navio.
  for (const casa of ['A3', 'B3', 'C3', 'D3', 'E3']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'navio');
  }
  // Fronteira: a sexta casa da linha 3 não pode virar navio.
  expect(meu('F3')).toHaveAttribute('data-estado', 'agua');
  // Só o P: exatamente 5 casas de navio.
  expect(casasNoEstado('meu', 'navio')).toHaveLength(5);

  // O P saiu da lista de novo.
  expect(screen.queryByTestId('frota-P')).not.toBeInTheDocument();
});

test('TC-NV-33 orientação alterna nos dois sentidos', async () => {
  const user = await abrirJogo();
  // Clique à mão (sem o helper posicionar, que corrige a orientação sozinho).
  // Busca o botão de novo a cada passo: o jogo pode recriá-lo ao trocar o texto.
  const botao = () => screen.getByTestId('btn-orientacao');
  await user.click(botao());
  expect(botao()).toHaveTextContent(/^Vertical$/);
  await user.click(botao());
  expect(botao()).toHaveTextContent(/^Horizontal$/);

  // Com a orientação de volta a horizontal, E (4 casas) em A1 vai para a direita: A1 a D1.
  await user.click(screen.getByTestId('frota-E'));
  await user.click(meu('A1'));
  for (const casa of ['A1', 'B1', 'C1', 'D1']) {
    expect(meu(casa)).toHaveAttribute('data-estado', 'navio');
  }
  // Não cresceu para baixo.
  expect(meu('A2')).toHaveAttribute('data-estado', 'agua');
  // Fronteira: a quinta casa da linha não pode virar navio.
  expect(meu('E1')).toHaveAttribute('data-estado', 'agua');
  expect(casasNoEstado('meu', 'navio')).toHaveLength(4);
});

test('TC-NV-05 sair do tabuleiro', async () => {
  const user = await abrirJogo();
  // P (5 casas) em G1 para a direita iria de G1 a K1: sai do tabuleiro (K não existe), então é recusado.
  await posicionar(user, 'P', 'G1', 'H');

  // Nenhuma casa muda: o tabuleiro continua todo água.
  expect(casasNoEstado('meu', 'agua')).toHaveLength(100);
  expect(casasNoEstado('meu', 'navio')).toHaveLength(0);
  // A mensagem avisa com "inválida" (regex sem âncora: a frase pode ter mais texto).
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/inválida/i);
  // O P continua na lista de navios a posicionar.
  expect(within(screen.getByTestId('lista-frota')).getByTestId('frota-P')).toBeVisible();
});
