export async function launch(setLoading: (loading: boolean) => void, task: () => void) {
  setLoading(true);
  await task();
  setLoading(false);
}