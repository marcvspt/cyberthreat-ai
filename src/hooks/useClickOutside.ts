import { useEffect } from 'react';
import type { RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    isEnabled: boolean,
    onOutsideClick: () => void
) {
    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) {
                onOutsideClick();
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [isEnabled, onOutsideClick, ref]);
}
