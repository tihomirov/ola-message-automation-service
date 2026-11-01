import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Api } from './api';

/** Any 401 from a protected API call sends the user to the login page. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !req.url.includes('/api/auth/')) {
        void router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};

export const authGuard: CanActivateFn = async () => {
  const api = inject(Api);
  const router = inject(Router);
  try {
    const me = await api.me();
    if (!me.logged_in) return router.createUrlTree(['/login']);
    await api.loadMeta();
    return true;
  } catch {
    return router.createUrlTree(['/login']);
  }
};

/** The Shop page exists only in flow 2 (fetch order details). */
export const flow2Guard: CanActivateFn = () => {
  const api = inject(Api);
  return api.meta()?.fetch_order_details ? true : inject(Router).createUrlTree(['/settings']);
};
