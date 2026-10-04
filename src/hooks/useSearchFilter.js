import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { DAYS_FULL } from '../utils/calendarHelpers';

export function useSearchFilter(events = []) {
  const [searchQuery, setSearchQuery]         = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [calFilter, setCalFilter]             = useState({ kerja: true, pribadi: true });

  const searchInputRef     = useRef(null);
  const searchContainerRef = useRef(null);

  const queryLower  = searchQuery.trim().toLowerCase();
  const isSearching = queryLower.length > 0;

  const matchedEvents = useMemo(() => {
    if (!isSearching) return [];
    return events.filter(e => {
      const titleMatch = (e.title   || '').toLowerCase().includes(queryLower);
      const subMatch   = (e.subtitle || '').toLowerCase().includes(queryLower);
      const dayMatch   = (e.day !== undefined && DAYS_FULL[e.day] ? DAYS_FULL[e.day] : '').toLowerCase().includes(queryLower);
      const typeMatch  = (e.type    || '').toLowerCase().includes(queryLower);
      return titleMatch || subMatch || dayMatch || typeMatch;
    });
  }, [events, queryLower, isSearching]);

  const matchedEventIds = useMemo(() => new Set(matchedEvents.map(e => e.id)), [matchedEvents]);

  // Keyboard shortcut: Ctrl+K / Cmd+K dan Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        if (searchQuery) setSearchQuery('');
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Click outside to dismiss search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCalFilter = useCallback((type) => {
    setCalFilter(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    calFilter,
    setCalFilter,
    toggleCalFilter,
    searchInputRef,
    searchContainerRef,
    isSearching,
    matchedEvents,
    matchedEventIds,
  };
}
export default useSearchFilter;
