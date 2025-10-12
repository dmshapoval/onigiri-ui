import { isNil } from "./common"
import { Observable, filter, map } from "rxjs"

export function whenIsNotNull<T>(src: Observable<T | null | undefined>): Observable<T> {
  return src.pipe(filter(v => !isNil(v)), map(v => v as T));
}

export function castTo<T>(): (src: Observable<any>) => Observable<T> {
  return src => src.pipe(map(v => v as T))
}

export function observeOnMutation(target: HTMLElement, config: MutationObserverInit): Observable<MutationRecord[]> {

  return new Observable((observer) => {
    const mutation = new MutationObserver(mutations => {
      observer.next(mutations);
    });

    mutation.observe(target, config);

    const unsubscribe = () => {
      mutation.disconnect();
    };

    return unsubscribe;
  });
}