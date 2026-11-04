---
name: WenderTech Nocturne
description: Um workspace operacional sofisticado, escuro e sereno para organizar trabalho e apresentar tecnologia.
colors:
  canvas: '#08090D'
  workspace: '#0C0D12'
  surface: '#14151A'
  raised: '#18171E'
  interactive: '#211E2A'
  border: '#2A2932'
  border-strong: '#413C50'
  text: '#F3F1F8'
  text-secondary: '#AAA6B4'
  violet: '#A995FF'
  violet-ink: '#17131F'
typography:
  display:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: 'clamp(2.75rem, 7vw, 6.5rem)'
    fontWeight: 650
    lineHeight: 0.95
    letterSpacing: '-0.05em'
  headline:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 4vw, 3.75rem)'
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: '-0.035em'
  body:
    fontFamily: 'Manrope, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 450
    lineHeight: 1.65
  label:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 550
    lineHeight: 1.4
    letterSpacing: '0.08em'
rounded:
  sm: '8px'
  md: '12px'
  lg: '18px'
  pill: '999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
  section: 'clamp(72px, 10vw, 128px)'
components:
  button-primary:
    backgroundColor: '{colors.violet}'
    textColor: '{colors.violet-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '12px 18px'
  button-secondary:
    backgroundColor: '{colors.interactive}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '12px 18px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    padding: '24px'
  input:
    backgroundColor: '{colors.workspace}'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    padding: '12px 14px'
---

# Design System: WenderTech Nocturne

## Overview

**Creative North Star: "Nocturne Interface"**

Nocturne é uma interface noturna premium: profunda sem ser pesada, tecnológica sem parecer um painel genérico. Ela combina a concentração de um workspace profissional com o ritmo cinematográfico de uma plataforma de conteúdo, usando violeta com parcimônia para orientar atenção.

O sistema alterna três modos coerentes. **Operate** prioriza clareza e densidade nas áreas autenticadas; **Persuade** usa mais respiro e tipografia expressiva em autenticação e conversão; **Experience** dá ao portfólio público uma narrativa visual mais ampla. Todos compartilham a mesma paleta, tipografia e linguagem de superfícies.

**Key Characteristics:**

- Escuro profundo com contraste confortável e camadas tonais discretas.
- Violeta raro, funcional e reconhecível — nunca uma inundação decorativa.
- Informação útil antes de rótulos óbvios ou texto institucional redundante.
- Geometria precisa, ícones simples e hierarquia tipográfica confiante.

## Colors

A paleta usa pretos azulados e violetas acinzentados para produzir profundidade sem o brilho agressivo de interfaces neon.

### Primary

- **Violeta de Sinal:** reservado para ações primárias, seleção, foco e pequenos momentos de marca.

### Neutral

- **Canvas Noturno:** fundo mais profundo da experiência e moldura das superfícies.
- **Workspace Obsidiana:** plano principal das áreas operacionais.
- **Superfície Grafite:** cartões e regiões agrupadas.
- **Texto Lunar:** conteúdo principal com alta legibilidade.
- **Névoa Lilás:** conteúdo secundário, metadados e apoio.
- **Contorno Mineral:** separação estrutural sem linhas chamativas.

**The Rare Violet Rule.** O violeta deve ocupar uma pequena fração da tela; sua raridade é o que cria hierarquia.

**The No Neon Rule.** Não usar verde, roxo ou ciano saturado como grandes áreas luminosas, bordas brilhantes ou halos decorativos.

## Typography

**Display Font:** Manrope (com fallback de sistema)

**Body Font:** Manrope (com fallback de sistema)

**Label/Mono Font:** Geist Mono (com fallback monoespaçado)

**Character:** Manrope traz sofisticação geométrica sem perder calor em leitura contínua. Geist Mono aparece apenas como instrumento de precisão: caminhos, datas compactas, estados e metadados.

### Hierarchy

- **Display** (650, responsivo, 0.95): mensagens de abertura e títulos públicos de alto impacto.
- **Headline** (650, responsivo, 1.05): títulos de seção e momentos editoriais.
- **Title** (600, 1.125–1.5rem, 1.2): cartões, páginas operacionais e agrupamentos.
- **Body** (450, 1rem, 1.65): leitura principal, idealmente limitada a 70 caracteres por linha.
- **Label** (550, 0.75rem, 0.08em): micro-rótulos curtos; caixa alta apenas quando o conteúdo tiver poucas palavras.

**The Human Case Rule.** Frases e conteúdo permanecem em caixa normal; caixa alta fica restrita a micro-rótulos curtos.

## Layout

O workspace usa sidebar persistente no desktop e drawer modal no mobile. Cabeçalhos carregam contexto real — caminho, data, estado ou próxima ação — no lugar de títulos genéricos como “Dashboard”. Áreas públicas usam contêiner amplo com margens fluidas e grandes intervalos de seção.

O ritmo base é múltiplo de 4px, com 8px entre elementos intimamente relacionados, 16–24px dentro de componentes e 32px ou mais entre blocos distintos. Em telas menores que 1024px, a navegação lateral vira drawer; em 640px ou menos, grids colapsam, ações podem ocupar a largura e o espaçamento reduz sem comprimir o conteúdo.

## Elevation & Depth

Nocturne é tonal por padrão. Profundidade vem da progressão canvas → workspace → surface → raised, apoiada por bordas discretas. Sombras são ambientais e raras, usadas em modais e elementos flutuantes; cartões em repouso não precisam parecer suspensos.

**The Tonal First Rule.** Antes de adicionar sombra, resolva a hierarquia com superfície, borda e espaçamento.

## Shapes

Componentes têm cantos suavemente precisos: 8px em controles compactos, 12px em botões e campos, 18px em cartões e painéis. Pílulas ficam para status, filtros e avatares; não são a forma padrão de todos os controles. Bordas são finas, com contraste suficiente para definir agrupamento sem formar uma grade rígida.

## Components

### Buttons

- **Shape:** retângulos suaves e estáveis (12px), com altura confortável para mouse e toque.
- **Primary:** violeta de sinal com tinta escura, peso semibold e padding equilibrado.
- **Hover / Focus:** pequena mudança tonal; foco visível com contorno violeta, sem halo exagerado.
- **Secondary / Ghost:** superfícies escuras ou transparentes, borda mineral e texto lunar.

### Chips

- **Style:** superfície interativa, texto secundário e borda sutil; forma de pílula apenas por serem estados compactos.
- **State:** seleção ganha violeta discreto e contraste, sem preenchimento fluorescente.

### Cards / Containers

- **Corner Style:** cantos amplos e contidos (18px).
- **Background:** superfície grafite sobre workspace obsidiana.
- **Shadow Strategy:** tonal por padrão; sombra somente quando o elemento realmente flutua.
- **Border:** contorno mineral de 1px.
- **Internal Padding:** 20–24px no desktop e 16–20px no mobile.

### Inputs / Fields

- **Style:** fundo de workspace, borda mineral, raio de 12px e texto lunar.
- **Focus:** borda de sinal e anel visível, mantendo contraste AA.
- **Error / Disabled:** erro usa cor semântica mais mensagem textual; desabilitado reduz contraste sem desaparecer.

### Navigation

A navegação usa ícones lineares simples, rótulos claros e estado ativo tonal com um pequeno sinal violeta. No mobile ela abre como diálogo modal, prende o foco, fecha com Escape e devolve o foco ao acionador.

### Status e prioridade

Status devem comunicar fatos verificáveis. Quando os dados não estiverem disponíveis, mostrar estado indisponível ou neutro em vez de uma mensagem tranquilizadora inventada.

## Do's and Don'ts

### Do:

- **Do** usar informação contextual útil em cabeçalhos, como data, caminho, pendências ou estado real.
- **Do** reservar o violeta para ação, foco, seleção e assinatura de marca.
- **Do** manter alvos interativos confortáveis, foco visível e texto funcional com pelo menos 11px.
- **Do** respeitar `prefers-reduced-motion` e usar transições apenas para explicar mudança de estado.
- **Do** testar a composição em 390px, 1024px e telas amplas.

### Don't:

- **Don't** preencher telas com gradientes, brilhos neon ou cartões translúcidos genéricos.
- **Don't** usar títulos óbvios como “Command Center” quando o contexto já explica a função da tela.
- **Don't** esconder navegação apenas visualmente e deixá-la acessível ao teclado fora da tela.
- **Don't** animar a entrada de todo conteúdo; a interface deve estar pronta quando aparece.
- **Don't** usar caixa alta em parágrafos, tracking excessivamente apertado ou padding menor que 8px em contêineres visíveis.
