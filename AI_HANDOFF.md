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
*   **Motor de Renderização SVG:** O componente `<app-gaveta-svg>` (`gaveta-svg.component.ts`) desenha nativamente na tela as coordenadas que a API retorna. Ele apenas lê os objetos DTO (`DivisoriaRenderDTO`, `ObjetoPosicionadoDTO`) e cria os elementos SVG com rótulos e indicação de rotação 90°.
*   **Keycloak e Autenticação:** Usamos a lib `keycloak-angular@19.0.2` inicializada via `APP_INITIALIZER` (`keycloak.config.ts`). A verificação em background (`check-sso`) está propositalmente DESABILITADA (`checkLoginIframe: false`) para contornar políticas de CSP modernas. Não reabilite isso a menos que a infraestrutura do Keycloak seja alterada.

## 3. Estado Atual (O que já está pronto)
✅ **Página Inicial Pública (`HomeComponent`):** Possui o formulário reativo das medidas (Largura, Profundidade, Altura, Material, Template).
✅ **Integração Backend:** O formulário possui um `debounceTime(350)` que dispara um POST silencioso para a API Java (`LayoutService.ts`).
✅ **Motor Gráfico e Financeiro:** Ao receber a resposta, o painel central atualiza instantaneamente o desenho do SVG com as paredes do organizador, e o painel inferior direito mostra o card dinâmico de **Orçamento** com formatação de moeda (BRL).
✅ **Navbar e Auth com Roteamento por Perfil:** A `<app-navbar>` possui os botões de Login / Logout acoplados ao Keycloak. Ao clicar em "Entrar", o fluxo passa pela rota intermediária `/auth/post-login` (`PostLoginComponent`), que analisa os papéis no token JWT: se o usuário possui a role `admin`, redireciona direto para [`/admin`](file:///C:/Users/User/Documents/Projetos/Encaixa%20Reescrito%20Java/encaixa-angular/src/app/features/admin/admin.component.ts); caso seja cliente comum, redireciona para [`/app/projetos`](file:///C:/Users/User/Documents/Projetos/Encaixa%20Reescrito%20Java/encaixa-angular/src/app/features/cliente/meus-projetos/meus-projetos.component.ts). Exibe badge visual `ADMIN` e atalhos contextuais no topo.
✅ **Simulador por Objetos Inteligente:** A `HomeComponent` possui alternância entre os modos **"Por Template"** e **"Pelos Meus Objetos"**, renderizando os compartimentos com cores, rótulos e badge de rotação 90°. Quando há múltiplas opções viáveis (em colunas, em linhas, girado), o cliente pode alternar via botões de variação. Quando os itens não cabem, exibe botão de 1-clique para auto-ajustar a gaveta para a medida mínima recomendada e/ou sugestão de 2 bandejas empilhadas.
✅ **Persistência, Carrinho, Busca Automática de CEP, Frete e Pagamento (`/app/projetos`):** `authInterceptor` injeta o Bearer Token do Keycloak apenas nas rotas da API (`/api/**`), permitindo chamadas externas limpas. O botão "Salvar Projeto" adiciona ao carrinho e redireciona para `MeusProjetosComponent` (`/app/projetos`), que permite **remover itens do carrinho** (`DELETE /api/projetos/{id}` com recálculo automático do pacote/frete), preenche automaticamente Rua, Bairro, Cidade e UF ao digitar os 8 dígitos do CEP via ViaCEP/BrasilAPI, aplica máscara de telefone e validação visual por campo no checkout, e oferece **múltiplas formas de pagamento** (**PIX** com QR Code e Copia-e-Cola, **Cartão de Crédito** em até 12x e **Boleto Bancário** com linha digitável, além de botão de simulação em 1 clique para ambiente de desenvolvimento), exibindo também código de rastreio e a linha do tempo de produção (`PedidoEtapa`).
✅ **Área Admin (`/admin`):** `AdminComponent` possui abas para **Pedidos & Precificação** (regras de preço, aprovação de compras, esteira de produção e impressão da **Ficha Técnica / Plano de Corte para Marcenaria**) e **Catálogo (Materiais & Objetos)**, que contempla 4 seções gerenciáveis em tempo real:
  1. **Tipos de Material (Base Estrutural)**;
  2. **Materiais & Revestimentos (Tecidos e Cores)** — com anexo de foto ilustrativa por URL ou upload direto convertido em Base64 Data URL, thumbnail visual e **bloqueio visual e desabilitação de campos estruturais/cor para materiais com pedidos em corte e produção**;
  3. **Tipos de Objeto (Itens do Simulador)**;
  4. **Etapas da Esteira de Produção (`EtapaProducao`)** — permite que cada dono de projeto cadastre novas etapas, defina ou reordene a sequência (`ordem`), edite nomes, ative/desative ou exclua etapas sem afetar o histórico de pedidos antigos.
✅ **Fotos Ilustrativas no Simulador (`HomeComponent`):** Ao selecionar qualquer material/tecido de acabamento (ex: Veludo Preto, Linho Natural), o cliente visualiza imediatamente um card com a foto ilustrativa de como o organizador final fica pronto naquele tecido, detalhes de cor, espessura e adicional fixo, com funcionalidade de modal lightbox para ampliar e inspecionar a foto em detalhes.

## 4. Próximos Passos (To-Do / Onde Paramos)
1.  **Notificações de Produção via WhatsApp:** Integrar disparo automático de mensagens ao avançar etapas de pedido.
2.  **Integração de Frete Real (Melhor Envio / Correios):** Integrar cotação em tempo real via API de transportadoras.
