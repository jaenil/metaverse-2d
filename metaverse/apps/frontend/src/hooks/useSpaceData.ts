import { useState, useEffect } from 'react';
import { getSpace } from '../api';
import type { SpaceElement } from '../types';

export function useSpaceData(
  spaceId: string | undefined, 
  userId: string | undefined, 
  myPos: { x: number, y: number } | null, 
  setElements: (elements: SpaceElement[]) => void
) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [spaceLoading, setSpaceLoading] = useState(true);
  const [spaceError, setSpaceError] = useState('');
  const [worldReady, setWorldReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Fetch space details (dimensions + elements)
  useEffect(() => {
    if (!spaceId) return;
    setSpaceLoading(true);
    setWorldReady(false);
    setLoadingProgress(0);
    getSpace(spaceId).then((res) => {
      if (res.data.space) {
        setDimensions({
          width: res.data.space.width,
          height: res.data.space.height,
        });
        setThumbnail(res.data.space.thumbnail || null);
        setElements(res.data.elements.map((e: any) => ({
          id: e.id,
          elementId: e.element.id,
          x: e.x,
          y: e.y,
          element: e.element,
        })));
      }
      setSpaceLoading(false);
    }).catch(err => {
      console.error(err);
      setSpaceError('Failed to load space data.');
      setSpaceLoading(false);
    });
  }, [spaceId, userId, setElements]);

  // Loading progress effect
  useEffect(() => {
    if (!spaceLoading && myPos) {
      let startTime = Date.now();
      const duration = 1500;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setLoadingProgress(Math.floor(progress * 100));

        if (progress >= 1) {
          clearInterval(timer);
          setWorldReady(true);
        }
      }, 50);

      return () => clearInterval(timer);
    } else {
      setWorldReady(false);
      setLoadingProgress(0);
    }
  }, [spaceLoading, myPos]);

  return {
    dimensions,
    thumbnail,
    spaceLoading,
    spaceError,
    worldReady,
    loadingProgress
  };
}
