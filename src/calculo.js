const C = {
  leitura: { custo: 0.01, tempo: 0.5 },
  movimento: { custo: 0.50, tempo: 2.0 },
  area: { custo: 2.00, tempo: 0 }
};

let metricas = { leituras: 0, movs: 0, area: 0 };

function resetMetricas() {
  metricas = { leituras: 0, movs: 0, area: 0 };
  updateMetricasUI();
}

function addMetrica(tipo, valor = 1) {
  metricas[tipo] += valor;
  updateMetricasUI();
}

function updateMetricasUI() {
  const custo = (metricas.leituras * C.leitura.custo) + (metricas.movs * C.movimento.custo) + (metricas.area * C.area.custo);
  const tempo = (metricas.leituras * C.leitura.tempo) + (metricas.movs * C.movimento.tempo);
  
  document.getElementById('metric-custo').innerText = `R$ ${custo.toFixed(2).replace('.',',')}`;
  document.getElementById('metric-tempo').innerText = `${tempo.toFixed(1)}s`;
  document.getElementById('metric-leituras').innerText = metricas.leituras;
  document.getElementById('metric-movs').innerText = metricas.movs;
}