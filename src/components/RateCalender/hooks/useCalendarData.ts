// hooks/useCalendarData.ts
import { calculateRoomCategoryHeight, findCategory } from '@/app/(components)/calculateRoomCategoryHeight';
import { useCallback, useState } from 'react';
import { HeightCache } from '../types';


export const useCalendarData = (room_calendar: any, itemCount: number) => {
  const [dynamicHeights, setDynamicHeights] = useState<Record<number, number>>({});

  const calculateDynamicHeight = useCallback(
    (index: number, heightCache: HeightCache): number => {
      if (dynamicHeights[index]) return dynamicHeights[index];

      const category = findCategory(index, room_calendar?.pages);
      if (!category) return 200;

      const baseHeight = 150;
      const contentHeight = calculateRoomCategoryHeight(category.rate_plans.length);
      const newHeight = baseHeight + contentHeight;

      heightCache[index] = newHeight;
      setDynamicHeights(prev => ({ ...prev, [index]: newHeight }));

      return newHeight;
    },
    [room_calendar?.pages, dynamicHeights]
  );

  return {
    dynamicHeights,
    calculateDynamicHeight,
  };
};