import {
  LoadingFinishedEventName,
  LoadingStartedEventName,
  LoadState,
} from "./constants";
import { dispatchCustomEvent } from "./utils";

export class LoadIndicator {
  private startAnimationTimeout: number | null = null;

  constructor() {}

  startLoadingAnimation(): void {
    if (
      document.body.classList.contains(LoadState.IsLoading) ||
      document.body.classList.contains(LoadState.BeforeLoading) ||
      document.body.classList.contains(LoadState.IsIndeterminate)
    ) {
      return;
    }

    if (this.startAnimationTimeout) {
      clearTimeout(this.startAnimationTimeout);
      this.startAnimationTimeout = null;
    }

    document.body.classList.add(LoadState.BeforeLoading);

    this.startAnimationTimeout = setTimeout(() => {
      dispatchCustomEvent(LoadingStartedEventName);
      this.triggerLoadingAnimation();
    }, 200);
  }

  private triggerLoadingAnimation(): void {
    document.body.classList.add(LoadState.IsLoading);
    document.body.classList.remove(LoadState.BeforeLoading);

    this.startAnimationTimeout = setTimeout(() => {
      document.body.classList.add(LoadState.IsIndeterminate);
    }, 2000);
  }

  stopLoadingAnimation(): void {
    if (this.startAnimationTimeout) {
      clearTimeout(this.startAnimationTimeout);
      this.startAnimationTimeout = null;
    }

    if (
      document.body.classList.contains(LoadState.IsLoading) ||
      document.body.classList.contains(LoadState.IsIndeterminate)
    ) {
      document.body.classList.add(LoadState.AfterLoading);
      setTimeout(() => {
        document.body.classList.remove(LoadState.AfterLoading);
      }, 500);
    }

    document.body.classList.remove(LoadState.IsLoading);
    document.body.classList.remove(LoadState.BeforeLoading);
    document.body.classList.remove(LoadState.IsIndeterminate);
    dispatchCustomEvent(LoadingFinishedEventName);
  }
}
