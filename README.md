# Imóveis Canoinhas

Site de uma imobiliária fictícia de Canoinhas, SC (Morada do Mate Imóveis), feito só com HTML, CSS e JavaScript. É um projeto de estudo: imobiliária, equipe, imóveis e preços são inventados.

**Site publicado:** https://caioaugusto260909-creator.github.io/ImoveisCanoinhas/

## Funcionalidades

- Catálogo com filtros e mapa interativo por bairro
- Simulador de financiamento
- Comparador de imóveis e favoritos
- Agendamento de visita
- Formulário de contato e atalho para WhatsApp
- Cadastro de novos imóveis
- Tema claro e escuro

Não há servidor nem banco de dados. Favoritos, comparação, tema, imóveis cadastrados e mensagens/agendamentos ficam salvos no `localStorage` do navegador de quem usa o site.

## Estrutura

- `canoinhas/`: o site (é a pasta publicada no GitHub Pages)
- `.github/workflows/pages.yml`: publica a pasta `canoinhas/` a cada push na branch `main`
- `academia/` e `cassino-pixel-docker/`: outros projetos de estudo, fora do GitHub Pages

## Rodar localmente

```bash
cd canoinhas
python -m http.server 8000
```

Depois abra http://localhost:8000. Também funciona com `docker compose up` dentro de `canoinhas/` (porta 8081).

## Publicar no GitHub Pages

No repositório, abra **Settings → Pages** e, em **Source**, escolha **GitHub Actions**. Depois é só dar push na `main`.
