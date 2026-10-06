'use client';

export type AuthRole = 'none' | 'admin' | 'super-admin';

/**
 * Récupère le rôle d'authentification actuel du client dans le navigateur
 */
export function getClientAuthRole(): AuthRole {
  if (typeof window === 'undefined') return 'none';
  try {
    const superAdminPass = sessionStorage.getItem('cs_super_admin_pass');
    const isSuperAdminFlag = sessionStorage.getItem('cs_is_super_admin') === 'true'
      || localStorage.getItem('cs_is_super_admin') === 'true'
      || localStorage.getItem('cs_super_admin_auth') === 'true';

    if (superAdminPass || isSuperAdminFlag) {
      return 'super-admin';
    }

    const adminAuth = sessionStorage.getItem('cs_admin_auth') === 'true'
      || localStorage.getItem('cs_admin_auth') === 'true';

    if (adminAuth) {
      return 'admin';
    }
  } catch (e) {
    // ignore
  }
  return 'none';
}

/**
 * Enregistre ou réinitialise l'état d'authentification et notifie les composants
 */
export function setClientAuth(role: AuthRole, isSuperAdmin = false) {
  if (typeof window === 'undefined') return;
  try {
    if (role === 'none') {
      sessionStorage.removeItem('cs_admin_auth');
      sessionStorage.removeItem('cs_is_super_admin');
      sessionStorage.removeItem('cs_super_admin_pass');
      localStorage.removeItem('cs_admin_auth');
      localStorage.removeItem('cs_is_super_admin');
      localStorage.removeItem('cs_super_admin_auth');
    } else if (role === 'super-admin') {
      sessionStorage.setItem('cs_admin_auth', 'true');
      sessionStorage.setItem('cs_is_super_admin', 'true');
      localStorage.setItem('cs_admin_auth', 'true');
      localStorage.setItem('cs_is_super_admin', 'true');
      localStorage.setItem('cs_super_admin_auth', 'true');
    } else if (role === 'admin') {
      sessionStorage.setItem('cs_admin_auth', 'true');
      localStorage.setItem('cs_admin_auth', 'true');
      if (isSuperAdmin) {
        sessionStorage.setItem('cs_is_super_admin', 'true');
        localStorage.setItem('cs_is_super_admin', 'true');
      } else {
        sessionStorage.removeItem('cs_is_super_admin');
        sessionStorage.removeItem('cs_super_admin_pass');
        localStorage.removeItem('cs_is_super_admin');
        localStorage.removeItem('cs_super_admin_auth');
      }
    }

    // Déclencher un événement pour réactivité immédiate dans Navbar & Footer
    window.dispatchEvent(new Event('cs-auth-change'));
  } catch (e) {
    // ignore
  }
}
