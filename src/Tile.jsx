import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

function buildSrc(videoId) {
  const params =
    'enablejsapi=1&autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&controls=0&disablekb=1&iv_load_policy=3&fs=0';
  if (videoId.startsWith('live_stream')) {
    return `https://www.youtube.com/embed/${videoId}&${params}`;
  }
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

export default function Tile({
  channel,
  index,
  hidden,
  audio,
  spotlight,
  apiReady,
  onPlayerReady,
  onClick,
  onMute,
}) {
  const tileRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onFs = () => setIsFs(document.fullscreenElement === tileRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFullscreen = () => {
    const el = tileRef.current;
    if (!el) return;
    if (document.fullscreenElement === el) {
      document.exitFullscreen?.();
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    if (!apiReady || !iframeRef.current || playerRef.current) return;
    const player = new window.YT.Player(iframeRef.current, {
      events: {
        onReady: (e) => {
          e.target.mute();
          playerRef.current = e.target;
          onPlayerReady(index, e.target);
        },
        onStateChange: (e) => {
          const YT = window.YT;
          if (!YT) return;
          if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            try {
              e.target.playVideo();
              e.target.seekTo(e.target.getDuration?.() ?? 0, true);
            } catch (_) {}
          }
        },
      },
    });
    return () => {
      try {
        player.destroy?.();
      } catch (_) {}
      playerRef.current = null;
    };
  }, [apiReady, index, onPlayerReady]);

  const cls = [
    'tile',
    hidden ? 'hidden' : '',
    spotlight ? 'tile-spotlight' : 'tile-film',
    audio ? 'tile-audio' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    e.preventDefault();
    onClick?.();
  };

  return (
    <div
      ref={tileRef}
      className={cls}
      style={{ '--vt-name': `tile-${index}` }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick(e);
      }}
      aria-label={`${channel.name}${audio ? ' (audio)' : ''}`}
    >
      <iframe
        ref={iframeRef}
        id={`player-${index}`}
        src={buildSrc(channel.id)}
        title={channel.name}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      <div className="tile-shield" aria-hidden="true" />
      <div className="tile-scrim" />

      <div className="tile-top">
        <div className="live-badge">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
        <div className="tile-top-right">
          {audio ? (
            <button
              type="button"
              className="audio-chip"
              title="Mute"
              onClick={(e) => {
                e.stopPropagation();
                onMute?.();
              }}
            >
              <Icon name="speaker" size={11} />
              {spotlight ? <span>Audio</span> : null}
            </button>
          ) : null}
          {spotlight ? (
            <button
              type="button"
              className="fs-btn"
              title={isFs ? 'Exit fullscreen' : 'Fullscreen'}
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
            >
              <Icon name={isFs ? 'collapse' : 'expand'} size={12} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="tile-bottom">
        <div className="channel-name">{channel.name}</div>
        {!audio && spotlight ? (
          <div className="hover-hint">
            <Icon name="speaker" size={11} />
            <span>Listen</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
