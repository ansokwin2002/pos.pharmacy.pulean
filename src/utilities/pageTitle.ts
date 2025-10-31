export const formatPageTitle = (pageTitle: string) => {
  return `${pageTitle} | Punleukrek Pharmacy`;
};

export const setPageTitle = (pageTitle: string) => {
  if (typeof document !== 'undefined') {
    document.title = formatPageTitle(pageTitle);
  }
};
