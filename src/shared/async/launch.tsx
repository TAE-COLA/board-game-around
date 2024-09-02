export async function launch(setLoading: (value: { type: 'LOADING', loading: boolean}) => void, task: () => void) {
  setLoading({ type: 'LOADING', loading: true });
  await task();
  setLoading({ type: 'LOADING', loading: false });
}