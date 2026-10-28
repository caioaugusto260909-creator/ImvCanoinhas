const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const state = {
  favoritos: new Set(),
  compare: new Set(),
};

const propertyGrid = document.getElementById('propertyGrid');
const filterBairro = document.getElementById('filterBairro');
const filterTipo = document.getElementById('filterTipo');
const filterPreco = document.getElementById('filterPreco');
const filterQuartos = document.getElementById('filterQuartos');
const filterVagas = document.getElementById('filterVagas');
const sortOrder = document.getElementById('sortOrder');
const compareA = document.getElementById('compareA');
const compareB = document.getElementById('compareB');
const compareResult = document.getElementById('compareResult');

const propriedadeOptions = () => {
  const bairros = [...new Set(window.imoveis.map((imovel) => imovel.neighborhood))].sort();

  bairros.forEach((bairro) => {
    const option = document.createElement('option');
    option.value = bairro;
    option.textContent = bairro;
    filterBairro.appendChild(option);
  });

  const compareOptions = [...window.imoveis]
    .sort((a, b) => a.title.localeCompare(b.title));

  compareOptions.forEach((imovel) => {
    const optionA = document.createElement('option');
    optionA.value = imovel.id;
    optionA.textContent = imovel.title;
    compareA.appendChild(optionA);

    const optionB = document.createElement('option');
    optionB.value = imovel.id;
    optionB.textContent = imovel.title;
    compareB.appendChild(optionB);
  });

  compareA.value = String(window.imoveis[0].id);
  compareB.value = String(window.imoveis[1].id);
};

const getFilteredProperties = () => {
  let filtered = [...window.imoveis];

  const bairro = filterBairro.value;
  const tipo = filterTipo.value;
  const precoMax = Number(filterPreco.value);
  const quartosMin = Number(filterQuartos.value);
  const vagasMin = Number(filterVagas.value);

  if (bairro !== 'todos') {
    filtered = filtered.filter((imovel) => imovel.neighborhood === bairro);
  }

  if (tipo !== 'todos') {
    filtered = filtered.filter((imovel) => imovel.type === tipo);
  }

  if (precoMax > 0) {
    filtered = filtered.filter((imovel) => imovel.price <= precoMax);
  }

  if (quartosMin > 0) {
    filtered = filtered.filter((imovel) => imovel.bedrooms >= quartosMin);
  }

  if (vagasMin > 0) {
    filtered = filtered.filter((imovel) => imovel.garage >= vagasMin);
  }

  const sortValue = sortOrder.value;

  if (sortValue === 'preco-asc') {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (sortValue === 'preco-desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
};

const renderPropertyCards = () => {
  const filtered = getFilteredProperties();

  if (!filtered.length) {
    propertyGrid.innerHTML = '<p class="empty-state">Nenhum imóvel encontrado com os filtros atuais.</p>';
    return;
  }

  propertyGrid.innerHTML = filtered.map((imovel) => {
    const isFavorite = state.favoritos.has(imovel.id);
    const isCompareSelected = state.compare.has(imovel.id);

    return `
      <article class="property-card">
        <div class="property-image">
          <img src="${imovel.image}" alt="${imovel.title}" />
          <button class="favorite-btn" data-id="${imovel.id}" aria-label="Adicionar aos favoritos">
            ${isFavorite ? '♥' : '♡'}
          </button>
          <span class="property-tag">${imovel.tag}</span>
        </div>

        <div class="property-body">
          <div class="property-header">
            <h3>${imovel.title}</h3>
            <span class="price">${currency.format(imovel.price)}</span>
          </div>

          <div class="location">📍 ${imovel.neighborhood}</div>

          <div class="meta">
            <div>
              <span>Área</span>
              <strong>${imovel.area} m²</strong>
            </div>
            <div>
              <span>Quartos</span>
              <strong>${imovel.bedrooms}</strong>
            </div>
            <div>
              <span>Vagas</span>
              <strong>${imovel.garage}</strong>
            </div>
          </div>

          <div class="property-actions">
            <div class="compare-toggle">
              <input type="checkbox" id="compare-${imovel.id}" data-compare="${imovel.id}" ${isCompareSelected ? 'checked' : ''} />
              <label for="compare-${imovel.id}">Comparar</label>
            </div>
            <a class="btn btn-secondary" href="https://wa.me/5547999999999?text=${encodeURIComponent(`Olá! Quero saber mais sobre ${imovel.title}.`) }" target="_blank" rel="noreferrer">Falar</a>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.favorite-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id);
      if (state.favoritos.has(id)) {
        state.favoritos.delete(id);
      } else {
        state.favoritos.add(id);
      }
      renderPropertyCards();
    });
  });

  document.querySelectorAll('[data-compare]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const id = Number(checkbox.dataset.compare);
      if (checkbox.checked) {
        state.compare.add(id);
      } else {
        state.compare.delete(id);
      }
    });
  });
};

const renderCompareResult = () => {
  const aId = Number(compareA.value);
  const bId = Number(compareB.value);

  const a = window.imoveis.find((imovel) => imovel.id === aId);
  const b = window.imoveis.find((imovel) => imovel.id === bId);

  if (!a || !b) return;

  compareResult.innerHTML = `
    <div class="compare-item">
      <div>
        <strong>${a.title}</strong>
        <span>${a.type}</span>
      </div>
      <div>
        <strong>${b.title}</strong>
        <span>${b.type}</span>
      </div>
    </div>
    <div class="compare-item">
      <div>
        <strong>${currency.format(a.price)}</strong>
        <span>Preço</span>
      </div>
      <div>
        <strong>${currency.format(b.price)}</strong>
        <span>Preço</span>
      </div>
    </div>
    <div class="compare-item">
      <div>
        <strong>${a.area} m²</strong>
        <span>Área</span>
      </div>
      <div>
        <strong>${b.area} m²</strong>
        <span>Área</span>
      </div>
    </div>
    <div class="compare-item">
      <div>
        <strong>${a.bedrooms}</strong>
        <span>Quartos</span>
      </div>
      <div>
        <strong>${b.bedrooms}</strong>
        <span>Quartos</span>
      </div>
    </div>
    <div class="compare-item">
      <div>
        <strong>${a.garage}</strong>
        <span>Vagas</span>
      </div>
      <div>
        <strong>${b.garage}</strong>
        <span>Vagas</span>
      </div>
    </div>
  `;
};

const calcularFinanciamento = (event) => {
  event.preventDefault();

  const valorImovel = Number(document.getElementById('valorImovel').value);
  const entrada = Number(document.getElementById('entrada').value);
  const prazo = Number(document.getElementById('prazo').value);
  const taxaMensal = Number(document.getElementById('taxa').value) / 100;

  const valorFinanciado = Math.max(valorImovel - entrada, 0);

  if (valorFinanciado <= 0 || prazo <= 0 || taxaMensal <= 0) {
    document.getElementById('valorFinanciado').textContent = currency.format(0);
    document.getElementById('parcelaEstimada').textContent = currency.format(0);
    document.getElementById('totalPago').textContent = currency.format(0);
    return;
  }

  const parcela =
    (valorFinanciado * taxaMensal * Math.pow(1 + taxaMensal, prazo)) /
    (Math.pow(1 + taxaMensal, prazo) - 1);

  const totalPago = parcela * prazo;

  document.getElementById('valorFinanciado').textContent = currency.format(valorFinanciado);
  document.getElementById('parcelaEstimada').textContent = currency.format(parcela);
  document.getElementById('totalPago').textContent = currency.format(totalPago);
};

const handleVisitSubmit = (event) => {
  event.preventDefault();
  alert('Solicitação de visita enviada com sucesso. Nossa equipe entrará em contato em breve.');
  event.target.reset();
};

const initMap = () => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer || typeof L === 'undefined') return;

  const map = L.map(mapContainer, {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([-26.07, -52.86], 11.5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const bairros = [
    { name: 'Centro', coords: [-26.064, -52.975], text: 'Centro' },
    { name: 'Vale do Sol', coords: [-26.085, -52.845], text: 'Vale do Sol' },
    { name: 'Santa Lúcia', coords: [-26.125, -52.905], text: 'Santa Lúcia' },
    { name: 'Bela Vista', coords: [-26.022, -52.897], text: 'Bela Vista' },
    { name: 'Cascata', coords: [-26.055, -52.795], text: 'Cascata' },
  ];

  bairros.forEach((bairro) => {
    const marker = L.marker(bairro.coords).addTo(map);
    marker.bindPopup(`<strong>${bairro.name}</strong><br>+ imóveis em destaque`);
  });
};

const bindEvents = () => {
  [filterBairro, filterTipo, filterPreco, filterQuartos, filterVagas, sortOrder].forEach((element) => {
    element.addEventListener('change', renderPropertyCards);
  });

  compareA.addEventListener('change', renderCompareResult);
  compareB.addEventListener('change', renderCompareResult);

  document.getElementById('compareButton').addEventListener('click', renderCompareResult);
  document.getElementById('financingForm').addEventListener('submit', calcularFinanciamento);
  document.getElementById('visitForm').addEventListener('submit', handleVisitSubmit);
};

const init = () => {
  propriedadeOptions();
  bindEvents();
  renderPropertyCards();
  renderCompareResult();
  initMap();
  calcularFinanciamento({ preventDefault() {} });
};

init();
