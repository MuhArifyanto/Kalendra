import { useState, useRef, useEffect } from 'react';
import {
  DotsIcon, ClockIcon, PlusIcon, MicIcon, SendIcon,
  HelpIcon, CheckIcon2, AlertCircleIcon, XIcon,
} from '../../icons';
import { useToast } from '../../context/ToastContext';
import { INITIAL_CHAT_HISTORY } from '../../data/demoData';

export default function AIAssistant({ onAddEvent, isOpen = false, onClose }) {
  const { addToast } = useToast();
  const [messages,      setMessages]      = useState(INITIAL_CHAT_HISTORY);
  const [input,         setInput]         = useState('');
  const [cardStates,    setCardStates]    = useState({ 2: null });
  const [showDemoMenu,  setShowDemoMenu]  = useState(false);
  const [micError,      setMicError]      = useState(false);
  const [isTyping,      setIsTyping]      = useState(false);
  const messagesEndRef                    = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userId = Date.now();
    setMessages(prev => [...prev, { id: userId, role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiId  = Date.now() + 1;
      const newMsg = {
        id: aiId, role: 'ai',
        text: 'Tentu, saya telah menemukan waktu yang cocok. Bagaimana dengan ini?',
        card: {
          icon: '✨',
          title: text.substring(0, 25) || 'Jadwal Baru',
          date:  'Jumat, 30 Oktober 2026',
          time:  '13:00 – 14:00 WIB',
          eventData: {
            title:    text.substring(0, 25) || 'Jadwal Baru',
            subtitle: 'Otomatis via AI',
            start: 13, end: 14, day: 5, color: 'purple', type: 'kerja',
          },
        },
      };
      setMessages(prev => [...prev, newMsg]);
      setCardStates(prev => ({ ...prev, [aiId]: null }));
      setIsTyping(false);
    }, 1500);
  };

  const handleCard = (msgId, action, eventData) => {
    setCardStates(prev => ({ ...prev, [msgId]: action }));
    if (action === 'yes' && eventData) {
      if (onAddEvent) onAddEvent(eventData);
    } else if (action === 'cancel') {
      addToast('Pembuatan jadwal dibatalkan.', 'info');
    }
  };

  const quickChips = ['Cari waktu luang', 'Tambah rapat', 'Ringkas minggu ini'];

  return (
    <aside className={`ai-panel ${isOpen ? 'open' : ''}`} role="region" aria-label="Asisten Jadwal AI">
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <div className="ai-avatar">✨</div>
          <div style={{ flex: 1 }}>
            <div className="ai-panel-title">Asisten Jadwal AI</div>
            <div className="ai-panel-sub">Atur jadwal lewat chat atau suara</div>
          </div>
          {onClose && (
            <button
              type="button"
              className="ai-mobile-close-btn"
              onClick={onClose}
              aria-label="Tutup panel asisten"
              title="Tutup Asisten"
            >
              <XIcon />
            </button>
          )}
          <div className="ai-menu-wrap">
            <button className="ai-icon-btn" onClick={() => setShowDemoMenu(v => !v)}>
              <DotsIcon />
            </button>
            {showDemoMenu && (
              <div className="ai-dropdown-menu">
                <button className="ai-dropdown-header" style={{border:'none',background:'none',width:'100%',textAlign:'left',cursor:'default'}}>PRATINJAU STATUS DEMO</button>
                <button className="ai-dropdown-item" onClick={() => { addToast('Menjalankan alur status suara...', 'success'); setShowDemoMenu(false); }}>Alur status suara</button>
                <button className="ai-dropdown-item" onClick={() => { setMicError(true); setShowDemoMenu(false); }}>Izin mikrofon ditolak</button>
                <button className="ai-dropdown-item" onClick={() => { addToast('Gagal sinkronisasi dengan Google Calendar', 'error'); setShowDemoMenu(false); }}>Sinkronisasi gagal</button>
                <button className="ai-dropdown-item" onClick={() => { addToast('Contoh jadwal bentrok ditampilkan', 'success'); setShowDemoMenu(false); }}>Contoh jadwal bentrok</button>
              </div>
            )}
          </div>
        </div>
        <div className="ai-panel-actions">
          <button className="ai-icon-btn"><ClockIcon /></button>
          <span className="ai-chat-label">Riwayat chat</span>
          <button className="ai-chat-new-btn"><PlusIcon /> Chat baru</button>
        </div>
      </div>

      <div className="ai-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`ai-msg ai-msg-${msg.role}`}>
            {msg.role === 'ai' && <div className="ai-msg-avatar">✨</div>}
            <div className="ai-msg-body">
              <p className="ai-msg-text">{msg.text}</p>
              {msg.card && (
                <div className={`ai-event-card ${msg.card.isWarning ? 'warning' : ''}`}>
                  <div className="ai-event-card-row">
                    <span className="ai-event-icon">{msg.card.icon}</span>
                    <div>
                      <div className="ai-event-title">{msg.card.title}</div>
                      <div className="ai-event-date">{msg.card.date}</div>
                      <div className="ai-event-time">{msg.card.time}</div>
                    </div>
                  </div>

                  {msg.card.options && (
                    <div className="ai-card-options">
                      <div className="ai-card-options-label">Pilih waktu yang tersedia:</div>
                      <div className="ai-card-pills">
                        {msg.card.options.map(opt => (
                          <button key={opt} className="ai-card-pill">{opt}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(cardStates[msg.id] === null || cardStates[msg.id] === undefined) ? (
                    <div className="ai-card-actions">
                      <button className="ai-card-btn yes" onClick={() => handleCard(msg.id, 'yes', msg.card.eventData)}>
                        <CheckIcon2 /> Ya
                      </button>
                      <button className="ai-card-btn edit" onClick={() => handleCard(msg.id, 'edit', null)}>
                        ✏ Ubah
                      </button>
                      <button className="ai-card-btn cancel" onClick={() => handleCard(msg.id, 'cancel', null)}>
                        ✕ Batal
                      </button>
                    </div>
                  ) : (
                    <div className={`ai-card-status status-${cardStates[msg.id]}`}>
                      {cardStates[msg.id] === 'yes'    && '✓ Dijadwalkan!'}
                      {cardStates[msg.id] === 'edit'   && '✏ Mode ubah...'}
                      {cardStates[msg.id] === 'cancel' && '✕ Dibatalkan'}
                    </div>
                  )}
                </div>
              )}
            </div>
            {msg.role === 'user' && <div className="ai-msg-user-dot" />}
          </div>
        ))}

        {isTyping && (
          <div className="ai-msg ai ai-msg-ai">
            <div className="ai-msg-avatar">✨</div>
            <div className="ai-msg-body">
              <div className="ai-typing-indicator">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-quick-chips">
        {quickChips.map((c) => (
          <button key={c} className="ai-chip" onClick={() => setInput(c)}>{c}</button>
        ))}
      </div>

      {micError && (
        <div className="ai-error-box">
          <button className="ai-error-close" onClick={() => setMicError(false)}><XIcon /></button>
          <div className="ai-error-text">
            <span className="ai-error-icon"><AlertCircleIcon /></span>
            <span>Mikrofon tidak diizinkan. Aktifkan izin di pengaturan browser, lalu coba lagi.</span>
          </div>
          <button className="ai-error-btn" onClick={() => setMicError(false)}>Coba lagi</button>
        </div>
      )}

      <div className="ai-input-row">
        <input
          className="ai-input"
          placeholder="Tulis pesan..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="ai-input-btn mic"><MicIcon /></button>
        <button className="ai-input-btn send" onClick={handleSend}><SendIcon /></button>
      </div>
      <div className="ai-help-row">
        <HelpIcon /> <span>Butuh bantuan?</span>
      </div>
    </aside>
  );
}
