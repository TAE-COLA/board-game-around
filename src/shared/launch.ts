export const launch = async (setLoading: (loading: boolean) => void, task: () => Promise<void>) => {
  setLoading(true);
  try {
    await task();
  } finally {
    setLoading(false);
  }
};
