import { ToastOptions } from 'shared';

type Event = {
  onClickExitButton: () => void;
  onClickCopyButton: () => void;
  onClickStartButton: () => void;
};

type SideEffect =
  | { type: 'POP_BACK_STACK' }
  | { type: 'NAVIGATE_TO_YACHT_DICE' }
  | { type: 'NAVIGATE_TO_DAVINCI_CODE' }
  | { type: 'COPY_CLIPBOARD'; value: string }
  | { type: 'SHOW_TOAST'; options: ToastOptions }
  | undefined;

export { Event, SideEffect };
