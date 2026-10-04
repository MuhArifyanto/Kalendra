import { useState, useMemo, useCallback } from 'react';
import {
  DAYS_FULL, MONTHS_ID, getWeekDates, getMonthViewDays,
} from '../utils/calendarHelpers';

export function useCalendarNavigation(initialDate = new Date(), initialMode = 'week') {
  const [today]      = useState(() => new Date(initialDate));
  const [selected, setSelected]   = useState(() => new Date(initialDate));
  const [weekOffset, setWeekOffset] = useState(0);
  const [calMode, setCalMode]     = useState(initialMode);

  // 7 dates in currently viewed week
  const weekDates = useMemo(() => {
    const base = new Date(today);
    base.setDate(today.getDate() + weekOffset * 7);
    return getWeekDates(base);
  }, [today, weekOffset]);

  const weekLabel = useMemo(() => {
    const first = weekDates[0];
    const last  = weekDates[6];
    return first.getMonth() === last.getMonth()
      ? `${MONTHS_ID[first.getMonth()]} ${first.getFullYear()}`
      : `${MONTHS_ID[first.getMonth()]} – ${MONTHS_ID[last.getMonth()]} ${last.getFullYear()}`;
  }, [weekDates]);

  const calHeaderLabel = useMemo(() => {
    if (calMode === 'day') {
      return `${DAYS_FULL[selected.getDay()]}, ${selected.getDate()} ${MONTHS_ID[selected.getMonth()]} ${selected.getFullYear()}`;
    }
    if (calMode === 'month') {
      return `${MONTHS_ID[selected.getMonth()]} ${selected.getFullYear()}`;
    }
    return weekLabel;
  }, [calMode, selected, weekLabel]);

  const monthDays = useMemo(() => {
    return getMonthViewDays(selected.getFullYear(), selected.getMonth());
  }, [selected]);

  const syncWeekOffset = useCallback((dt) => {
    const toSunday = (d) => {
      const s = new Date(d);
      s.setDate(d.getDate() - d.getDay());
      s.setHours(0, 0, 0, 0);
      return s;
    };
    const diffWeeks = Math.round((toSunday(dt).getTime() - toSunday(today).getTime()) / (1000 * 3600 * 24 * 7));
    setWeekOffset(diffWeeks);
  }, [today]);

  const handleNavPrev = useCallback(() => {
    if (calMode === 'day') {
      setSelected(d => {
        const n = new Date(d);
        n.setDate(d.getDate() - 1);
        syncWeekOffset(n);
        return n;
      });
    } else if (calMode === 'month') {
      setSelected(d => {
        const n = new Date(d);
        n.setMonth(d.getMonth() - 1);
        syncWeekOffset(n);
        return n;
      });
    } else {
      setWeekOffset(o => o - 1);
    }
  }, [calMode, syncWeekOffset]);

  const handleNavNext = useCallback(() => {
    if (calMode === 'day') {
      setSelected(d => {
        const n = new Date(d);
        n.setDate(d.getDate() + 1);
        syncWeekOffset(n);
        return n;
      });
    } else if (calMode === 'month') {
      setSelected(d => {
        const n = new Date(d);
        n.setMonth(d.getMonth() + 1);
        syncWeekOffset(n);
        return n;
      });
    } else {
      setWeekOffset(o => o + 1);
    }
  }, [calMode, syncWeekOffset]);

  const goToday = useCallback(() => {
    const now = new Date();
    setSelected(now);
    setWeekOffset(0);
  }, []);

  const selectDate = useCallback((dt) => {
    setSelected(dt);
    syncWeekOffset(dt);
  }, [syncWeekOffset]);

  return {
    today,
    selected,
    setSelected,
    selectDate,
    weekOffset,
    setWeekOffset,
    calMode,
    setCalMode,
    weekDates,
    weekLabel,
    calHeaderLabel,
    monthDays,
    syncWeekOffset,
    handleNavPrev,
    handleNavNext,
    goToday,
  };
}
export default useCalendarNavigation;
