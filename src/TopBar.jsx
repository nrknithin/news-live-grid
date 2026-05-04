import Icon from './Icon.jsx';

export default function TopBar({
  focusedChannel,
  visibleCount,
  totalCount,
  onMuteAll,
  onOpenMenu,
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="grid" size={14} />
        </div>
        <div className="brand-text">
          <span className="brand-name">
            Live<em>Grid</em>
          </span>
          <span className="brand-sub">Kerala 2026 · Results</span>
        </div>
      </div>

      <div className="topbar-center">
        <div className="now-pill">
          {focusedChannel ? (
            <>
              <span className="now-dot" />
              <span className="now-label">Now playing</span>
              <span className="now-name">{focusedChannel.name}</span>
            </>
          ) : (
            <>
              <Icon name="speaker-off" size={13} />
              <span className="now-label">All muted</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="btn-ghost"
          onClick={onMuteAll}
          disabled={!focusedChannel}
          title="Mute all"
        >
          <Icon name="speaker-off" size={14} />
          <span className="btn-label-desktop">Mute all</span>
        </button>
        <button className="btn-solid" onClick={onOpenMenu} title="Channels">
          <Icon name="menu" size={16} />
          <span className="btn-label-desktop">Channels</span>
          <span className="count-badge">
            {visibleCount}/{totalCount}
          </span>
        </button>
      </div>
    </header>
  );
}
