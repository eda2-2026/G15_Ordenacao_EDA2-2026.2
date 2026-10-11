async function execBubble() {
  let n = caixas.length;
  if(n === 0) return;

  const estado = salvarEstado();

  try {
    // Sem parada antecipada (como descrito no README): sempre faz as n passadas
    for (let i = 0; i < n; i++) {
      hlStep(1);
      logTerminal(`Passada ${i + 1}/${n}: verificando caixas até a posição ${n - 1 - i}...`);

      for (let j = 0; j < n - i - 1; j++) {
        await checkAbort();
        hlStep(2);
        await highlightCompare(j, j + 1);

        // Estável: só troca quando a da esquerda é ESTRITAMENTE maior
        if (caixas[j].val > caixas[j + 1].val) {
          hlStep(3);
          await swapDOM(j, j + 1);
        }
      }

      // A última posição da passada já está definitiva
      hlStep(4);
      caixas[n - 1 - i].el.classList.add('highlight-sorted');
    }
    hlStep(0);
  } catch (e) {
    hlStep(0);
    restaurarEstado(estado); // abortou no meio: restaura galpão original
    throw e;
  }
}