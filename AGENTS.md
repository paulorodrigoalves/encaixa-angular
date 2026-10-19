# Instruções Obrigatórias para Agentes de IA (Encaixa - Frontend)

> **REGRA #1:** Antes de executar qualquer tarefa, propor mudanças ou editar arquivos neste repositório, **leia integralmente o arquivo [`AI_HANDOFF.md`](./AI_HANDOFF.md)**.

## Resumo Rápido de Guardrails
1. **Angular 19 Standalone + Tailwind v3:** Todos os componentes são `standalone: true`. Mantenha o Tailwind na versão 3.x.
2. **Keycloak (`keycloak.config.ts`):** Mantenha `checkLoginIframe: false` e sem `check-sso` automático na inicialização para evitar bloqueio de CSP do Keycloak. O `authInterceptor` injeta o Bearer token nas rotas autenticadas (`/api/projetos`, `/api/compras`, `/api/admin`).
3. **Motor SVG (`<app-gaveta-svg>`):** Apenas renderiza o `PreviewLayoutResponse` retornado pelo backend (`../encaixa-java`).

Consulte [`AI_HANDOFF.md`](./AI_HANDOFF.md) para ver o estado atual das telas (`/`, `/app/projetos`, `/admin`) e os próximos passos.
