
import 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * The AppKit button web component from Reown.
       */
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
export {};
