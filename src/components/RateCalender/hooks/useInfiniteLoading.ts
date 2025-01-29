// hooks/useInfiniteLoading.ts
import { useCallback, useState } from 'react';
import { VariableSizeList } from 'react-window';

interface InfiniteLoadingProps {
  room_calendar: any;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<any>;
  listRef: React.RefObject<VariableSizeList | null>;
}

export const useInfiniteLoading = ({
  room_calendar,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  listRef,
}: InfiniteLoadingProps) => {
  const [pendingRequest, setPendingRequest] = useState(false);

  const isItemLoaded = useCallback(
    (index: number): boolean => {
      if (!room_calendar?.pages) return false;
      let countSoFar = 0;
      for (const page of room_calendar.pages) {
        const pageItemCount = page.data.room_categories.length;
        if (index < countSoFar + pageItemCount) {
          return true;
        }
        countSoFar += pageItemCount;
      }
      return false;
    },
    [room_calendar?.pages]
  );

  const loadMore = useCallback(
    async (startIndex: number, stopIndex: number) => {
      if (!hasNextPage || isFetchingNextPage || pendingRequest) return;

      const currentLoadedItems = room_calendar?.pages.reduce(
        (count: any, page: { data: { room_categories: string | any[]; }; }) => count + page.data.room_categories.length,
        0
      ) || 0;

      if (stopIndex >= currentLoadedItems - 3) {
        setPendingRequest(true);
        try {
          await fetchNextPage();
          listRef.current?.resetAfterIndex(currentLoadedItems);
        } finally {
          setPendingRequest(false);
        }
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, room_calendar?.pages, pendingRequest, listRef]
  );

  return {
    isItemLoaded,
    loadMore,
    pendingRequest
  };
};