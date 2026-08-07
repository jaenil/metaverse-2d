import { useState, useEffect, useCallback } from 'react';
import { getElements, addSpaceElement, deleteSpaceElement } from '../api';
import type { Element, SpaceElement } from '../types';

const ERASER_ELEMENT = { id: 'ERASER', imageUrl: 'https://img.icons8.com/color/48/eraser.png', width: 1, height: 1, static: false } as Element;

export function useBuildMode(
  spaceId: string | undefined,
  dimensions: { width: number, height: number },
  arenaElements: SpaceElement[],
  sendElementAdded: (element: SpaceElement) => void,
  sendElementDeleted: (id: string) => void
) {
  const [placementError, setPlacementError] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState(false);
  const [availableElements, setAvailableElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  // Auto-dismiss the placement error after 2.5 seconds
  useEffect(() => {
    if (!placementError) return;
    const timer = setTimeout(() => setPlacementError(null), 2500);
    return () => clearTimeout(timer);
  }, [placementError]);

  const toggleBuildMode = async () => {
    if (!buildMode && availableElements.length === 0) {
      try {
        const res = await getElements();
        setAvailableElements([ERASER_ELEMENT, ...res.data.elements]);
      } catch (e) {
        console.error("Failed to load elements", e);
      }
    }
    setBuildMode(!buildMode);
    setSelectedElement(null);
  };

  const handleCanvasClick = useCallback(async (x: number, y: number) => {
    if (!buildMode || !selectedElement || !spaceId) return;

    if (selectedElement.id === 'ERASER') {
      const target = arenaElements.find(el => {
        const ew = el.element?.width ?? 1;
        const eh = el.element?.height ?? 1;
        return x >= el.x && x < el.x + ew && y >= el.y && y < el.y + eh;
      });
      if (target) {
        try {
          const res = await deleteSpaceElement(target.id, spaceId);
          if (res.status === 200) {
            sendElementDeleted(target.id);
          }
        } catch (e) { console.error("Failed to delete element", e); }
      }
      return;
    }

    try {
      setPlacementError(null);
      if (x < 0 || y < 0 || x >= dimensions.width || y >= dimensions.height) {
        setPlacementError('Position out of bounds.');
        return;
      }

      const isColliding = arenaElements.some((e) => {
        if (!e.element) return false;
        const overlapX = x < e.x + e.element.width &&
          x + (selectedElement?.width ?? 0) > e.x;

        const overlapY = y < e.y + e.element.height &&
          y + (selectedElement?.height ?? 0) > e.y;

        return overlapX && overlapY && e.element.static;
      })
      if (isColliding) {
        setPlacementError('Element is colliding with another element');
        return;
      }
      const res = await addSpaceElement({ elementId: selectedElement.id, spaceId, x, y });
      if (res.status === 200) {
        const newElement = {
          id: res.data.element.id,
          elementId: selectedElement.id,
          x, y,
          element: selectedElement
        };
        sendElementAdded(newElement);
      }
    } catch (e) {
      console.error("Failed to place element", e);
      setPlacementError('Failed to place element. Try again.');
    }
  }, [buildMode, selectedElement, spaceId, dimensions, arenaElements, sendElementDeleted, sendElementAdded]);

  return {
    buildMode,
    toggleBuildMode,
    availableElements,
    selectedElement,
    setSelectedElement,
    placementError,
    handleCanvasClick
  };
}
