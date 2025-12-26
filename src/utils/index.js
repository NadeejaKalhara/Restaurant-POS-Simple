export const createPageUrl = (page) => {
  const routes = {
    'Home': '/',
    'POSTerminal': '/pos',
    'Admin': '/admin',
  };
  return routes[page] || '/';
};






