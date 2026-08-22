import { useState, useEffect, useRef, useCallback } from 'react';
import { GeocodingAdapter } from '../../data/adapters/GeocodingAdapter';
import { GeocodedLocation } from '../../domain/models/GeocodedLocation';

export interface UseGeocodingAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  initialQuery?: string;
}

export interface UseGeocodingAutocompleteReturn {
  query: string;
  setQuery: (q: string) => void;
  suggestions: GeocodedLocation[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearQuery: () => void;
  selectSuggestion: (loc: GeocodedLocation) => void;
}

export function useGeocodingAutocomplete(
  onSelect?: (loc: GeocodedLocation) => void,
  options: UseGeocodingAutocompleteOptions = {}
): UseGeocodingAutocompleteReturn {
  const { debounceMs = 300, minChars = 3, initialQuery = '' } = options;

  const [query, setQuery] = useState<string>(initialQuery);
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const geocodingAdapterRef = useRef<GeocodingAdapter>(new GeocodingAdapter());
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearQuery = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const selectSuggestion = useCallback(
    (loc: GeocodedLocation) => {
      setQuery(loc.name);
      setIsOpen(false);
      if (onSelect) {
        onSelect(loc);
      }
    },
    [onSelect]
  );

  useEffect(() => {
    const trimmed = query.trim();

    // If query is too short, suppress network requests and provide default landmarks if open
    if (trimmed.length < minChars) {
      if (trimmed.length === 0) {
        geocodingAdapterRef.current.forwardGeocode('').then((defaultLandmarks) => {
          setSuggestions(defaultLandmarks);
          setIsLoading(false);
        });
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
      return;
    }

    // Cancel previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set loading indicator
    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await geocodingAdapterRef.current.forwardGeocode(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setSuggestions(results);
          if (results.length > 0) {
            setIsOpen(true);
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('Geocoding autocomplete query failed:', err);
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, minChars]);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    isOpen,
    setIsOpen,
    clearQuery,
    selectSuggestion,
  };
}
