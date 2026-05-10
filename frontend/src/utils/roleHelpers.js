export const getBasePath = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'HEALTH_WORKER') return '/petugas';
  if (role === 'VILLAGE_HEAD') return '/kepala-desa';
  return '';
};
