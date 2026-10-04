import { useState, useMemo, useCallback } from 'react';
import { DEMO_EVENTS } from '../data/demoEvents';
import { useToast } from '../context/ToastContext';

/**
 * Menghitung acara berikutnya yang paling relevan berdasarkan waktu sekarang (bukan nama acara).
 */
export function calculateNextEvent(events, now = new Date()) {
  if (!events || events.length === 0) return null;

  const validUpcoming = events
    .map(ev => {
      let eventStart;
      if (ev.date) {
        eventStart = new Date(ev.date);
      } else if (ev.day !== undefined) {
        const d = new Date(now);
        const dayDiff = ev.day - d.getDay();
        eventStart = new Date(d);
        eventStart.setDate(d.getDate() + dayDiff);
      } else {
        eventStart = new Date(now);
      }
      const hour = Math.floor(ev.start || 0);
      const min  = Math.round(((ev.start || 0) % 1) * 60);
      eventStart.setHours(hour, min, 0, 0);

      const eventEnd = new Date(eventStart);
      const endHour  = Math.floor(ev.end || (ev.start + 1));
      const endMin   = Math.round(((ev.end || (ev.start + 1)) % 1) * 60);
      eventEnd.setHours(endHour, endMin, 0, 0);

      return {
        event: ev,
        startDateTime: eventStart,
        endDateTime: eventEnd,
      };
    })
    .filter(({ event, endDateTime }) => !event.completed && endDateTime >= now)
    .sort((a, b) => a.startDateTime - b.startDateTime);

  if (validUpcoming.length > 0) {
    return validUpcoming[0].event;
  }

  // Jika tidak ada acara di masa depan hari ini, pilih acara aktif berikutnya yang belum selesai
  const uncompleted = events.filter(e => !e.completed);
  return uncompleted[0] || events[0] || null;
}

export function useEventManagement(initialEvents = DEMO_EVENTS) {
  const { addToast }                      = useToast();
  const [events, setEvents]               = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lastDeletedEvent, setLastDeletedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);

  // Acara berikutnya dihitung berdasarkan waktu aktual
  const nextEventItem = useMemo(() => {
    return calculateNextEvent(events, new Date());
  }, [events]);

  const handleOpenNewEvent = useCallback((initial = null) => {
    setModalInitialData(initial);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalInitialData(null);
  }, []);

  const handleAddEvent = useCallback((newEvent) => {
    const id = Date.now();
    const eventWithId = {
      ...newEvent,
      id,
      date: newEvent.date || new Date(),
    };
    setEvents(prev => [...prev, eventWithId]);
    setIsModalOpen(false);
    setModalInitialData(null);
    addToast('Acara berhasil ditambahkan!', 'success');
    return eventWithId;
  }, [addToast]);

  const handleUpdateEvent = useCallback((updated) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    setSelectedEvent(updated);
    addToast('Perubahan acara berhasil disimpan!', 'success');
  }, [addToast]);

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => {
      const ev = prev.find(e => e.id === eventId);
      if (ev) {
        setLastDeletedEvent(ev);
        setTimeout(() => setLastDeletedEvent(curr => curr?.id === eventId ? null : curr), 7000);
      }
      return prev.filter(e => e.id !== eventId);
    });
    setSelectedEvent(null);
    addToast('Acara berhasil dihapus dari kalender.', 'info');
  }, [addToast]);

  const handleUndoDelete = useCallback(() => {
    if (lastDeletedEvent) {
      setEvents(prev => [...prev, lastDeletedEvent]);
      addToast(`Acara "${lastDeletedEvent.title}" berhasil dipulihkan!`, 'success');
      setLastDeletedEvent(null);
    }
  }, [lastDeletedEvent, addToast]);

  const handleToggleComplete = useCallback((eventId) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const next    = !e.completed;
      const updated = { ...e, completed: next };
      setSelectedEvent(curr => curr?.id === eventId ? updated : curr);
      addToast(next ? 'Acara ditandai selesai! 🎉' : 'Status acara dikembalikan ke aktif.', 'info');
      return updated;
    }));
  }, [addToast]);

  const handleEventDrop = useCallback((eventId, newDay, newStartHour, newDate) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const duration = ev.end - ev.start;
      return {
        ...ev,
        day: newDay,
        start: newStartHour,
        end: Math.min(newStartHour + duration, 20),
        ...(newDate ? { date: newDate } : {}),
      };
    }));
    addToast('Jadwal berhasil digeser ke waktu baru!', 'success');
  }, [addToast]);

  return {
    events,
    setEvents,
    selectedEvent,
    setSelectedEvent,
    lastDeletedEvent,
    isModalOpen,
    modalInitialData,
    nextEventItem,
    handleOpenNewEvent,
    handleCloseModal,
    handleAddEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleUndoDelete,
    handleToggleComplete,
    handleEventDrop,
  };
}
export default useEventManagement;
