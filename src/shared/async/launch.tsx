export async function launch(task: () => void, setLoading: (loading: boolean) => void) {
  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 1000));
  await task();
  setLoading(false);
}