import { Link } from 'react-router-dom';
import { CalendarIcon } from '../icons';

/**
 * Topbar — hanya digunakan di halaman Guest (Login & Register).
 * Dashboard memiliki header/topbar-nya sendiri secara inline.
 */
export default function Topbar() {
  return (
    <nav className="topbar">
      <Link to="/" className="topbar-logo">
        <div className="topbar-icon">
          <CalendarIcon size={20} />
        </div>
        <span className="topbar-name">daylight</span>
        <span className="topbar-plus">+</span>
      </Link>
    </nav>
  );
}
