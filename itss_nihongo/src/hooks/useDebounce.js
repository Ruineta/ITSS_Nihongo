import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @returns {any} - The debounced value
 */
const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if value changes before the delay is over
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
