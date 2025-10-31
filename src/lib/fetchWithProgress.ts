export async function fetchWithProgress(input: RequestInfo | URL, init?: RequestInit) {
  const { default: NProgress } = await import('nprogress');
  try {
    NProgress.start();
    const res = await fetch(input, init);
    return res;
  } finally {
    NProgress.done();
  }
}
