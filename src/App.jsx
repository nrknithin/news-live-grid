import { useCallback, useEffect, useRef, useState } from 'react';
import { CHANNELS } from './channels.js';
import { useYouTubeApi } from './useYouTubeApi.js';
import Tile from './Tile.jsx';
import TopBar from './TopBar.jsx';
import ChannelMenu from './ChannelMenu.jsx';
import Icon from './Icon.jsx';

function computeGrid(n) {
  if (n <= 1) return { cols: 1, rows: 1, span: 1 };
  if (n === 2) return { cols: 3, rows: 2, span: 2 };
  if (n <= 4) return { cols: 4, rows: 2, span: 2 };
  if (n <= 6) return { cols: 3, rows: 3, span: 2 };
  return { cols: 4, rows: 3, span: 2 };
}

export default function App() {
  const apiReady = useYouTubeApi();
  const playersRef = useRef(new Map());
  const [activeIndex, setActiveIndex] = useState(() => {
    const id = localStorage.getItem('lg.activeId');
    if (id === '') return -1;
    const i = CHANNELS.findIndex((c) => c.id === id);
    return i >= 0 ? i : 0;
  });
  const [spotlightChannelIndex, setSpotlightChannelIndex] = useState(() => {
    const id = localStorage.getItem('lg.spotlightId');
    const i = CHANNELS.findIndex((c) => c.id === id);
    if (i >= 0) return i;
    // Fallback to active channel, then channel 0
    const aId = localStorage.getItem('lg.activeId');
    const ai = CHANNELS.findIndex((c) => c.id === aId);
    return ai >= 0 ? ai : 0;
  });
  const [hidden, setHidden] = useState(() => {
    try {
      const raw = localStorage.getItem('lg.hiddenIds');
      const ids = raw ? JSON.parse(raw) : [];
      const set = new Set();
      if (Array.isArray(ids)) {
        ids.forEach((id) => {
          const i = CHANNELS.findIndex((c) => c.id === id);
          if (i >= 0) set.add(i);
        });
      }
      return set;
    } catch (_) {
      return new Set();
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const id = activeIndex === -1 ? '' : (CHANNELS[activeIndex]?.id ?? '');
    localStorage.setItem('lg.activeId', id);
  }, [activeIndex]);
  useEffect(() => {
    const id = CHANNELS[spotlightChannelIndex]?.id ?? '';
    localStorage.setItem('lg.spotlightId', id);
  }, [spotlightChannelIndex]);
  useEffect(() => {
    const ids = [...hidden].map((i) => CHANNELS[i]?.id).filter(Boolean);
    localStorage.setItem('lg.hiddenIds', JSON.stringify(ids));
  }, [hidden]);

  const visibleCount = CHANNELS.length - hidden.size;
  const focusedChannel =
    activeIndex !== -1 && !hidden.has(activeIndex) ? CHANNELS[activeIndex] : null;

  // Spotlight is independent of audio focus. Use the persisted spotlight
  // unless it's hidden, in which case fall back to first visible.
  let spotlightIndex = -1;
  if (!hidden.has(spotlightChannelIndex)) {
    spotlightIndex = spotlightChannelIndex;
  } else {
    for (let i = 0; i < CHANNELS.length; i++) {
      if (!hidden.has(i)) {
        spotlightIndex = i;
        break;
      }
    }
  }

  const spotlightIndexRef = useRef(spotlightIndex);
  spotlightIndexRef.current = spotlightIndex;

  const handlePlayerReady = useCallback((index, player) => {
    playersRef.current.set(index, player);
    try {
      player.setPlaybackQuality?.(
        index === spotlightIndexRef.current ? 'hd1080' : 'small'
      );
    } catch (_) {}
  }, []);

  const setAudioFocus = useCallback((index) => {
    setActiveIndex(index);
    playersRef.current.forEach((player, i) => {
      if (!player?.mute) return;
      try {
        if (i === index) {
          player.unMute();
          player.setVolume(100);
        } else {
          player.mute();
        }
      } catch (_) {}
    });
  }, []);

  const focus = useCallback(
    (i) => {
      if (hidden.has(i)) return;
      setSpotlightChannelIndex(i);
      setAudioFocus(i);
    },
    [hidden, setAudioFocus]
  );

  const muteAll = useCallback(() => setAudioFocus(-1), [setAudioFocus]);

  const toggleVisibility = useCallback((i) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const showAll = useCallback(() => setHidden(new Set()), []);
  const hideAll = useCallback(() => {
    setHidden(new Set(CHANNELS.map((_, i) => i)));
  }, []);

  // If active video gets hidden, mute all. Pause hidden, play visible.
  useEffect(() => {
    if (activeIndex !== -1 && hidden.has(activeIndex)) {
      setAudioFocus(-1);
    }
    playersRef.current.forEach((player, i) => {
      if (!player?.playVideo) return;
      try {
        if (hidden.has(i)) player.pauseVideo();
        else player.playVideo();
      } catch (_) {}
    });
  }, [hidden, activeIndex, setAudioFocus]);

  // Quality hint: spotlight gets HD, filmstrip gets small. YouTube treats
  // setPlaybackQuality as a hint and may downgrade if bandwidth is low.
  useEffect(() => {
    playersRef.current.forEach((player, i) => {
      if (!player?.setPlaybackQuality) return;
      try {
        player.setPlaybackQuality(i === spotlightIndex ? 'hd1080' : 'small');
      } catch (_) {}
    });
  }, [spotlightIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key;
      if (/^[1-9]$/.test(k)) {
        const idx = parseInt(k, 10) - 1;
        if (idx < CHANNELS.length && !hidden.has(idx)) {
          e.preventDefault();
          setAudioFocus(idx);
        }
      } else if (k === '0' || k.toLowerCase() === 'm') {
        e.preventDefault();
        setAudioFocus(-1);
      } else if (k.toLowerCase() === 'c') {
        e.preventDefault();
        setMenuOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hidden, setAudioFocus]);

  // Restore audio state once API is ready. Browser autoplay policy may keep
  // streams muted until the user interacts — focus state persists either way.
  useEffect(() => {
    if (!apiReady) return;
    const t = setTimeout(() => setAudioFocus(activeIndex), 1500);
    return () => clearTimeout(t);
    // Run only once after API becomes ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady]);

  return (
    <>
      <TopBar
        focusedChannel={focusedChannel}
        visibleCount={visibleCount}
        totalCount={CHANNELS.length}
        onMuteAll={muteAll}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <main className="main">
        {visibleCount === 0 ? (
          <div className="empty">
            <div className="empty-card">
              <div className="empty-icon">
                <Icon name="tv" size={28} />
              </div>
              <div className="empty-title">No streams visible</div>
              <div className="empty-hint">Open the channel menu to bring some back.</div>
            </div>
          </div>
        ) : (
          <div
            className="stage"
            style={{
              '--cols': computeGrid(visibleCount).cols,
              '--rows': computeGrid(visibleCount).rows,
              '--span': computeGrid(visibleCount).span,
            }}
          >
            {CHANNELS.map((ch, i) => (
              <Tile
                key={ch.id}
                channel={ch}
                index={i}
                hidden={hidden.has(i)}
                audio={i === activeIndex}
                spotlight={i === spotlightIndex}
                apiReady={apiReady}
                onPlayerReady={handlePlayerReady}
                onClick={() => {
                  if (i === spotlightIndex) {
                    // Toggle audio on the existing spotlight.
                    if (i === activeIndex) muteAll();
                    else setAudioFocus(i);
                  } else {
                    focus(i);
                  }
                }}
                onMute={muteAll}
              />
            ))}
          </div>
        )}
      </main>
      <ChannelMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        channels={CHANNELS}
        focusedIndex={activeIndex}
        hidden={hidden}
        onFocus={(i) => {
          focus(i);
          setMenuOpen(false);
        }}
        onMuteAll={muteAll}
        onToggleVisible={toggleVisibility}
        onShowAll={showAll}
        onHideAll={hideAll}
      />
    </>
  );
}
