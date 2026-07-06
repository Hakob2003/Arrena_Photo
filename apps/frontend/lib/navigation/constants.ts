export const FLOW_ROUTES = [
  '/', // Home / Landing
  '/feed',
  '/generate',
  '/templates',
  '/marketplace',
  '/gallery',
  '/my-generations',
  '/my-templates'
];

export const isFlowRoute = (pathname: string) => {
  return FLOW_ROUTES.includes(pathname);
};

export const getAdjacentRoutes = (pathname: string) => {
  const index = FLOW_ROUTES.indexOf(pathname);
  if (index === -1) return { prev: null, next: null };
  
  return {
    prev: index > 0 ? FLOW_ROUTES[index - 1] : FLOW_ROUTES[FLOW_ROUTES.length - 1], // Loop around or stop? Let's loop around
    next: index < FLOW_ROUTES.length - 1 ? FLOW_ROUTES[index + 1] : FLOW_ROUTES[0]
  };
};
