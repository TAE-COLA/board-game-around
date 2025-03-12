export const launch = async (setLoading: (loading: boolean) => void, task: () => Promise<void>) => {
  setLoading(true);
  await task();
  setLoading(false);
};
