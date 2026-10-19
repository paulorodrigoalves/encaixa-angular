# 🧠 AI Context & Handoff (Encaixa - Frontend)

> **ATENÇÃO PARA QUALQUER IA LENDO ESTE ARQUIVO:** 
> Este documento contém o contexto arquitetural, UI/UX e o estado atual do projeto. **Sempre leia este documento antes de propor refatorações globais ou mudar a estrutura de módulos.**

## 1. Visão Geral do Sistema
O **Encaixa** é um sistema B2B/B2C para venda de organizadores em acrílico e MDF (com revestimentos em tecidos como veludo, courino, linho). 
Este repositório contém a aplicação client-side que renderiza o organizador (simulador) em tempo real, servindo como uma ferramenta de design interativa que calcula descontos milimétricos dos tecidos/materiais e gera as medidas exatas para a marcenaria.

*   **Stack:** Angular 19, Standalone Components, Reactive Forms, Tailwind CSS v3.
*   **Repositório Backend Par:** `encaixa-java` (Spring Boot 3, PostgreSQL, Keycloak).

## 2. Decisões Arquiteturais e Guardrails (CRÍTICO)
*   **Standalone Components:** O projeto usa o modelo moderno do Angular (sem `ngModules`). Todos os componentes devem ser `standalone: true` e importar suas próprias dependências.
*   **Tailwind CSS V3:** O projeto usa `tailwindcss@^3.4.0` (Não atualize para a V4, pois o builder nativo do Angular 19 ainda tem bugs de integração com PostCSS/V4).
*   **Motor de Renderização SVG:** O componente `<app-gaveta-svg>` (`gaveta-svg.component.ts`) desenha nativamente na tela as coordenadas que a API retorna. Ele não processa a colisão de geometria de alto nível (isso é papel do Backend). Ele apenas lê os objetos DTO (`DivisoriaRenderDTO`) e cria retângulos SVG.
*   **Keycloak e Autenticação:** Usamos a lib `keycloak-angular@19.0.2` inicializada via `APP_INITIALIZER` (`keycloak.config.ts`). A verificação em background (`check-sso`) está propositalmente DESABILITADA (`checkLoginIframe: false`) para contornar políticas de CSP modernas. Não reabilite isso a menos que a infraestrutura do Keycloak seja alterada.

## 3. Estado Atual (O que já está pronto)
✅ **Página Inicial Pública (`HomeComponent`):** Possui o formulário reativo das medidas (Largura, Profundidade, Altura, Material, Template).
✅ **Integração Backend:** O formulário possui um `debounceTime(500)` que dispara um POST silencioso para a API Java (`LayoutService.ts`).
✅ **Motor Gráfico e Financeiro:** Ao receber a resposta, o painel central atualiza instantaneamente o desenho do SVG com as paredes do organizador, e o painel inferior direito mostra o card dinâmico de **Orçamento** com formatação de moeda (BRL).
✅ **Navbar e Auth:** A `<app-navbar>` possui os botões de Login / Logout acoplados ao Keycloak. Ao logar, ela mostra o nome do usuário extraído do JWT e um menu de Admin condicional (baseado nas roles do token).
✅ **Persistência e Área do Cliente (`/app/projetos`):** `authInterceptor` configurado para injetar o Bearer Token do Keycloak. O botão "Salvar Projeto" na `HomeComponent` salva o projeto no banco e redireciona para `MeusProjetosComponent` (`/app/projetos`), exibindo os projetos salvos, status da compra, código de rastreio e linha do tempo de produção (`PedidoEtapa`).
✅ **Simulador por Objetos:** A `HomeComponent` agora possui alternância entre os modos **"Por Template"** e **"Pelos Meus Objetos"**, permitindo incrementar/decrementar a quantidade de cada `TipoObjeto` do catálogo, renderizando os rótulos e cores dos objetos dentro dos compartimentos no SVG e exibindo alertas amigáveis quando os objetos não cabem na gaveta.
✅ **Área Admin (`/admin`):** Criada a `AdminComponent` conectada ao `ApiAdminService` para publicação de novas regras de precificação, aprovação de compras, registro de etapas da esteira de produção e visualização da **Ficha Técnica / Plano de Corte para Marcenaria**.

## 4. Próximos Passos (To-Do / Onde Paramos)
1.  **Cálculo de Frete / Endereço do Cliente:** Integrar `EstimadorPacote` e formulário de endereço na finalização da compra.
2.  **Gestão de Catálogo no Admin:** Telas para cadastrar/editar Materiais, Templates e Tipos de Objeto.

