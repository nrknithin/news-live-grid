import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function ChannelMenu({
  open,
  onClose,
  channels,
  focusedIndex,
  hidden,
  onFocus,
  onMuteAll,
  onToggleVisible,
  onShowAll,
  onHideAll,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const visibleCount = channels.length - hidden.size;

  return (
    <>
      <div
        className="menu-scrim"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />
      <aside
        className="menu-drawer"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
        aria-hidden={!open}
      >
        <header className="menu-head">
          <div className="menu-head-left">
            <h2 className="menu-title">Channels</h2>
            <p className="menu-subtitle">Tap to listen · toggle visibility</p>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="menu-mute-wrap">
          <button
            className="mute-all-btn"
            onClick={onMuteAll}
            disabled={focusedIndex === -1}
          >
            <Icon name="speaker-off" size={14} />
            <span>Mute all channels</span>
          </button>
        </div>

        <div className="menu-section">
          <div className="section-label">
            <span>All channels</span>
            <span className="section-meta">
              {visibleCount} of {channels.length} shown
            </span>
          </div>
          <div className="row-list">
            {channels.map((c, i) => {
              const focused = focusedIndex === i;
              const isHidden = hidden.has(i);
              return (
                <div
                  key={c.id}
                  className={`row${focused ? ' row-focused' : ''}${isHidden ? ' row-hidden' : ''}`}
                >
                  <button
                    className="row-main"
                    onClick={() => !isHidden && onFocus(i)}
                    disabled={isHidden}
                  >
                    <span className={`row-icon${focused ? ' row-icon-focused' : ''}`}>
                      <Icon name={focused ? 'speaker' : 'speaker-off'} size={14} />
                    </span>
                    <span className="row-text">
                      <span
                        className={`row-name${focused ? ' row-name-focused' : ''}${isHidden ? ' row-name-hidden' : ''}`}
                      >
                        {c.name}
                      </span>
                      <span className="row-sub">
                        {focused
                          ? 'Playing audio'
                          : isHidden
                            ? 'Hidden from grid'
                            : `Press ${i + 1}`}
                      </span>
                    </span>
                  </button>
                  <button
                    className="eye-btn"
                    onClick={() => onToggleVisible(i)}
                    title={isHidden ? 'Show in grid' : 'Hide from grid'}
                  >
                    <Icon name={isHidden ? 'eye-off' : 'eye'} size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="menu-footer">
          <button className="foot-btn" onClick={onShowAll}>
            <Icon name="eye" size={14} />
            <span>Show all</span>
          </button>
          <button className="foot-btn" onClick={onHideAll}>
            <Icon name="eye-off" size={14} />
            <span>Hide all</span>
          </button>
        </div>
      </aside>
    </>
  );
}
