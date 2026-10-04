import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

// ── Sub-components ──────────────────────────────────────────────────────────
import MiniCalendar     from '../../components/dashboard/MiniCalendar';
import CalEvent         from '../../components/dashboard/CalEvent';
import AIAssistant      from '../../components/dashboard/AIAssistant';
import NewEventModal    from '../../components/dashboard/NewEventModal';
import EventDetailModal  from '../../components/dashboard/EventDetailModal';
import SummaryView      from './SummaryView';
import ProfileView      from './ProfileView';
import SettingsView     from './SettingsView';

// ── Custom Hooks ────────────────────────────────────────────────────────────
import { useCalendarNavigation } from '../../hooks/useCalendarNavigation';
import { useEventManagement }    from '../../hooks/useEventManagement';
import { useSearchFilter }       from '../../hooks/useSearchFilter';

// ── Icons ───────────────────────────────────────────────────────────────────
import {
  CalIcon, ChevL, ChevR, ChevD, BellIcon, PlusIcon, GridIcon,
  DotBlue, SearchIcon, CheckIcon2, UserIcon, SettingsIcon,
  LogoutIcon, DownloadIcon, ClockIcon,
} from '../../icons';

// ── Utils & Data ────────────────────────────────────────────────────────────
import {
  DAYS_ID, DAYS_FULL, MONTHS_ID, HOURS, PX_PER_HOUR, START_HOUR,
  EVENT_COLORS, isSameDay, formatTime,
} from '../../utils/calendarHelpers';
import { generateICSContent, downloadICSFile } from '../../utils/icsGenerator';
import { INITIAL_NOTIFICATIONS } from '../../data/demoData';
import { DEMO_EVENTS } from '../../data/demoEvents';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const { addToast }            = useToast();
  const navigate                = useNavigate();

  // ── Custom Hooks ───────────────────────────────────────────────────────────
  const {
    today,
    selected,
    setSelected,
    selectDate,
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
  } = useCalendarNavigation();

  const {
    events,
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
  } = useEventManagement(DEMO_EVENTS);

  const {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    calFilter,
    toggleCalFilter,
    searchInputRef,
    searchContainerRef,
    isSearching,
    matchedEvents,
    matchedEventIds,
  } = useSearchFilter(events);

  // ── Local UI State ─────────────────────────────────────────────────────────
  const [currentView,   setCurrentView]   = useState('calendar');
  const [showUserMenu,  setShowUserMenu]  = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [currentTime,   setCurrentTime]   = useState(() => new Date());
  const [isDrawerOpen,  setIsDrawerOpen]  = useState(false);
  const [isAIOpen,      setIsAIOpen]      = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Lock body scroll when drawer or AI panel is open on mobile
  useEffect(() => {
    if (isDrawerOpen || isAIOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen, isAIOpen]);

  // Close drawer on Escape
  useEffect(() => {
    if (!isDrawerOpen && !isMobileSearchOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, isMobileSearchOpen]);

  // Real-time ticking clock for current-time marker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchResultClick = (ev) => {
    setSelectedEvent(ev);
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
    if (ev.date) {
      selectDate(new Date(ev.date));
    } else if (weekDates[ev.day]) {
      selectDate(weekDates[ev.day]);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    addToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifMenu(false);
    if (notif.type === 'event') {
      const ev = events.find(e => e.title.toLowerCase().includes('demo klien')) || events[0];
      if (ev) setSelectedEvent(ev);
    } else if (notif.type === 'summary') {
      setCurrentView('summary');
    } else if (notif.type === 'ai') {
      addToast('Asisten AI: Anda memiliki 3 rapat berturut-turut di hari Kamis.', 'info');
    } else if (notif.type === 'sync') {
      addToast('Kalender disinkronkan dengan Google Calendar (Mode Demo).', 'success');
    }
  };

  const handleDeleteNotif    = (e, id) => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== id)); };
  const handleClearAllNotifs = () => { setNotifications([]); addToast('Semua notifikasi telah dibersihkan.', 'info'); };

  const handleSlotClick = (colIdx, hour) => {
    const targetDate = weekDates[colIdx] || selected;
    handleOpenNewEvent({ day: colIdx, date: targetDate, start: hour, end: Math.min(hour + 1, 20) });
  };

  const handleLogout = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setShowUserMenu(false);
    setIsDrawerOpen(false);
    logout();
    addToast('Berhasil keluar. Sampai jumpa! 👋', 'success');
    navigate('/', { replace: true });
  };

  // ICS Export
  const handleExportAllICS = () => {
    const filtered = events.filter(e => calFilter[e.type]);
    if (!filtered.length) {
      addToast('Tidak ada jadwal aktif untuk diekspor (periksa filter kalender).', 'info');
      return;
    }
    downloadICSFile('daylight-jadwal-lengkap.ics', generateICSContent(filtered, weekDates));
    addToast(`Berhasil mengekspor ${filtered.length} jadwal ke "daylight-jadwal-lengkap.ics"!`, 'success');
  };

  const handleExportSingleICS = (ev) => {
    if (!ev) return;
    const cleanTitle = (ev.title || 'acara').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    downloadICSFile(`daylight-${cleanTitle}.ics`, generateICSContent([ev], weekDates));
    addToast(`Acara "${ev.title}" berhasil diekspor ke file .ics!`, 'success');
  };

  // Current-time marker calculations
  const currentHourDecimal   = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
  const isCurrentTimeVisible = currentHourDecimal >= START_HOUR && currentHourDecimal <= (START_HOUR + HOURS.length);
  const currentTimeTop       = (currentHourDecimal - START_HOUR) * PX_PER_HOUR;
  const formattedCurrentTime = `${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}`;
  const formattedSeconds     = String(currentTime.getSeconds()).padStart(2, '0');

  // ── Drag & Drop Slot Renderer ──────────────────────────────────────────────
  const renderDropSlots = (colIdx) =>
    HOURS.map(h => (
      <div
        key={h}
        className="db-cal-slot"
        style={{ height: PX_PER_HOUR }}
        onClick={() => handleSlotClick(colIdx, h)}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
        onDragEnter={(e) => e.currentTarget.classList.add('drag-hover')}
        onDragLeave={(e) => e.currentTarget.classList.remove('drag-hover')}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove('drag-hover');
          const id = e.dataTransfer.getData('text/plain');
          if (id) {
            const dropDate = weekDates[colIdx] || null;
            handleEventDrop(Number(id), colIdx, h, dropDate);
          }
        }}
        title={`Klik untuk tambah acara: ${DAYS_FULL[colIdx]}, ${h}:00`}
      >
        <span className="db-cal-slot-hint"><PlusIcon /> {h}:00</span>
      </div>
    ));

  return (
    <div className="db-root">
      {/* ── TOP BAR ── */}
      <header className={`db-topbar ${isMobileSearchOpen ? 'search-active' : ''}`}>
        {isMobileSearchOpen ? (
          <div className="db-topbar-mobile-search">
            <button
              type="button"
              className="db-mobile-search-back-btn"
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              aria-label="Tutup pencarian"
              title="Kembali"
            >
              ✕
            </button>
            <div className="db-topbar-mobile-search-input-wrap">
              <span className="db-cal-search-icon"><SearchIcon /></span>
              <input
                ref={searchInputRef}
                className="db-cal-search-input"
                placeholder="Cari acara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  className="db-cal-search-clear"
                  onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                  title="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile search popover results */}
            {isSearchFocused && isSearching && (
              <div className="db-cal-search-popover mobile">
                <div className="db-search-popover-header">
                  <span className="db-search-popover-title">Hasil Pencarian</span>
                  <span className="db-search-count-pill">{matchedEvents.length} acara</span>
                </div>
                <div className="db-search-results-list">
                  {matchedEvents.length === 0 ? (
                    <div className="db-search-empty">
                      <span>🔍</span>
                      <p>Tidak ada acara cocok dengan "{searchQuery}"</p>
                    </div>
                  ) : (
                    matchedEvents.map(ev => {
                      const c = EVENT_COLORS[ev.color] || EVENT_COLORS.blue;
                      return (
                        <div key={ev.id} className="db-search-result-item" onClick={() => handleSearchResultClick(ev)}>
                          <div className="db-search-item-dot" style={{ background: c.border }} />
                          <div className="db-search-item-text">
                            <div className="db-search-item-title">{ev.title}</div>
                            <div className="db-search-item-sub">
                              {DAYS_FULL[ev.day !== undefined ? ev.day : 1]}, {formatTime(ev.start)} – {formatTime(ev.end)} · {ev.subtitle}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="db-topbar-left">
              <button
                type="button"
                className="db-hamburger-btn"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Buka menu navigasi"
                aria-expanded={isDrawerOpen}
              >
                <span className="db-hamburger-bar" />
                <span className="db-hamburger-bar" />
                <span className="db-hamburger-bar" />
              </button>
              <div className="db-logo">
                <div className="db-logo-icon"><CalIcon /></div>
                <span className="db-logo-name">daylight</span>
                <span className="db-logo-plus">+</span>
              </div>
            </div>

            <div className="db-topbar-center">
              <div
                className="db-next-event"
                style={{ cursor: nextEventItem ? 'pointer' : 'default' }}
                onClick={() => nextEventItem && setSelectedEvent(nextEventItem)}
                title={nextEventItem ? 'Klik untuk melihat detail acara berikutnya' : ''}
              >
                <ClockIcon />
                <span className="db-next-label">BERIKUTNYA</span>
                <span className="db-next-title">{nextEventItem ? nextEventItem.title : 'Tidak ada acara'}</span>
                <span className="db-next-time">{nextEventItem ? `Hari ini, ${formatTime(nextEventItem.start)}` : '-'}</span>
              </div>

              {/* Quick Search */}
              <div className="db-cal-search-wrap" ref={searchContainerRef}>
                <div className={`db-cal-search-bar ${isSearchFocused ? 'focused' : ''} ${searchQuery ? 'has-query' : ''}`}>
                  <span className="db-cal-search-icon"><SearchIcon /></span>
                  <input
                    ref={searchInputRef}
                    className="db-cal-search-input"
                    placeholder="Cari acara, orang, atau waktu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                  />
                  {searchQuery && (
                    <button
                      className="db-cal-search-clear"
                      onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                      title="Hapus pencarian"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isSearchFocused && isSearching && (
                  <div className="db-cal-search-popover">
                    <div className="db-search-popover-header">
                      <span className="db-search-popover-title">Hasil Pencarian</span>
                      <span className="db-search-count-pill">{matchedEvents.length} acara</span>
                    </div>
                    <div className="db-search-results-list">
                      {matchedEvents.length === 0 ? (
                        <div className="db-search-empty">
                          <span>🔍</span>
                          <p>Tidak ada acara cocok dengan "{searchQuery}"</p>
                        </div>
                      ) : (
                        matchedEvents.map(ev => {
                          const c = EVENT_COLORS[ev.color] || EVENT_COLORS.blue;
                          return (
                            <div key={ev.id} className="db-search-result-item" onClick={() => handleSearchResultClick(ev)}>
                              <div className="db-search-item-dot" style={{ background: c.border }} />
                              <div className="db-search-item-text">
                                <div className="db-search-item-title">{ev.title}</div>
                                <div className="db-search-item-sub">
                                  {DAYS_FULL[ev.day !== undefined ? ev.day : 1]}, {formatTime(ev.start)} – {formatTime(ev.end)} · {ev.subtitle}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="db-topbar-right">
              {/* Mobile Search Icon Button (< 768px) */}
              <button
                type="button"
                className="db-mobile-search-btn"
                onClick={() => {
                  setIsMobileSearchOpen(true);
                  setIsSearchFocused(true);
                  setTimeout(() => searchInputRef.current?.focus(), 80);
                }}
                aria-label="Cari acara"
                title="Cari acara"
              >
                <SearchIcon />
              </button>

              {/* Notification Bell */}
              <div className="db-notif-wrap">
                <button
                  className="db-icon-btn notif"
                  onClick={() => { setShowNotifMenu(v => !v); setShowUserMenu(false); }}
                  title="Pusat Notifikasi"
                >
                  <BellIcon />
                  {unreadCount > 0 && <span className="db-notif-badge">{unreadCount}</span>}
                </button>

                {showNotifMenu && (
                  <>
                    <div className="db-dropdown-backdrop" onClick={() => setShowNotifMenu(false)} />
                    <div className="db-notif-dropdown">
                      <div className="db-notif-header">
                        <div className="db-notif-header-title">
                          <span>🔔 Notifikasi</span>
                          {unreadCount > 0 && <span className="db-notif-count-pill">{unreadCount} baru</span>}
                        </div>
                        {unreadCount > 0 && (
                          <button className="db-notif-mark-btn" onClick={handleMarkAllRead}>Tandai dibaca</button>
                        )}
                      </div>

                      <div className="db-notif-list">
                        {notifications.length === 0 ? (
                          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                            Tidak ada notifikasi saat ini
                          </div>
                        ) : (
                          notifications.map(notif => (
                            <div
                              key={notif.id}
                              className={`db-notif-item ${notif.unread ? 'unread' : ''}`}
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="db-notif-item-icon" style={{ background: notif.iconBg, color: notif.iconColor }}>
                                {notif.icon}
                              </div>
                              <div className="db-notif-item-body">
                                <div className="db-notif-item-title">
                                  {notif.title}
                                  {notif.unread && <span className="db-notif-unread-dot" />}
                                </div>
                                <div className="db-notif-item-desc">{notif.desc}</div>
                                <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{notif.time}</div>
                              </div>
                              <button
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
                                title="Hapus notifikasi"
                                onClick={(e) => handleDeleteNotif(e, notif.id)}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="db-notif-footer">
                          <button className="db-notif-clear-btn" onClick={handleClearAllNotifs}>Hapus Semua</button>
                          <div className="db-notif-sync-status">⚡ Tersinkronisasi</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="db-user-wrap">
                <button
                  className="db-avatar-btn"
                  onClick={() => { setShowUserMenu(v => !v); setShowNotifMenu(false); }}
                >
                  <div className="db-avatar-circle">{currentUser?.avatar}</div>
                  <span className="db-avatar-name" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {currentUser?.name?.split(' ')[0]}
                  </span>
                  <span className="db-avatar-chev"><ChevD /></span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="db-dropdown-backdrop" onClick={() => setShowUserMenu(false)} />
                    <div className="db-user-dropdown">
                      <div className="db-dropdown-info">
                        <div className="db-dd-name">{currentUser?.name}</div>
                        <div className="db-dd-email">
                          {currentUser?.username ? `@${currentUser.username} · ` : ''}{currentUser?.email}
                        </div>
                      </div>
                      <hr className="db-dd-divider" />
                      <button className="db-dd-item" onClick={() => { setCurrentView('profile'); setShowUserMenu(false); }}>
                        <UserIcon /> Profil
                      </button>
                      <button className="db-dd-item" onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }}>
                        <SettingsIcon /> Pengaturan
                      </button>
                      <button className="db-dd-item" onClick={() => { handleExportAllICS(); setShowUserMenu(false); }}>
                        <DownloadIcon /> Ekspor Kalender (.ics)
                      </button>
                      <hr className="db-dd-divider" />
                      <button className="db-dd-item logout" onClick={handleLogout}>
                        <LogoutIcon /> Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* ── BODY (Sidebar + Main View + AI Panel) ── */}
      <div className="db-body">
        {/* Backdrop for mobile drawer */}
        {isDrawerOpen && (
          <div
            className="db-drawer-backdrop"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar (drawer on mobile/tablet, fixed column on desktop) */}
        <aside
          className={`db-sidebar ${isDrawerOpen ? 'drawer-open' : ''}`}
          role="dialog"
          aria-label="Navigasi kalender"
        >
          {/* Drawer Header (mobile only) */}
          <div className="db-drawer-header">
            <div className="db-logo">
              <div className="db-logo-icon"><CalIcon /></div>
              <span className="db-logo-name">daylight</span>
              <span className="db-logo-plus">+</span>
            </div>
            <button
              type="button"
              className="db-drawer-close-btn"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Tutup navigasi"
            >
              ✕
            </button>
          </div>

          <button
            className="db-new-event-btn"
            onClick={() => {
              handleOpenNewEvent({ day: selected.getDay(), date: selected, start: 9, end: 10 });
              setIsDrawerOpen(false);
            }}
          >
            <PlusIcon /> Acara Baru
          </button>

          {/* Sidenav Items (View Switcher) */}
          <div className="db-sidenav">
            <button
              className={`db-sidenav-item ${currentView === 'calendar' ? 'active' : ''}`}
              onClick={() => { setCurrentView('calendar'); setIsDrawerOpen(false); }}
            >
              <CalIcon /> Kalender saya
            </button>
            <button
              className={`db-sidenav-item ${currentView === 'summary' ? 'active' : ''}`}
              onClick={() => { setCurrentView('summary'); setIsDrawerOpen(false); }}
            >
              <GridIcon /> Ringkasan
            </button>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar
            selected={selected}
            onSelect={(dt) => { selectDate(dt); setCurrentView('calendar'); setIsDrawerOpen(false); }}
            calFilter={calFilter}
            events={events}
          />

          {/* Kalender Filter */}
          <div className="db-cal-list">
            <div className="db-cal-list-title">KALENDER SAYA</div>
            <label className="db-cal-item">
              <input
                type="checkbox"
                checked={calFilter.kerja}
                onChange={() => toggleCalFilter('kerja')}
                style={{ accentColor: '#2563eb' }}
              />
              <span>Kerja</span>
            </label>
            <label className="db-cal-item">
              <input
                type="checkbox"
                checked={calFilter.pribadi}
                onChange={() => toggleCalFilter('pribadi')}
                style={{ accentColor: '#7c3aed' }}
              />
              <span>Pribadi</span>
            </label>
          </div>

          {/* Export .ics in sidebar */}
          <div className="db-sidebar-export-wrap">
            <button
              className="db-sidebar-export-btn"
              onClick={handleExportAllICS}
              title="Unduh seluruh jadwal aktif ke file iCalendar (.ics)"
            >
              <DownloadIcon /> Ekspor ke .ics
            </button>
            <span className="db-export-subtext">Format standar RFC 5545</span>
          </div>

          {/* User profile & Logout button in drawer (especially handy on mobile) */}
          <div className="db-drawer-user-section">
            <div className="db-drawer-user-card">
              <div className="db-avatar-circle" style={{ width: 34, height: 34, fontSize: 13 }}>
                {currentUser?.avatar}
              </div>
              <div className="db-drawer-user-meta">
                <div className="db-drawer-user-name">{currentUser?.name || 'Pengguna'}</div>
                <div className="db-drawer-user-email">
                  {currentUser?.username ? `@${currentUser.username} · ` : ''}{currentUser?.email || ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="db-drawer-logout-btn"
              onClick={handleLogout}
              title="Keluar dari akun"
            >
              <LogoutIcon /> Keluar Akun
            </button>
          </div>
        </aside>

        {/* ── VIEWS ── */}
        {currentView === 'summary' && (
          <SummaryView
            events={events}
            today={today}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            onOpenNewModal={() => handleOpenNewEvent({ day: selected.getDay(), date: selected, start: 9, end: 10 })}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView currentUser={currentUser} onLogout={handleLogout} />
        )}

        {currentView === 'settings' && (
          <SettingsView currentUser={currentUser} onLogout={handleLogout} />
        )}

        {currentView === 'calendar' && (
          <main className="db-main">
            {/* Calendar Header */}
            <div className="db-cal-header">
              <div className="db-cal-header-left">
                <div className="db-cal-title">{calHeaderLabel}</div>
                <div className="db-cal-sub">
                  {calMode === 'week' ? `Pekan aktif · 7 hari` : calMode === 'day' ? 'Tampilan harian' : 'Tampilan bulanan'}
                </div>
              </div>

              <div className="db-cal-header-right">
                <button className="db-today-btn" onClick={goToday}>Hari Ini</button>
                <div className="db-cal-nav-group">
                  <button className="db-week-nav" onClick={handleNavPrev} title="Sebelumnya"><ChevL /></button>
                  <button className="db-week-nav" onClick={handleNavNext} title="Berikutnya"><ChevR /></button>
                  <span className="db-week-label">{weekLabel}</span>
                </div>

                <div className="db-cal-view-modes">
                  <button
                    className={`db-view-mode-btn ${calMode === 'day' ? 'active' : ''}`}
                    onClick={() => setCalMode('day')}
                  >
                    Hari
                  </button>
                  <button
                    className={`db-view-mode-btn ${calMode === 'week' ? 'active' : ''}`}
                    onClick={() => setCalMode('week')}
                  >
                    Minggu
                  </button>
                  <button
                    className={`db-view-mode-btn ${calMode === 'month' ? 'active' : ''}`}
                    onClick={() => setCalMode('month')}
                  >
                    Bulan
                  </button>
                </div>
              </div>
            </div>

            {/* WEEK VIEW */}
            {calMode === 'week' && (
              <div className="db-cal-grid-wrap">
                <div className="db-cal-day-headers">
                  <div className="db-time-gutter" />
                  {weekDates.map((d, i) => {
                    const isToday = isSameDay(d, currentTime);
                    const isSel   = isSameDay(d, selected);
                    return (
                      <div
                        key={i}
                        className={`db-day-header ${isToday ? 'today' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { selectDate(d); setCalMode('day'); }}
                        title="Klik untuk beralih ke Tampilan Hari"
                      >
                        <span className="db-day-name">{DAYS_ID[i]}</span>
                        <span className={`db-day-num ${isToday ? 'today-circle' : ''} ${isSel && !isToday ? 'selected-circle' : ''}`}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="db-cal-scroll">
                  <div className="db-cal-inner" style={{ height: `${HOURS.length * PX_PER_HOUR}px` }}>
                    {/* Hour Rows */}
                    {HOURS.map(h => (
                      <div
                        key={h}
                        className="db-hour-row"
                        style={{ top: `${(h - START_HOUR) * PX_PER_HOUR}px` }}
                      >
                        <div className="db-hour-label">{h}:00</div>
                        <div className="db-hour-line" />
                      </div>
                    ))}

                    {/* Day Columns */}
                    <div className="db-day-cols" style={{ left: 56 }}>
                      {weekDates.map((colDate, colIdx) => {
                        const isTodayCol = isSameDay(colDate, currentTime);
                        return (
                          <div key={colIdx} className={`db-day-col ${isTodayCol ? 'today-col' : ''}`}>
                            {renderDropSlots(colIdx)}

                            {events
                              .filter(e => calFilter[e.type] && (e.date ? isSameDay(new Date(e.date), colDate) : e.day === colIdx))
                              .map(ev => {
                                const top    = (ev.start - START_HOUR) * PX_PER_HOUR;
                                const height = (ev.end - ev.start) * PX_PER_HOUR - 2;
                                const isMatched = isSearching && matchedEventIds.has(ev.id);
                                const isDimmed  = isSearching && !matchedEventIds.has(ev.id);
                                return (
                                  <CalEvent
                                    key={ev.id}
                                    event={ev}
                                    top={top}
                                    height={height}
                                    isMatched={isMatched}
                                    isDimmed={isDimmed}
                                    onClick={() => setSelectedEvent(ev)}
                                  />
                                );
                              })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Current Time Marker */}
                    {isCurrentTimeVisible && (
                      <div className="db-current-time-marker" style={{ top: `${currentTimeTop}px`, left: 56 }}>
                        <div className="db-current-time-dot" />
                        <div className="db-current-time-line" />
                        <div className="db-current-time-badge">
                          <span className="db-time-badge-dot">●</span>
                          {formattedCurrentTime}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DAY VIEW */}
            {calMode === 'day' && (
              <div className="db-day-view-wrap">
                <div className="db-single-day-header">
                  <div className="db-single-day-info">
                    <div className="db-single-day-text">
                      <span className="db-day-name-large">
                        {DAYS_FULL[selected.getDay()]}, {selected.getDate()} {MONTHS_ID[selected.getMonth()]} {selected.getFullYear()}
                      </span>
                      <span className="db-day-date-sub">Jadwal agenda harian</span>
                    </div>
                    <span className="db-single-day-badge">
                      {events.filter(e => calFilter[e.type] && (e.date ? isSameDay(new Date(e.date), selected) : e.day === selected.getDay())).length} Acara Terjadwal
                    </span>
                  </div>
                </div>

                <div className="db-cal-scroll">
                  <div className="db-cal-inner" style={{ height: `${HOURS.length * PX_PER_HOUR}px` }}>
                    {HOURS.map(h => (
                      <div
                        key={h}
                        className="db-hour-row"
                        style={{ top: `${(h - START_HOUR) * PX_PER_HOUR}px` }}
                      >
                        <div className="db-hour-label">{h}:00</div>
                        <div className="db-hour-line" />
                      </div>
                    ))}

                    <div className="db-day-cols" style={{ left: 56 }}>
                      <div className="db-single-day-col">
                        {renderDropSlots(selected.getDay())}

                        {events
                          .filter(e => calFilter[e.type] && (e.date ? isSameDay(new Date(e.date), selected) : e.day === selected.getDay()))
                          .map(ev => {
                            const top    = (ev.start - START_HOUR) * PX_PER_HOUR;
                            const height = (ev.end - ev.start) * PX_PER_HOUR - 2;
                            const isMatched = isSearching && matchedEventIds.has(ev.id);
                            const isDimmed  = isSearching && !matchedEventIds.has(ev.id);
                            return (
                              <CalEvent
                                key={ev.id}
                                event={ev}
                                top={top}
                                height={height}
                                isMatched={isMatched}
                                isDimmed={isDimmed}
                                onClick={() => setSelectedEvent(ev)}
                              />
                            );
                          })}
                      </div>
                    </div>

                    {isSameDay(selected, currentTime) && isCurrentTimeVisible && (
                      <div className="db-current-time-marker" style={{ top: `${currentTimeTop}px`, left: 56 }}>
                        <div className="db-current-time-dot" />
                        <div className="db-current-time-line" />
                        <div className="db-current-time-badge">
                          <span className="db-time-badge-dot">●</span>
                          {formattedCurrentTime}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MONTH VIEW */}
            {calMode === 'month' && (
              <div className="db-month-grid-wrap">
                <div className="db-month-weekdays">
                  {DAYS_ID.map((d, i) => <div key={i} className="db-month-weekday">{d}</div>)}
                </div>
                <div className="db-month-matrix">
                  {monthDays.map((cell, idx) => {
                    const isTodayCell    = isSameDay(cell.date, currentTime);
                    const isSelectedCell = isSameDay(cell.date, selected);
                    const cellDay        = cell.date.getDay();
                    const cellEvents     = events.filter(e => calFilter[e.type] && (e.date ? isSameDay(new Date(e.date), cell.date) : e.day === cellDay));
                    return (
                      <div
                        key={idx}
                        className={`db-month-cell ${!cell.isCurrentMonth ? 'not-current-month' : ''} ${isTodayCell ? 'is-today' : ''} ${isSelectedCell ? 'is-selected' : ''}`}
                        onClick={() => { selectDate(cell.date); setCalMode('day'); }}
                        title={`Klik untuk melihat jadwal harian ${DAYS_FULL[cellDay]}, ${cell.dayNumber} ${MONTHS_ID[cell.date.getMonth()]}`}
                      >
                        <div className="db-month-cell-header">
                          <span className="db-month-date-num">{cell.dayNumber}</span>
                          <button
                            type="button"
                            className="db-month-add-quick"
                            onClick={(e) => { e.stopPropagation(); selectDate(cell.date); handleOpenNewEvent({ day: cellDay, date: cell.date, start: 9, end: 10 }); }}
                            title="Tambah acara di tanggal ini"
                          >
                            + Acara
                          </button>
                        </div>
                        <div className="db-month-events-list">
                          {cellEvents.slice(0, 3).map(ev => {
                            const c = EVENT_COLORS[ev.color] || EVENT_COLORS.blue;
                            const isMatched = isSearching && matchedEventIds.has(ev.id);
                            const isDimmed  = isSearching && !matchedEventIds.has(ev.id);
                            return (
                              <div
                                key={ev.id}
                                className={`db-month-event-pill ${isMatched ? 'search-matched' : ''} ${isDimmed ? 'search-dimmed' : ''}`}
                                style={{ background: ev.completed ? '#f1f5f9' : c.bg, color: ev.completed ? '#64748b' : c.text, borderLeft: `2.5px solid ${ev.completed ? '#94a3b8' : c.border}` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                title={`${ev.title} · ${formatTime(ev.start)} - ${formatTime(ev.end)}`}
                              >
                                <span className="db-month-event-time">{formatTime(ev.start)}</span>
                                <span className="db-month-event-title" style={{ textDecoration: ev.completed ? 'line-through' : 'none' }}>{isMatched && '✨ '}{ev.title}</span>
                              </div>
                            );
                          })}
                          {cellEvents.length > 3 && (
                            <span className="db-month-more-btn">+{cellEvents.length - 3} lainnya</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        )}

        {/* Floating Action Button for AI Assistant (< 1024px) */}
        <button
          type="button"
          className="db-ai-fab"
          onClick={() => setIsAIOpen(true)}
          aria-label="Buka Asisten Jadwal AI"
          aria-expanded={isAIOpen}
        >
          <span className="db-ai-fab-icon">✨</span>
          <span className="db-ai-fab-text">Asisten</span>
        </button>

        {/* Backdrop for AI Bottom Sheet on mobile */}
        {isAIOpen && (
          <div
            className="db-ai-backdrop"
            onClick={() => setIsAIOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* AI Assistant Panel */}
        <AIAssistant
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onAddEvent={(ev) => {
            handleAddEvent(ev);
            setIsAIOpen(false);
          }}
        />
      </div>

      {/* ── FLOATING UNDO TOAST ── */}
      {lastDeletedEvent && (
        <div className="db-undo-toast">
          <span>Acara <strong>"{lastDeletedEvent.title}"</strong> telah dihapus.</span>
          <button className="db-undo-btn" onClick={handleUndoDelete}>Urungkan (Undo)</button>
          <button className="db-undo-close" onClick={() => handleUndoDelete(null)}>✕</button>
        </div>
      )}

      {/* ── MODALS ── */}
      {isModalOpen && (
        <NewEventModal
          onClose={handleCloseModal}
          onAdd={handleAddEvent}
          initialData={modalInitialData}
        />
      )}

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          weekDates={weekDates}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onSave={handleUpdateEvent}
          onToggleComplete={handleToggleComplete}
          onExportICS={handleExportSingleICS}
        />
      )}
    </div>
  );
}
