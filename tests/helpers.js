// Helpers dos testes de interface (tarefa A1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (ex.: CENARIO_BATALHA)
 * @param {object} opcoesUser repassado a userEvent.setup
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  jest.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

export const LETRAS = 'ABCDEFGHIJ'.split('');
/** As 100 casas, coluna A primeiro: A1, A2, …, J10. */
export const TODAS_AS_CASAS = LETRAS.flatMap((l) => Array.from({ length: 10 }, (_, i) => `${l}${i + 1}`));

/** FROTA_FIXA (seção 3): os quatro navios em pé nas colunas A, C, E e G. */
export const FROTA_FIXA = 'P:A1:V,E:C1:V,S:E1:V,D:G1:V';
export const CASAS_FROTA_FIXA = {
  P: ['A1', 'A2', 'A3', 'A4', 'A5'],
  E: ['C1', 'C2', 'C3', 'C4'],
  S: ['E1', 'E2', 'E3'],
  D: ['G1', 'G2'],
};
export const TODAS_CASAS_FROTA_FIXA = Object.values(CASAS_FROTA_FIXA).flat();
/** AGUA_CPU: as 20 casas das colunas I e J, sem navio na FROTA_FIXA — o computador sempre erra. */
export const AGUA_CPU = ['I', 'J'].flatMap((l) => Array.from({ length: 10 }, (_, i) => `${l}${i + 1}`)).join(',');
/** Batalha pronta: as duas frotas fixas e o computador sempre errando. */
export const CENARIO_BATALHA = { jogador: FROTA_FIXA, cpu: FROTA_FIXA, 'tiros-cpu': AGUA_CPU };

/** Casa do seu tabuleiro / do alvo: meu('A1'), alvo('J10'). */
export const meu = (casa) => screen.getByTestId(`meu-${casa}`);
export const alvo = (casa) => screen.getByTestId(`alvo-${casa}`);
/** Todas as casas de um lado ('meu' ou 'alvo'). */
export const casasDe = (lado) => screen.getAllByTestId(new RegExp(`^${lado}-[A-J](10|[1-9])$`));
/** Casas de um lado num estado: casasNoEstado('meu', 'navio'). */
export const casasNoEstado = (lado, estado) => casasDe(lado).filter((c) => c.getAttribute('data-estado') === estado);

/**
 * Posiciona um navio: clica em `frota-<letra>`, ajusta `btn-orientacao` para 'H' ou 'V' (lendo o texto dele)
 * e clica na casa inicial do seu tabuleiro.
 */
export async function posicionar(user, letra, casa, orientacao = 'H') {
  await user.click(screen.getByTestId(`frota-${letra}`));
  const botao = screen.getByTestId('btn-orientacao');
  const quero = orientacao === 'H' ? 'Horizontal' : 'Vertical';
  if (botao.textContent.trim() !== quero) await user.click(botao);
  await user.click(meu(casa));
}

/**
 * Tamanhos dos grupos de casas `navio` do seu tabuleiro que se tocam (inclusive na diagonal), em ordem.
 * Com a regra de não encostar, uma frota válida dá [2, 3, 4, 5].
 */
export function gruposDeNavio() {
  const comNavio = new Set(casasNoEstado('meu', 'navio').map((c) => c.getAttribute('data-testid').slice(4)));
  const pos = (c) => [LETRAS.indexOf(c[0]), Number(c.slice(1))];
  const vistos = new Set();
  const tamanhos = [];
  for (const inicio of comNavio) {
    if (vistos.has(inicio)) continue;
    let tamanho = 0;
    const pilha = [inicio];
    vistos.add(inicio);
    while (pilha.length) {
      const atual = pilha.pop();
      tamanho++;
      const [x, y] = pos(atual);
      for (const outra of comNavio) {
        const [a, b] = pos(outra);
        if (!vistos.has(outra) && Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1) { vistos.add(outra); pilha.push(outra); }
      }
    }
    tamanhos.push(tamanho);
  }
  return tamanhos.sort((a, b) => a - b);
}
