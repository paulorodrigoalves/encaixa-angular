import { HttpInterceptorFn } from '@angular/common/http';
import { keycloak } from './keycloak.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Não envia token em rotas públicas
  if (req.url.includes('/api/public/')) {
    return next(req);
  }

  if (keycloak.authenticated && keycloak.token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${keycloak.token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
