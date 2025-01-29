// hooks/useHeightManagement.ts
import { calculateVirtualizedListHeight, findCategory } from '@/app/(components)/calculateRoomCategoryHeight';
import { useCallback, useRef } from 'react';
import { VariableSizeList } from 'react-window';

export const useHeightManagement = (room_calendar: any, itemCount: number) => {
  const heightCacheRef = useRef<Record<number, number>>({});
  const listRef = useRef<VariableSizeList | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getRowHeight = useCallback((index: number): number => {
    if (heightCacheRef.current[index] !== undefined) {
      return heightCacheRef.current[index];
    }

    const category = findCategory(index, room_calendar?.pages);
    const isLastElement = index === itemCount - 1;
    const height = calculateVirtualizedListHeight(category, isLastElement);
    
    heightCacheRef.current[index] = height;
    return height;
  }, [room_calendar?.pages, itemCount]);

  const resetHeights = useCallback(() => {
    heightCacheRef.current = {};
    listRef.current?.resetAfterIndex(0);
  }, []);

  return {
    heightCacheRef,
    listRef,
    resizeTimeoutRef,
    getRowHeight,
    resetHeights,
  };
};
