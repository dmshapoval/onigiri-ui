export type Callback = () => void;

export interface Callbacks {
  success?: Callback;
  error?: Callback;
}

export interface HasType<T extends string> {
  _type: T;
}

export interface RichText {
  html: string;
  text: string;
}

export function toRichText(v: string): RichText {
  const el = document.createElement('div');
  el.innerHTML = v;

  return {
    html: el.innerHTML,
    text: el.innerText
  };
}
