(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const BA=window.BAIRROS,BN=Object.fromEntries(BA.map(b=>[b.id,b]));
function carregaImoveisCadastrados(){
  let dados;
  try{dados=JSON.parse(localStorage.getItem('mm-imoveis-cadastrados')||'[]')}
  catch(error){console.error('Não foi possível ler os imóveis cadastrados neste navegador.',error);return[]}
  if(!Array.isArray(dados)){console.error('A lista local de imóveis cadastrados está inválida.');return[]}
  const ids=new Set(window.IMOVEIS.map(i=>i.id));
  return dados.filter(i=>{
    if(!i||!Number.isSafeInteger(i.id)||ids.has(i.id)||typeof i.tit!=='string'||typeof i.tipo!=='string'||!BN[i.b]||!Array.isArray(i.fotos)||!Array.isArray(i.car))return false;
    if(i.pv!==null&&(!Number.isFinite(i.pv)||i.pv<=0))return false;
    if(i.pa!==null&&(!Number.isFinite(i.pa)||i.pa<=0))return false;
    return(i.pv!==null||i.pa!==null)&&typeof i.desc==='string';
  });
}
const cadastrados=carregaImoveisCadastrados();
const IM=[...window.IMOVEIS,...cadastrados];
const brl=n=>n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const nf=n=>n.toLocaleString('pt-BR');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const WA='5547999999999';
const ls={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let favs=ls.get('mm-fav',[]),comp=ls.get('mm-comp',[]).filter(id=>IM.some(i=>i.id===id)).slice(0,2);
let updateComparison=null;
const TIPOS=[...new Set(IM.map(i=>i.tipo))].sort();
const app=$('#app');
const pd=(i,f)=>f==='aluguel'?i.pa:f==='venda'?i.pv:(i.pv!=null?i.pv:i.pa);
const fin=i=>i.pv!=null&&i.pa!=null?'Venda e aluguel':i.pv!=null?'Venda':'Aluguel';
const precoHtml=(i,f)=>{
  if(f==='venda'&&i.pv!=null)return`<b>${brl(i.pv)}</b>`;
  if(f==='aluguel'&&i.pa!=null)return`<b>${brl(i.pa)}</b><small>/mês</small>`;
  return i.pv!=null?`<b>${brl(i.pv)}</b>`+(i.pa!=null?`<small> ou ${brl(i.pa)}/mês</small>`:''):`<b>${brl(i.pa)}</b><small>/mês</small>`;
};
const specs=i=>[i.area?`${nf(i.area)} m²`:'',i.dorm?`${i.dorm} ${i.dorm>1?'quartos':'quarto'}`:'',i.ban?`${i.ban} ${i.ban>1?'banheiros':'banheiro'}`:'',i.vag?`${i.vag} ${i.vag>1?'vagas':'vaga'}`:''].filter(Boolean).map(s=>`<li>${s}</li>`).join('');
const tit=t=>document.title=t+' · Morada do Mate Imóveis';
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,2600)};

/* ---------- ilustrações e fotos ---------- */
const tree=(x,y,k=1)=>`<rect x="${x-3*k}" y="${y}" width="${6*k}" height="${50*k}" fill="#5a3d2b"/><path d="M${x-34*k} ${y+4*k}Q${x} ${y-26*k} ${x+34*k} ${y+4*k}Q${x} ${y+16*k} ${x-34*k} ${y+4*k}Z" fill="#2f6b43"/>`;
const fotosDoImovel=im=>im.fotos?.length?im.fotos:['assets/imoveis/casa-1.jpg'];
const foto=(im,i=0)=>`<img src="${esc(fotosDoImovel(im)[i%fotosDoImovel(im).length])}" alt="Foto ilustrativa de ${esc(im.tipo.toLowerCase())}" loading="lazy" decoding="async">`;
const arte=()=>`<svg viewBox="0 0 520 420"><circle cx="410" cy="90" r="46" class="sol"/><path class="mo1" d="M0 330Q130 250 260 300T520 270V420H0Z"/><path class="mo2" d="M0 372Q150 312 300 352T520 332V420H0Z"/>${tree(80,150,2.1)}${tree(210,190,1.6)}${tree(445,170,1.9)}<g class="cas"><rect x="255" y="292" width="120" height="72"/><path d="M243 294L315 238L387 294Z"/><rect x="307" y="324" width="24" height="40" class="pt"/></g></svg>`;

/* ---------- favoritos, comparação, selos ---------- */
const salva=()=>{ls.set('mm-fav',favs);ls.set('mm-comp',comp);badges()};
const imoveisFavoritos=()=>IM.filter(i=>favs.includes(i.id));
const carrossel=(imoveis,{id,mode,selected=[]})=>`<div class="pick-carousel"><div class="pick-controls"><span class="mut">Deslize para ver os imóveis</span><div><button type="button" data-slide="-1" aria-label="Cartão anterior">‹</button><button type="button" data-slide="1" aria-label="Próximo cartão">›</button></div></div><div class="pick-track" id="${id}" tabindex="0" aria-label="${mode==='compare'?'Imóveis selecionados para comparação':'Imóveis favoritados'}">${imoveis.map(i=>`<article class="pick-card"><a class="pick-photo" href="#/imovel/${i.id}" aria-label="Ver detalhes de ${esc(i.tit)}">${foto(i,0)}<span class="tag">${fin(i)}</span></a><div class="pick-body"><p class="pr">${precoHtml(i)}</p><h2><a href="#/imovel/${i.id}">${esc(i.tit)}</a></h2><p class="lc">${esc(i.tipo)} · ${esc(BN[i.b].n)}</p><ul class="sp">${specs(i)}</ul><label class="pick-choice"><input type="${mode==='compare'?'checkbox':'radio'}" ${mode==='compare'?'data-compare-choice name="compare-property"':'name="appointment-property"'} value="${i.id}" ${mode==='compare'?'':'data-appointment-choice'} ${selected.includes(i.id)?'checked':''}><span>${mode==='compare'?(selected.includes(i.id)?'Selecionado para comparar':'Comparar este imóvel'):(selected.includes(i.id)?'Imóvel escolhido':'Escolher para visita')}</span></label></div></article>`).join('')}</div></div>`;
function ligarCarrossel(id){
  const track=$(`#${id}`),carousel=track?.closest('.pick-carousel');
  if(!track||!carousel)return;
  $$('[data-slide]',carousel).forEach(button=>button.onclick=()=>{
    const card=track.querySelector('.pick-card'),gap=parseFloat(getComputedStyle(track).gap)||0;
    track.scrollBy({left:((card?.getBoundingClientRect().width||280)+gap)*+button.dataset.slide,behavior:'smooth'});
  });
}
function badges(){
  $('#nb-fav').textContent=favs.length;$('#nb-cmp').textContent=comp.length;
  $$('[data-fav]').forEach(b=>{const on=favs.includes(+b.dataset.fav);b.setAttribute('aria-pressed',on);b.textContent=(on?'♥':'♡')+(b.dataset.long?(on?' Favoritado':' Favoritar'):'')});
  $$('[data-cmp]').forEach(b=>{const on=comp.includes(+b.dataset.cmp);b.setAttribute('aria-pressed',on);b.textContent='⇄'+(b.dataset.long?(on?' Na comparação':' Comparar'):'')});
  $$('[data-compare-choice]').forEach(b=>{const on=comp.includes(+b.value);b.checked=on;b.nextElementSibling.textContent=on?'Selecionado para comparar':'Selecionar para comparar'});
}
document.addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]'),c=e.target.closest('[data-cmp]');
  if(f){const id=+f.dataset.fav;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];salva();if(location.hash.startsWith('#/agendar'))rota();else if(location.hash.startsWith('#/favoritos'))favoritos()}
  if(c){const id=+c.dataset.cmp;if(comp.includes(id))comp=comp.filter(x=>x!==id);else if(comp.length<2){comp=[...comp,id];toast(comp.length===2?'Dois imóveis prontos. Abra "Comparar" no menu.':'Escolha mais um imóvel para comparar.')}else toast('A comparação aceita até dois imóveis.');salva();if(location.hash.startsWith('#/comparar'))rota()}
});
document.addEventListener('change',e=>{
  const choice=e.target.closest('[data-compare-choice]');
  if(!choice)return;
  const id=+choice.value;
  if(choice.checked){
    if(comp.length>=2){choice.checked=false;toast('A comparação aceita até dois imóveis.');return}
    if(!comp.includes(id))comp=[...comp,id];
  }else comp=comp.filter(x=>x!==id);
  salva();updateComparison?.();
});
window.addEventListener('storage',e=>{
  if(e.key!=='mm-fav'&&e.key!=='mm-comp')return;
  favs=ls.get('mm-fav',[]);comp=ls.get('mm-comp',[]).filter(id=>IM.some(i=>i.id===id)).slice(0,2);salva();
  if(location.hash.startsWith('#/comparar')||location.hash.startsWith('#/agendar')||location.hash.startsWith('#/favoritos'))rota();
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-b]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});

/* ---------- cards ---------- */
const card=(i,f,checkComparacao=false)=>`<article class="card"><a class="foto" href="#/imovel/${i.id}" aria-label="Ver ${esc(i.tit)}">${foto(i,0)}<span class="tag">${fin(i)}</span></a><div class="cb"><div class="pr">${precoHtml(i,f)}</div><h3><a href="#/imovel/${i.id}">${esc(i.tit)}</a></h3><p class="lc">${i.tipo} · ${BN[i.b].n}</p><ul class="sp">${specs(i)}</ul>${checkComparacao?`<label class="fav-compare-choice"><input type="checkbox" data-compare-choice value="${i.id}" ${comp.includes(i.id)?'checked':''}><span>${comp.includes(i.id)?'Selecionado para comparar':'Selecionar para comparar'}</span></label>`:''}<div class="ac"><button class="ic" data-fav="${i.id}" aria-label="Favoritar" aria-pressed="false">♡</button><button class="ic" data-cmp="${i.id}" aria-label="Comparar" aria-pressed="false">⇄</button></div></div></article>`;

/* ---------- financiamento ---------- */
function calc({v,ent,n,aa,sis}){
  const P=Math.max(0,v-ent),i=Math.pow(1+aa/100,1/12)-1,rows=[];let s=P,tot=0,jt=0;
  const pmt=i?P*i/(1-Math.pow(1+i,-n)):P/n;
  for(let k=1;k<=n;k++){const j=s*i,a=sis==='sac'?P/n:pmt-j,p=a+j;s=Math.max(0,s-a);tot+=p;jt+=j;rows.push({k,p,j,a,s})}
  return{P,rows,tot,jt,p1:rows[0]?rows[0].p:0,pn:rows[n-1]?rows[n-1].p:0};
}

/* ---------- início ---------- */
function home(){
  tit('Imóveis em Canoinhas, SC');
  const dest=IM.filter(i=>i.dest).slice(0,6);
  app.innerHTML=`<section class="hero"><div class="wrap hg"><div><h1>Seu lugar em Canoinhas começa aqui.</h1><p class="lead">Casas, apartamentos, terrenos e chácaras para comprar ou alugar, do Centro ao interior do Planalto Norte.</p>
  <form class="busca" id="bq"><div class="seg" role="radiogroup" aria-label="Finalidade"><label><input type="radio" name="fin" value="venda" checked><span>Comprar</span></label><label><input type="radio" name="fin" value="aluguel"><span>Alugar</span></label></div>
  <div class="bl"><label>Tipo<select name="tipo"><option value="">Todos</option>${TIPOS.map(t=>`<option>${t}</option>`).join('')}</select></label><label>Bairro<select name="b"><option value="">Todos</option>${BA.map(b=>`<option value="${b.id}">${b.n}</option>`).join('')}</select></label><button class="btn">Buscar imóveis</button></div></form></div><div class="art" aria-hidden="true">${arte()}</div></div></section>
  <section class="wrap sec"><h2>Em destaque</h2><div class="grid">${dest.map(i=>card(i)).join('')}</div><p class="mais"><a class="btn sec2" href="#/imoveis">Ver os ${IM.length} imóveis</a></p></section>
  <section class="wrap sec"><h2>Tudo para decidir com calma</h2><div class="trio">
   <div class="pass"><b>1</b><h3>Explore no mapa</h3><p>Veja onde cada imóvel fica e filtre por bairro com um clique.</p><a href="#/imoveis">Abrir o mapa</a></div>
   <div class="pass"><b>2</b><h3>Simule e compare</h3><p>Calcule a parcela do financiamento e coloque dois imóveis lado a lado.</p><a href="#/simulador">Simular agora</a></div>
   <div class="pass"><b>3</b><h3>Agende a visita</h3><p>Escolha o dia e o horário livre na agenda e confirme em segundos.</p><a href="#/agendar">Ver horários</a></div></div></section>
  <section class="wrap sec"><h2>Quem já fechou com a gente</h2><div class="dep">
   ${[['Comprei minha primeira casa sem dor de cabeça. A simulação ajudou muito.','Helena M., Água Verde'],['Aluguei a sala da loja em dois dias. Atendimento direto e sem enrolação.','Rafael T., Centro'],['Vendemos o terreno da família com avaliação justa e documentação em dia.','Família Kowalski, Piedade'],['A chácara que eu sonhava, com poço e araucárias. Visita marcada no mesmo dia.','Marcos P., Zona Rural']].map(d=>`<blockquote>“${d[0]}”<cite>${d[1]}</cite></blockquote>`).join('')}</div><p class="mut">Depoimentos fictícios, criados para este projeto de estudo.</p></section>
  <section class="band"><div class="wrap"><h2>Não achou o que procura?</h2><a class="btn" href="#/contato">Fale com um corretor</a></div></section>`;
  $('#bq').onsubmit=e=>{e.preventDefault();const p=new URLSearchParams();for(const[k,v]of new FormData(e.target))if(v)p.set(k,v);location.hash='#/imoveis?'+p};
}

/* ---------- lista, filtros e mapa ---------- */
function filtra(q){
  const t=(q.txt||'').toLowerCase();
  return IM.filter(i=>{
    if(q.fin==='venda'&&i.pv==null)return false;if(q.fin==='aluguel'&&i.pa==null)return false;
    if(q.tipo&&i.tipo!==q.tipo)return false;if(q.b&&i.b!==q.b)return false;
    const p=pd(i,q.fin);if(q.min&&p<+q.min)return false;if(q.max&&p>+q.max)return false;
    if(q.dorm&&i.dorm<+q.dorm)return false;if(q.vag&&i.vag<+q.vag)return false;if(q.area&&i.area<+q.area)return false;
    if(t&&!(i.tit+' '+i.tipo+' '+BN[i.b].n+' '+i.car.join(' ')).toLowerCase().includes(t))return false;
    return true;
  });
}
function ordena(l,q){
  const f=q.fin,o=q.ord||'rel',g=i=>f?0:(i.pv!=null?0:1),c={menor:(a,b)=>g(a)-g(b)||pd(a,f)-pd(b,f),maior:(a,b)=>g(a)-g(b)||pd(b,f)-pd(a,f),area:(a,b)=>b.area-a.area,novo:(a,b)=>(b.ano||0)-(a.ano||0),rel:(a,b)=>(b.dest-a.dest)||a.id-b.id}[o];
  return [...l].sort(c);
}
const coordenadasMapa=(()=>{
  const pontos=BA.filter(b=>Number.isFinite(b.lat)&&Number.isFinite(b.lng));
  return new Map(pontos.map(b=>[b.id,{lat:b.lat,lng:b.lng}]));
})();
let mapaReal=null,camadaPontos=null;
const coordenadaImovel=i=>{
  const centro=coordenadasMapa.get(i.b);
  if(!centro)return null;
  const angulo=(i.id*2.399963229728653)%(Math.PI*2),raioMetros=35+((i.id*67)%240);
  return[
    centro.lat+Math.cos(angulo)*raioMetros/111320,
    centro.lng+Math.sin(angulo)*raioMetros/(111320*Math.cos(centro.lat*Math.PI/180)),
  ];
};
function atualizaMapaReal(imoveis,bairroSelecionado){
  const elemento=$('#real-map'),estado=$('#map-status');
  if(!elemento)return;
  if(!window.L){
    estado.textContent='Não foi possível carregar o mapa. Confira sua conexão e atualize a página.';
    console.error('Leaflet não foi carregado; o mapa real está indisponível.');
    return;
  }
  if(mapaReal&&mapaReal.getContainer()!==elemento){
    mapaReal.remove();
    mapaReal=null;
    camadaPontos=null;
  }
  if(!mapaReal){
    mapaReal=L.map(elemento,{scrollWheelZoom:false}).setView([-26.177,-50.39],11);
    const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapaReal);
    tiles.on('tileerror',()=>{estado.textContent='O mapa não carregou por completo. Confira sua conexão com a internet.'});
    tiles.on('load',()=>{estado.textContent='Mapa de ruas real. Os pontos mostram apenas regiões aproximadas, não os endereços dos imóveis.'});
    camadaPontos=L.layerGroup().addTo(mapaReal);
  }
  camadaPontos.clearLayers();
  const validos=imoveis.filter(i=>coordenadaImovel(i));
  validos.forEach(i=>{
    const posicao=coordenadaImovel(i);
    const selecionado=i.b===bairroSelecionado;
    L.circleMarker(posicao,{
      radius:selecionado?5:4,color:selecionado?'#1f4d3a':'#a76b21',
      weight:1.5,fillColor:selecionado?'#3f7a5a':'#c2883a',fillOpacity:selecionado?0.9:0.72,
    }).bindPopup(`<b>${esc(i.tit)}</b><br>${esc(BN[i.b].n)} · localização aproximada<br><a href="#/imovel/${i.id}">Ver anúncio</a>`).addTo(camadaPontos);
  });
  if(bairroSelecionado&&coordenadasMapa.has(bairroSelecionado)){
    const centro=coordenadasMapa.get(bairroSelecionado);
    mapaReal.setView([centro.lat,centro.lng],14);
  }else if(validos.length>0){
    const pontos=validos.map(coordenadaImovel);
    mapaReal.fitBounds(L.latLngBounds(pontos),{padding:[24,24],maxZoom:12});
  }
  requestAnimationFrame(()=>mapaReal.invalidateSize());
}
function mapaBairros(imoveis,bairroSelecionado,filtros){
  const totais=new Map();
  imoveis.forEach(i=>totais.set(i.b,(totais.get(i.b)||0)+1));
  return BA.map(b=>{
    const total=totais.get(b.id)||0,selecionado=b.id===bairroSelecionado;
    const parametros=new URLSearchParams(filtros);
    parametros.set('b',b.id);
    return `<a class="map-neighborhood${selecionado?' is-selected':bairroSelecionado?' is-dimmed':''}" href="#/imoveis?${parametros}"${selecionado?' aria-current="location"':''} aria-label="Ver ${total} ${total===1?'imóvel':'imóveis'} no bairro ${esc(b.n)}"><span class="map-neighborhood-symbol" aria-hidden="true"><i></i><b>${total}</b></span><span class="map-neighborhood-info"><b>${esc(b.n)}</b><span>${total} ${total===1?'imóvel':'imóveis'}</span></span><span class="map-neighborhood-arrow" aria-hidden="true">›</span></a>`;
  }).join('');
}
function lista(_,q0){
  tit('Imóveis');
  let q={...q0},vis=12;
  const opt=(a,v)=>a.map(([x,t])=>`<option value="${x}">${t}</option>`).join('');
  app.innerHTML=`<div class="wrap sec"><h1>Imóveis em Canoinhas e região</h1>
  <form class="filtros" id="ff" role="search" aria-label="Filtros">
   <label>Finalidade<select name="fin">${opt([['','Comprar ou alugar'],['venda','Comprar'],['aluguel','Alugar']])}</select></label>
   <label>Tipo<select name="tipo"><option value="">Todos</option>${TIPOS.map(t=>`<option>${t}</option>`).join('')}</select></label>
   <label>Bairro<select name="b"><option value="">Todos</option>${BA.map(b=>`<option value="${b.id}">${b.n}</option>`).join('')}</select></label>
   <label>Preço mínimo (R$)<input name="min" type="number" min="0" step="100" inputmode="numeric"></label>
   <label>Preço máximo (R$)<input name="max" type="number" min="0" step="100" inputmode="numeric"></label>
   <label>Quartos (mín.)<select name="dorm">${opt([['','Qualquer'],[1,'1+'],[2,'2+'],[3,'3+'],[4,'4+']])}</select></label>
   <label>Vagas (mín.)<select name="vag">${opt([['','Qualquer'],[1,'1+'],[2,'2+'],[3,'3+']])}</select></label>
   <label>Área mínima (m²)<input name="area" type="number" min="0" inputmode="numeric"></label>
   <label>Buscar<input name="txt" type="search" placeholder="piscina, esquina, centro..."></label>
   <button type="button" class="btn sec2 lim" id="lim">Limpar filtros</button></form>
  <section class="mapad" aria-labelledby="map-title"><div class="map-heading"><div><h2 id="map-title">Explore o mapa de Canoinhas</h2><p class="map-status" id="map-status" aria-live="polite">Carregando mapa e ruas...</p></div><span class="map-legend"><i></i> Região aproximada</span></div><div id="real-map" class="real-map" role="application" aria-label="Mapa interativo de Canoinhas com pontos aproximados dos imóveis"></div><h3 class="map-neighborhood-title">Escolha um bairro</h3><div class="map-neighborhood-grid" id="map-cards"></div><p class="map-disclaimer">Os pontos são distribuídos na região aproximada do bairro; os endereços exatos dos imóveis não estão disponíveis.</p></section>
  <div class="barra"><p id="cont" aria-live="polite"></p><label>Ordenar por<select name="ord" form="ff">${opt([['rel','Destaques'],['menor','Menor preço'],['maior','Maior preço'],['area','Maior área'],['novo','Mais novos']])}</select></label></div>
  <div class="grid" id="res"></div><p class="mais"><button class="btn sec2" id="mais">Mostrar mais</button></p></div>`;
  const ff=$('#ff');
  $$('[name]',app).forEach(el=>{if(q[el.name]!==undefined)el.value=q[el.name]});
  const desenha=()=>{
    const l=ordena(filtra(q),q);
    $('#cont').textContent=`${l.length} ${l.length===1?'imóvel encontrado':'imóveis encontrados'}`;
    $('#res').innerHTML=l.slice(0,vis).map(i=>card(i,q.fin)).join('')||'<p class="vazio">Nenhum imóvel com esses filtros. Tente ampliar a busca.</p>';
    $('#mais').hidden=l.length<=vis;
    const filtrosMapa={...q,b:''},imoveisMapa=filtra(filtrosMapa);
    $('#map-cards').innerHTML=mapaBairros(imoveisMapa,q.b,filtrosMapa);
    atualizaMapaReal(l,q.b);
    badges();
    history.replaceState(null,'','#/imoveis?'+new URLSearchParams(q));
  };
  const le=()=>{q=Object.fromEntries([...new FormData(ff)].filter(([,v])=>v));vis=12;desenha()};
  ff.addEventListener('input',le);ff.addEventListener('change',le);ff.onsubmit=e=>e.preventDefault();
  $('[name=ord]').onchange=le;
  $('#lim').onclick=()=>{ff.reset();$('[name=ord]').value='rel';le()};
  $('#mais').onclick=()=>{vis+=12;desenha()};
  desenha();
}

/* ---------- detalhe ---------- */
function detalhe([,id]){
  const i=IM.find(x=>x.id===+id);if(!i)return naoEnc();
  tit(i.tit);
  const sim=IM.filter(x=>x.id!==i.id&&x.tipo===i.tipo).slice(0,3);
  app.innerHTML=`<div class="wrap sec"><p class="mig"><a href="#/imoveis">Imóveis</a> › ${i.tipo} › ${BN[i.b].n}</p>
  <div class="det"><div><div class="gal" id="gal">${foto(i,0)}</div><div class="th">${fotosDoImovel(i).map((_,k)=>`<button data-g="${k}" aria-pressed="${k===0}" aria-label="Ver foto ${k+1}">${foto(i,k)}</button>`).join('')}</div>
   <h1>${esc(i.tit)}</h1><p class="lc">${i.tipo} · ${BN[i.b].n} · Canoinhas, SC · Código ${i.id}</p>
   <ul class="sp big">${specs(i)}${i.ano?`<li>Construído em ${i.ano}</li>`:''}</ul>
   <h2>Sobre o imóvel</h2><p>${esc(i.desc)}</p><h2>Características</h2><ul class="chips">${i.car.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
   <p class="mut">Fotos ilustrativas; podem não corresponder ao imóvel anunciado. Confirme as informações e a localização exata com a equipe.</p></div>
  <aside class="side" aria-label="Valores e contato"><div class="pr">${precoHtml(i)}</div>
   ${i.pv!=null&&i.pa!=null?`<p class="mut" style="margin:0">Também para aluguel: ${brl(i.pa)}/mês</p>`:''}${i.cond?`<p class="mut" style="margin:0">Condomínio: ${brl(i.cond)}/mês</p>`:''}
   <div class="bts"><a class="btn" href="#/agendar?id=${i.id}">Agendar visita</a><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel código ${i.id}: ${i.tit}.`)}">Chamar no WhatsApp</a><button class="btn sec2" data-fav="${i.id}" data-long="1" aria-pressed="false">♡ Favoritar</button><button class="btn sec2" data-cmp="${i.id}" data-long="1" aria-pressed="false">⇄ Comparar</button></div>
   ${i.pv!=null?`<div class="mini"><h2>Simule o financiamento</h2><label>Entrada (%)<input id="sm-e" type="number" min="10" max="90" value="20"></label><label>Prazo<select id="sm-n">${[10,20,30,35].map(a=>`<option value="${a}" ${a===30?'selected':''}>${a} anos</option>`).join('')}</select></label><p id="sm-r" aria-live="polite"></p><a href="#/simulador?valor=${i.pv}">Simulação completa</a></div>`:''}</aside></div>
  ${sim.length?`<h2 style="margin-top:36px">Imóveis parecidos</h2><div class="grid">${sim.map(x=>card(x)).join('')}</div>`:''}</div>`;
  $$('[data-g]').forEach(b=>b.onclick=()=>{$('#gal').innerHTML=foto(i,+b.dataset.g);$$('[data-g]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  if(i.pv!=null){const run=()=>{const e=Math.min(90,Math.max(10,+$('#sm-e').value||20))/100,r=calc({v:i.pv,ent:i.pv*e,n:+$('#sm-n').value*12,aa:10.5,sis:'price'});$('#sm-r').innerHTML=`Parcela estimada: <b>${brl(r.p1)}</b> por mês <small class="mut">(taxa de exemplo de 10,5% a.a.)</small>`};$('#sm-e').oninput=run;$('#sm-n').onchange=run;run()}
}

/* ---------- simulador ---------- */
function simulador(_,q){
  tit('Simulador de financiamento');
  const v0=Math.min(100000000,Math.max(50000,+q.valor||400000));
  app.innerHTML=`<div class="wrap sec"><h1>Simule seu financiamento</h1><p class="lead">Informe o valor do imóvel, ajuste a entrada e veja uma estimativa simples das parcelas.</p>
  <div class="sim"><form class="form sim-form" id="sf">
   <label>Valor do imóvel<input name="v" type="number" min="50000" max="100000000" step="1000" value="${v0}" required><small>Valor de compra em reais</small></label>
   <div><label for="sim-entry">Quanto pretende dar de entrada? <output id="sim-entry-pct">20%</output></label><input id="sim-entry" type="range" min="0" max="90" step="5" value="20" aria-describedby="sim-entry-value"><p id="sim-entry-value" class="sim-entry-value"></p></div>
   <label>Em quantos anos quer pagar?<select name="n">${[5,10,15,20,25,30,35].map(a=>`<option value="${a}" ${a===30?'selected':''}>${a} anos</option>`).join('')}</select></label>
   <label>Juros ao ano (%)<input name="aa" type="number" min="0" max="30" step="0.1" value="10.5" required><small>Use a taxa informada pelo banco; 10,5% é apenas um exemplo.</small></label>
   <fieldset class="sim-systems"><legend>Como prefere pagar?</legend><label class="sim-choice"><input type="radio" name="s" value="price" checked><span><b>Parcelas iguais (Price)</b><small>Valor mensal mais estável.</small></span></label><label class="sim-choice"><input type="radio" name="s" value="sac"><span><b>Parcelas decrescentes (SAC)</b><small>Começam maiores e diminuem com o tempo.</small></span></label></fieldset>
  </form><div id="sr" aria-live="polite"></div></div><p class="mut sim-note">Estimativa educativa. Não inclui seguros, tarifas, impostos ou análise de crédito e não representa uma proposta de financiamento.</p></div>`;
  const run=()=>{
    const f=$('#sf'),v=f.elements.v.valueAsNumber,aa=f.elements.aa.valueAsNumber;
    const pct=Math.min(90,Math.max(0,+$('#sim-entry').value||0));
    $('#sim-entry-pct').textContent=`${pct}%`;
    if(!Number.isFinite(v)||v<50000||v>100000000){$('#sim-entry-value').textContent='Informe um valor válido para calcular a entrada.';$('#sr').innerHTML='<p class="err" role="alert">O valor do imóvel deve ficar entre R$ 50.000 e R$ 100.000.000.</p>';return}
    const e=v*pct/100;
    $('#sim-entry-value').textContent=`Entrada: ${brl(e)} · Financiado: ${brl(v-e)}`;
    if(!Number.isFinite(aa)||aa<0||aa>30){$('#sr').innerHTML='<p class="err" role="alert">Os juros devem ficar entre 0% e 30% ao ano.</p>';return}
    const n=+f.elements.n.value*12,sis=f.elements.s.value;
    const r=calc({v,ent:e,n,aa,sis});
    const pts=r.rows.filter((_,k)=>k%Math.max(1,Math.floor(n/60))===0),W=600,H=200,mx=r.P||1;
    const xy=pts.map(p=>`${40+(p.k/n)*(W-60)},${H-24-(p.s/mx)*(H-50)}`);
    const anos=r.rows.filter(x=>x.k%12===0||x.k===n);
    $('#sr').innerHTML=`<section class="sim-result"><div class="sim-monthly"><span>${sis==='sac'?'Primeira parcela estimada':'Parcela mensal estimada'}</span><strong>${brl(r.p1)}</strong><small>${sis==='sac'?`A última fica em torno de ${brl(r.pn)}.`:'Parcelas no mesmo valor.'} Prazo de ${+f.elements.n.value} anos.</small></div>
    <div class="kpis"><div class="kpi"><span>Valor financiado</span><b>${brl(r.P)}</b></div><div class="kpi"><span>Total pago estimado, com entrada</span><b>${brl(r.tot+e)}</b></div><div class="kpi"><span>Total estimado de juros</span><b>${brl(r.jt)}</b></div><div class="kpi"><span>Renda mensal sugerida*</span><b>${brl(r.p1/.3)}</b></div></div>
    <details class="sim-details"><summary>Ver como o saldo devedor diminui</summary><p class="mut">Estimativa do saldo restante ao longo do financiamento.</p>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico do saldo devedor, que diminui ao longo do prazo"><path class="ar" d="M40,${H-24} L${xy.join(' L')} L${W-20},${H-24}Z"/><path d="M${xy.join(' L')}"/><text x="40" y="16">Saldo devedor</text><text x="40" y="${H-6}">Início</text><text x="${W-20}" y="${H-6}" text-anchor="end">${+f.elements.n.value} anos</text></svg>
    <div class="tw"><table class="tbl"><thead><tr><th>Ano</th><th>Parcela</th><th>Juros do mês</th><th>Saldo devedor</th></tr></thead><tbody>${anos.map(x=>`<tr><td>${Math.ceil(x.k/12)}</td><td>${brl(x.p)}</td><td>${brl(x.j)}</td><td>${brl(x.s)}</td></tr>`).join('')}</tbody></table></div></details>
    <p class="mut">*Renda de referência para uma parcela de até 30% da renda mensal. É apenas uma orientação.</p></section>`;
  };
  $('#sf').oninput=run;$('#sf').onchange=run;run();
}

/* ---------- comparador ---------- */
function comparar(_,q){
  updateComparison=null;
  tit('Comparar imóveis');
  const disponiveis=IM.filter(i=>favs.includes(i.id)||comp.includes(i.id));
  comp=disponiveis.map(i=>i.id).filter(id=>comp.includes(id)).slice(0,2);
  salva();
  if(!disponiveis.length){
    app.innerHTML='<div class="wrap sec"><h1>Comparar imóveis</h1><p class="lead">Marque imóveis como favoritos ou use o botão “Comparar” nos anúncios. Depois, selecione até dois imóveis nesta lista.</p><p class="vazio">Você ainda não tem imóveis favoritados nem selecionados para comparar.</p><p class="mais"><a class="btn" href="#/imoveis">Escolher imóveis</a></p></div>';
    return;
  }
  const pm=i=>Math.round(pd(i)/i.area);
  const L=[['Tipo',i=>i.tipo],['Finalidade',fin],['Bairro',i=>BN[i.b].n],['Preço de venda',i=>i.pv!=null?brl(i.pv):'—',i=>i.pv,-1],['Aluguel',i=>i.pa!=null?brl(i.pa)+'/mês':'—',i=>i.pa,-1],['Área',i=>nf(i.area)+' m²',i=>i.area,1],['Preço por m²',i=>brl(pm(i)),pm,-1],['Quartos',i=>i.dorm||'—',i=>i.dorm,1],['Banheiros',i=>i.ban||'—',i=>i.ban,1],['Vagas',i=>i.vag||'—',i=>i.vag,1],['Ano',i=>i.ano||'—',i=>i.ano,1]];
  app.innerHTML=`<div class="wrap sec"><h1>Comparar imóveis</h1><p class="lead">Seus favoritos e os imóveis marcados para comparação aparecem nos cartões. Selecione até dois para ver as diferenças.</p>${carrossel(disponiveis,{id:'compare-track',mode:'compare',selected:comp})}<p id="compare-hint" class="mut" aria-live="polite"></p><div class="tw" id="ct"></div></div>`;
  ligarCarrossel('compare-track');
  const run=()=>{
    const escolhidos=disponiveis.filter(i=>comp.includes(i.id));
    $$('[data-compare-choice]').forEach(choice=>{const marcado=comp.includes(+choice.value);choice.checked=marcado;choice.nextElementSibling.textContent=marcado?'Selecionado para comparar':'Comparar este imóvel'});
    if(escolhidos.length!==2){$('#ct').innerHTML='';$('#compare-hint').textContent=`${escolhidos.length} de 2 imóveis selecionados.`;return}
    $('#compare-hint').textContent='Comparando os dois imóveis selecionados.';
    const [A,B]=escolhidos;
    const head=i=>`<th scope="col"><a class="foto" href="#/imovel/${i.id}">${foto(i,0)}</a><a href="#/imovel/${i.id}">${esc(i.tit)}</a></th>`;
    $('#ct').innerHTML=`<table class="tbl cmp"><thead><tr><th></th>${head(A)}${head(B)}</tr></thead><tbody>${L.map(([n,t,v,d])=>{let ca='',cb='';if(v&&v(A)!=null&&v(B)!=null&&v(A)!==v(B)){const w=(v(A)-v(B))*d>0?'a':'b';if(w==='a')ca='best';else cb='best'}return`<tr><th scope="row">${n}</th><td class="${ca}">${t(A)}</td><td class="${cb}">${t(B)}</td></tr>`}).join('')}</tbody></table>`;
  };
  updateComparison=run;
  run();
}

function favoritos(){
  tit('Favoritos');
  const l=IM.filter(i=>favs.includes(i.id));
  app.innerHTML=`<div class="wrap sec"><h1>Seus favoritos</h1>${l.length?`<p class="lead">Marque os imóveis que deseja incluir na comparação. Você pode selecionar até dois.</p><div class="grid">${l.map(i=>card(i,undefined,true)).join('')}</div><p class="mais"><a class="btn" href="#/comparar">Comparar selecionados (${comp.length})</a></p><p class="mais"><button class="btn sec2" id="lf">Limpar favoritos</button></p>`:'<p class="vazio">Você ainda não favoritou nenhum imóvel. Toque no ♡ de um anúncio para salvar aqui.</p><p class="mais"><a class="btn" href="#/imoveis">Ver imóveis</a></p>'}</div>`;
  const b=$('#lf');if(b)b.onclick=()=>{favs=[];salva();favoritos()};badges();
}

/* ---------- envio de formulários (salvos só neste navegador, sem servidor) ---------- */
async function enviar(url,d){
  const l=ls.get('mm-msgs',[]);l.push({url,d,em:Date.now()});ls.set('mm-msgs',l);
  return{ok:true,protocolo:'LOCAL-'+String(l.length).padStart(4,'0'),local:true};
}
const erros=e=>Object.values(e).flat().map(m=>`<p class="err">${esc(m)}</p>`).join('');
const sucesso=(r,txt)=>`<div class="ok" role="status"><b>${txt}</b><br>Protocolo ${r.protocolo}${r.local?' <small class="mut">(modo estático: salvo só neste navegador)</small>':''}</div>`;

/* ---------- agendamento ---------- */
function agendar(_,q){
  updateComparison=null;
  tit('Agendar visita');
  const disponiveis=imoveisFavoritos(),qId=+q.id;
  let imv=disponiveis.some(i=>i.id===qId)?qId:0,sel=null;
  if(!disponiveis.length){
    app.innerHTML='<div class="wrap sec"><h1>Agendar visita</h1><p class="lead">Para agendar, primeiro salve o imóvel desejado nos favoritos.</p><p class="vazio">A agenda mostra apenas imóveis que você favoritou.</p><p class="mais"><a class="btn" href="#/imoveis">Ver imóveis</a> <a class="btn sec2" href="#/favoritos">Meus favoritos</a></p></div>';
    return;
  }
  const pad=n=>String(n).padStart(2,'0'),H=['09:00','10:00','11:00','14:00','15:00','16:00','17:00'];
  const dias=[],d=new Date();d.setHours(0,0,0,0);while(dias.length<7){d.setDate(d.getDate()+1);if(d.getDay()!==0)dias.push(new Date(d))}
  const iso=x=>`${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`,ocup=(di,hi)=>((di*7+hi*3+imv)%4)===0;
  app.innerHTML=`<div class="wrap sec"><h1>Agendar visita</h1><p class="lead">Deslize pelos cartões para escolher um imóvel salvo nos favoritos e ver os horários livres na agenda.</p>
  ${qId&&!imv?'<p class="vazio">O imóvel aberto anteriormente não está nos seus favoritos. Salve-o para agendar ou escolha um dos seus favoritos abaixo.</p>':''}
  <div class="dois"><div>${carrossel(disponiveis,{id:'appointment-track',mode:'appointment',selected:imv?[imv]:[]})}<div class="tw" style="margin-top:14px"><table class="tbl slots" id="tb"></table></div></div>
  <form class="form" id="af" novalidate><h2 style="margin:0">Seus dados</h2><p id="as" class="mut" aria-live="polite">Nenhum horário escolhido.</p>
   <label>Nome<input name="nome" autocomplete="name" required></label><label>Telefone<input name="telefone" type="tel" autocomplete="tel" placeholder="(47) 99999-0000" required></label>
   <button class="btn">Confirmar visita</button><div id="ar"></div></form></div></div>`;
  const tab=()=>{
    if(!imv){$('#tb').innerHTML='<tbody><tr><td class="vazio">Selecione um imóvel favoritado para ver os horários.</td></tr></tbody>';return}
    $('#tb').innerHTML=`<thead><tr><th></th>${dias.map(x=>`<th scope="col">${x.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}</th>`).join('')}</tr></thead><tbody>${H.map((h,hi)=>`<tr><th scope="row">${h}</th>${dias.map((x,di)=>ocup(di,hi)?`<td><span class="oc">ocupado</span></td>`:`<td><button type="button" data-d="${iso(x)}" data-h="${h}" aria-pressed="${!!sel&&sel.d===iso(x)&&sel.h===h}" aria-label="${x.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})} às ${h}">livre</button></td>`).join('')}</tr>`).join('')}</tbody>`;
    $$('[data-d]',$('#tb')).forEach(b=>b.onclick=()=>{sel={d:b.dataset.d,h:b.dataset.h};$$('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#as').textContent=`Escolhido: ${sel.d.split('-').reverse().join('/')} às ${sel.h}.`});
  };
  ligarCarrossel('appointment-track');
  $$('[data-appointment-choice]').forEach(choice=>choice.onchange=e=>{imv=+e.target.value||0;sel=null;$('#as').textContent='Nenhum horário escolhido.';$('#ar').innerHTML='';tab()});
  $('#af').onsubmit=async e=>{
    e.preventDefault();const f=e.target,out=$('#ar');
    if(!imv){out.innerHTML='<p class="err">Selecione um imóvel salvo nos favoritos.</p>';return}
    if(!sel){out.innerHTML='<p class="err">Escolha um horário livre na agenda.</p>';return}
    const r=await enviar('/agendar',{nome:f.elements.nome.value.trim(),telefone:f.elements.telefone.value.trim(),imovel:imv,data:sel.d,hora:sel.h});
    out.innerHTML=r.ok?sucesso(r,`Visita agendada para ${sel.d.split('-').reverse().join('/')} às ${sel.h}.`):erros(r.erros);
  };
  tab();
}

/* ---------- sobre e contato ---------- */
function sobre(){
  tit('Sobre nós');
  app.innerHTML=`<div class="wrap sec"><h1>Sobre a Morada do Mate</h1><p class="lead">Nascemos em Canoinhas com uma ideia simples: ajudar famílias e negócios do Planalto Norte a encontrar o lugar certo, sem pressa e sem letra miúda.</p>
  <div class="trio" style="margin:26px 0"><div class="pass"><h3>Confiança</h3><p>Documentação conferida, valores claros e conversa franca em cada etapa.</p></div><div class="pass"><h3>Acolhimento</h3><p>Cada visita é no seu ritmo. Comprar ou alugar é uma decisão grande, e tratamos assim.</p></div><div class="pass"><h3>Conhecimento local</h3><p>Do Centro às chácaras do interior, conhecemos cada bairro e suas vantagens.</p></div></div>
  <h2>Nossa equipe</h2><div class="eq">${[['AL','Ana Lima','Corretora de vendas'],['CB','Carlos Bento','Locações'],['MS','Marta Souza','Avaliação e documentos'],['JR','João Ribeiro','Imóveis rurais']].map(p=>`<div><i>${p[0]}</i><b>${p[1]}</b><br><span class="mut">${p[2]}</span></div>`).join('')}</div>
  <p class="mut" style="margin-top:20px">Projeto de estudo: a imobiliária, a equipe, os imóveis e os preços são fictícios.</p></div>`;
}
function contato(){
  tit('Contato');
  app.innerHTML=`<div class="wrap sec"><h1>Fale com a gente</h1><div class="dois"><form class="form" id="cf" novalidate>
   <label>Nome<input name="nome" autocomplete="name" required></label><label>E-mail<input name="email" type="email" autocomplete="email" required></label><label>Telefone (opcional)<input name="telefone" type="tel" autocomplete="tel"></label>
   <label>Assunto<select name="assunto"><option>Quero comprar</option><option>Quero alugar</option><option>Quero vender ou anunciar</option><option>Outro assunto</option></select></label>
   <label>Mensagem<textarea name="mensagem" required></textarea></label><button class="btn">Enviar mensagem</button><div id="cr"></div></form>
  <div class="form"><h2 style="margin:0">Atendimento</h2><p><a href="tel:+5547999999999">(47) 99999-9999</a><br><a href="mailto:contato@canoinhasimoveis.com.br">contato@canoinhasimoveis.com.br</a></p><p>Rua das Flores, 1040, Centro<br>Canoinhas, SC</p><p>Segunda a sexta, das 8h30 às 18h<br>Sábado, das 9h às 12h</p><a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Olá! Gostaria de falar com um corretor.')}">Chamar no WhatsApp</a><p class="mut">Confirme os dados de contato e o endereço antes da visita.</p></div></div></div>`;
  $('#cf').onsubmit=async e=>{
    e.preventDefault();const f=e.target,o=$('#cr');
    const r=await enviar('/contato',{nome:f.elements.nome.value.trim(),email:f.elements.email.value.trim(),telefone:f.elements.telefone.value.trim(),assunto:f.elements.assunto.value,mensagem:f.elements.mensagem.value.trim()});
    if(r.ok){o.innerHTML=sucesso(r,'Mensagem enviada! Responderemos em breve.');f.reset()}else o.innerHTML=erros(r.erros);
  };
}
function cadastro(){
  tit('Cadastrar imóvel');
  app.innerHTML=`<div class="wrap sec"><h1>Cadastrar imóvel</h1><p class="lead">Adicione um anúncio ao catálogo deste navegador.</p>
  <p class="cadastro-notice" role="note"><b>Cadastro local:</b> os imóveis ficam salvos apenas neste navegador e dispositivo. Não são enviados para a imobiliária nem aparecem para outros visitantes.</p>
  <form class="form cadastro-form" id="property-form">
   <label>Título do anúncio<input name="tit" maxlength="100" required placeholder="Ex.: Casa ampla com quintal no Centro"></label>
   <label>Tipo de imóvel<select name="tipo" required>${TIPOS.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label>
   <label>Bairro<select name="b" required>${BA.map(b=>`<option value="${esc(b.id)}">${esc(b.n)}</option>`).join('')}</select></label>
   <div class="cadastro-prices"><label>Preço de venda (R$)<input name="pv" type="number" min="1" step="1" inputmode="numeric" placeholder="Opcional"></label><label>Aluguel mensal (R$)<input name="pa" type="number" min="1" step="1" inputmode="numeric" placeholder="Opcional"></label><small>Preencha pelo menos um dos valores.</small></div>
   <label>Área (m²)<input name="area" type="number" min="1" step="1" required></label>
   <label>Quartos<input name="dorm" type="number" min="0" max="50" step="1" value="0"></label>
   <label>Banheiros<input name="ban" type="number" min="0" max="50" step="1" value="0"></label>
   <label>Vagas<input name="vag" type="number" min="0" max="50" step="1" value="0"></label>
   <label>Ano de construção<input name="ano" type="number" min="1800" max="${new Date().getFullYear()}" step="1" placeholder="Opcional"></label>
   <label class="cadastro-wide">Foto por URL<input name="foto" type="url" placeholder="https://..."><small>Opcional. Sem uma URL, será usada uma imagem ilustrativa do catálogo.</small></label>
   <label class="cadastro-wide">Características<input name="car" maxlength="300" placeholder="Ex.: churrasqueira, quintal, rua asfaltada"><small>Separe as características por vírgula.</small></label>
   <label class="cadastro-wide">Descrição<textarea name="desc" maxlength="1200" required placeholder="Descreva os detalhes do imóvel e o que o torna especial."></textarea></label>
   <button class="btn cadastro-wide" type="submit">Salvar imóvel neste navegador</button>
   <p class="cadastro-wide cadastro-message" id="property-message" role="status" aria-live="polite"></p>
  </form></div>`;
  $('#property-form').onsubmit=e=>{
    e.preventDefault();
    const f=e.currentTarget,pv=f.elements.pv.value===''?null:f.elements.pv.valueAsNumber,pa=f.elements.pa.value===''?null:f.elements.pa.valueAsNumber;
    const msg=$('#property-message');
    if((pv===null||!Number.isFinite(pv)||pv<=0)&&(pa===null||!Number.isFinite(pa)||pa<=0)){msg.textContent='Informe um preço de venda ou um valor de aluguel válido.';return}
    const area=f.elements.area.valueAsNumber;
    if(!Number.isFinite(area)||area<=0){msg.textContent='Informe uma área válida, maior que zero.';return}
    const fotoInformada=f.elements.foto.value.trim();
    if(fotoInformada){
      try{if(!['http:','https:'].includes(new URL(fotoInformada,location.href).protocol))throw new Error('URL inválida')}
      catch(error){msg.textContent='Informe uma URL de foto válida, começando com http:// ou https://.';return}
    }
    const tipo=f.elements.tipo.value;
    const fotoPadrao=IM.find(i=>i.tipo===tipo&&i.fotos?.length)?.fotos[0]||'assets/imoveis/casa-1.jpg';
    const numeroOpcional=nome=>f.elements[nome].value===''?0:f.elements[nome].valueAsNumber;
    const item={
      id:Math.max(0,...IM.map(i=>i.id))+1,tipo,tit:f.elements.tit.value.trim(),b:f.elements.b.value,
      pv,pa,cond:0,area,dorm:numeroOpcional('dorm'),ban:numeroOpcional('ban'),vag:numeroOpcional('vag'),
      ano:numeroOpcional('ano')||null,
      car:f.elements.car.value.split(',').map(s=>s.trim()).filter(Boolean).slice(0,12),
      desc:f.elements.desc.value.trim(),dest:false,fotos:[fotoInformada||fotoPadrao],s:0,
    };
    try{localStorage.setItem('mm-imoveis-cadastrados',JSON.stringify([...cadastrados,item]))}
    catch(error){console.error('Não foi possível salvar o imóvel neste navegador.',error);msg.textContent='Não foi possível salvar. Verifique o espaço disponível no navegador e tente novamente.';return}
    cadastrados.push(item);IM.push(item);
    msg.innerHTML=`Imóvel salvo neste navegador. <a href="#/imovel/${item.id}">Ver anúncio</a>`;
    f.reset();
  };
}
function naoEnc(){tit('Página não encontrada');app.innerHTML='<div class="wrap sec"><h1>Página não encontrada</h1><p class="lead">Esse endereço não existe por aqui.</p><a class="btn" href="#/">Voltar ao início</a></div>'}

/* ---------- rotas, tema e menu ---------- */
const rotas={'':home,imoveis:lista,imovel:detalhe,simulador,comparar,favoritos,agendar,sobre,contato,cadastro};
function rota(){
  const[p,qs]=(location.hash.slice(1)||'/').split('?'),seg=p.split('/').filter(Boolean),q=Object.fromEntries(new URLSearchParams(qs||''));
  $$('.nav a').forEach(a=>a.removeAttribute('aria-current'));const a=$(`.nav a[data-r="${seg[0]||''}"]`);if(a)a.setAttribute('aria-current','page');
  (rotas[seg[0]||'']||naoEnc)(seg,q);badges();window.scrollTo(0,0);
  const h=$('h1',app);if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
  $('#menu').classList.remove('on');$('#mb').setAttribute('aria-expanded','false');
}
const root=document.documentElement,tema=ls.get('mm-tema',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const setTema=t=>{root.dataset.tema=t;ls.set('mm-tema',t);$('#tg').textContent=t==='dark'?'☀ Claro':'☾ Escuro'};
setTema(tema);
$('#tg').onclick=()=>setTema(root.dataset.tema==='dark'?'light':'dark');
$('#mb').onclick=()=>{const o=$('#menu').classList.toggle('on');$('#mb').setAttribute('aria-expanded',o)};
$('#skip').onclick=e=>{e.preventDefault();app.focus()};
addEventListener('hashchange',rota);rota();
})();
