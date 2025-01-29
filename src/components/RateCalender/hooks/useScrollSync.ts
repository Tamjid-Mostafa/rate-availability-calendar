// hooks/useScrollSync.ts
import { RefObject, useCallback } from 'react';
import { FixedSizeGrid, GridOnScrollProps, VariableSizeGrid, VariableSizeList } from 'react-window';

interface ScrollRefs {
  inventoryRefs: RefObject<Array<RefObject<VariableSizeGrid | null>>>;
  calenderMonthsRef: RefObject<VariableSizeList | null>;
  calenderDatesRef: RefObject<FixedSizeGrid | null>;
}

export const useScrollSync = (refs: ScrollRefs) => {
  const handleScroll = useCallback(({ scrollLeft }: GridOnScrollProps) => {
    refs.inventoryRefs.current?.forEach((ref) => {
      ref.current?.scrollTo({ scrollLeft });
    });
    refs.calenderMonthsRef.current?.scrollTo(scrollLeft);
    refs.calenderDatesRef.current?.scrollTo({ scrollLeft });
  }, [refs]);

  return { handleScroll };
};
