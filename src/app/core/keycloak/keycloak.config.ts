import { APP_INITIALIZER, Provider } from '@angular/core';
import Keycloak from 'keycloak-js';

// Inicializa a instância do Keycloak
export const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'encaixa',
  clientId: 'encaixa-frontend'
});

export function initializeKeycloak() {
  return () =>
    keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      pkceMethod: 'S256'
    });
}

// Provider a ser incluído no app.config.ts
export const provideKeycloakAngular: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initializeKeycloak,
  multi: true
};
