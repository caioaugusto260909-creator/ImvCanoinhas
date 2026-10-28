(() => {
  const bairrosAtuais = [
    { id: 'vale-do-sol', n: 'Vale do Sol', lat: -26.178, lng: -50.402 },
    { id: 'santa-lucia', n: 'Santa Lúcia', lat: -26.184, lng: -50.385 },
    { id: 'cascata', n: 'Cascata', lat: -26.19, lng: -50.411 },
    { id: 'bela-vista', n: 'Bela Vista', lat: -26.162, lng: -50.382 },
  ];

  window.BAIRROS.push(...bairrosAtuais);

  const gruposDeFotos = {
    casa: ['casa-1', 'casa-2', 'casa-3', 'casa-4', 'casa-5', 'casa-6', 'casa-7'],
    apartamento: ['apto-1', 'apto-2', 'apto-3', 'apto-4', 'apto-5'],
    chacara: ['chacara-4', 'chacara-5', 'chacara-6', 'chacara-7', 'casa-5', 'terreno-8'],
    terreno: ['terreno-4', 'terreno-5', 'terreno-6', 'terreno-7', 'terreno-8'],
    comercial: ['comercial-1', 'comercial-2', 'comercial-4', 'comercial-3'],
    galpao: ['comercial-5', 'comercial-6', 'comercial-7', 'comercial-8'],
  };
  const grupoDeFotos = (tipo) => {
    const tipoNormalizado = tipo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (tipoNormalizado.includes('terreno')) return gruposDeFotos.terreno;
    if (tipoNormalizado.includes('chacara')) return gruposDeFotos.chacara;
    if (/apartamento|cobertura|kitnet/.test(tipoNormalizado)) return gruposDeFotos.apartamento;
    if (tipoNormalizado.includes('galpao')) return gruposDeFotos.galpao;
    if (/sala|loja|comercial/.test(tipoNormalizado)) return gruposDeFotos.comercial;
    return gruposDeFotos.casa;
  };
  const fotosDoTipo = (tipo, indice) => {
    const fotos = grupoDeFotos(tipo);
    const primeira = indice % fotos.length;
    return [0, 1, 2].map(
      (deslocamento) => `assets/imoveis/${fotos[(primeira + deslocamento) % fotos.length]}.jpg`,
    );
  };
  const coordenadasPorBairro = {
    centro: [-26.1711921, -50.391],
    piedade: [-26.2028276, -50.4208091],
    aguaverde: [-26.172, -50.373098],
    boavista: [-26.0729281, -50.4701689],
    vilanova: [-26.166, -50.399],
    industrial: [-26.178, -50.398],
    santacruz: [-26.1687978, -50.3909686],
    saocristovao: [-26.181, -50.384],
    rural: [-26.21, -50.43],
    'vale-do-sol': [-26.178, -50.402],
    'santa-lucia': [-26.184, -50.385],
    cascata: [-26.19, -50.411],
    'bela-vista': [-26.162, -50.382],
  };

  window.IMOVEIS.forEach((imovel, index) => {
    imovel.fotos = fotosDoTipo(imovel.tipo, index);
  });

  const bairrosPorNome = new Map(
    window.BAIRROS.map((bairro) => [bairro.n, bairro.id]),
  );
  const primeiroId = Math.max(...window.IMOVEIS.map((imovel) => imovel.id)) + 1;

  window.IMOVEIS.push(
    ...window.imoveis.map((imovel, index) => ({
      id: primeiroId + index,
      tipo: imovel.type === 'Sala Comercial' ? 'Sala comercial' : imovel.type,
      tit: imovel.title,
      b: bairrosPorNome.get(imovel.neighborhood),
      pv: imovel.price,
      pa: null,
      cond: 0,
      area: imovel.area,
      dorm: imovel.bedrooms,
      ban: imovel.bathrooms,
      vag: imovel.garage,
      ano: null,
      car: [imovel.tag],
      desc: `${imovel.type} com ${imovel.area} m² em ${imovel.neighborhood}, Canoinhas. Consulte as condições e a disponibilidade.`,
      dest: index < 6,
      fotos: fotosDoTipo(imovel.type, index),
      s: index % 6,
    })),
  );

  window.BAIRROS.forEach((bairro) => {
    const [lat, lng] = coordenadasPorBairro[bairro.id];
    bairro.lat = lat;
    bairro.lng = lng;
  });
})();
