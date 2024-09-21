import { useEffect } from 'react';

type UseClickOutsideProps = {
  ref: React.RefObject<HTMLElement>;
  handler: (event: MouseEvent | TouchEvent) => void;
};

export default function useClickOutside({ ref, handler }: UseClickOutsideProps) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}