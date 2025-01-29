"use client";

// Import necessary modules and components
import {
  Grid2 as Grid,
  Typography,
  Card,
  Box,
  Container,
  CircularProgress,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DateRange } from "@mui/x-date-pickers-pro";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { Controller, useForm } from "react-hook-form";
import React, {
  RefObject,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
  FixedSizeGrid,
  GridChildComponentProps,
  VariableSizeGrid,
  GridOnScrollProps,
} from "react-window";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import { countDaysByMonth } from "@/utils";

import Navbar from "@/components/Navbar";
import RoomRateAvailabilityCalendar from "@/app/(components)/RoomCalendar";
import useRoomRateAvailabilityCalendar, {
  IRoomCategoryCalender,
} from "@/app/(hooks)/useRoomRateAvailabilityCalendar";
import MonthRow from "./components/MonthRow";
import DateRow from "./components/DateRow";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import {
  HeightCache,
  calculateRoomCategoryHeight,
  calculateVirtualizedListHeight,
  findCategory,
} from "@/app/(components)/calculateRoomCategoryHeight";
import { CalendarHeader } from "./components/CalenderHeader";
import MonthContainer from "./components/MonthContainer";
import DateContainer from "./components/DateContainer";
// Define the form type for the date range picker
export type CalendarForm = {
  date_range: DateRange<dayjs.Dayjs>;
};

// Style the VariableSizeList to hide the scrollbar
const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",

  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

export default function RateCalender() {
  const theme = useTheme(); // Get the theme for styling

  const propertyId = 1; // Example property ID

  // State for calendar dates and months
  const [calenderDates, setCalenderDates] = useState<Array<dayjs.Dayjs>>([]);
  const [calenderMonths, setCalenderMonths] = useState<Array<[string, number]>>(
    []
  );
  const [dynamicHeights, setDynamicHeights] = useState<Record<number, number>>(
    {}
  );

  // Refs
  const listRef = useRef<VariableSizeList>(null);
  const heightCache = useRef<HeightCache>({});
  const resizeTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Form control for date range picker
  const { control, watch } = useForm<CalendarForm>({
    defaultValues: {
      date_range: [dayjs(), dayjs().add(4, "month")],
    },
  });
  const watchedDateRange = watch("date_range");

  // Update calendar dates and months when the date range changes
  useEffect(() => {
    const { months, dates } = countDaysByMonth(
      watchedDateRange[0]!,
      watchedDateRange[1]
        ? watchedDateRange[1]
        : watchedDateRange[0]!.add(2, "month")
    );

    setCalenderMonths(months);
    setCalenderDates(dates);
  }, [watchedDateRange]);

  // Fetch room rate availability calendar data
  const {
    data: room_calendar,
    isFetched,
    isSuccess,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRoomRateAvailabilityCalendar({
    property_id: propertyId,
    start_date: watchedDateRange[0]!.format("YYYY-MM-DD"),
    end_date: (watchedDateRange[1]
      ? watchedDateRange[1]
      : watchedDateRange[0]!.add(2, "month")
    ).format("YYYY-MM-DD"),
  });
  console.log("Room Calendar Pages:", room_calendar?.pages);

  // Refs for various elements to handle scrolling
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const calenderMonthsRef = useRef<VariableSizeList | null>(null);
  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);
  const inventoryRefs = useRef<Array<RefObject<VariableSizeGrid | null>>>([]);

  const handleDatesScroll = useCallback(
    ({ scrollLeft }: GridOnScrollProps) => {
      inventoryRefs.current.forEach((ref) => {
        ref.current?.scrollTo({ scrollLeft });
      });
      calenderMonthsRef.current?.scrollTo(scrollLeft);
    },
    [room_calendar]
  );

  const handleCalenderScroll = useCallback(
    ({ scrollLeft }: GridOnScrollProps) => {
      inventoryRefs.current.forEach((ref, index) => {
        ref?.current?.scrollTo({ scrollLeft });
      });

      calenderMonthsRef.current?.scrollTo(scrollLeft);
      calenderDatesRef.current?.scrollTo({ scrollLeft });
    },
    [room_calendar]
  );

  useEffect(() => {
    const { current: rootContainer } = rootContainerRef;

    if (rootContainer) {
      let animationFrame: number | null = null;

      const handler = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          e.preventDefault();

          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
          }

          animationFrame = requestAnimationFrame(() => {
            const scrollLeft =
              (mainGridContainerRef.current?.scrollLeft || 0) + e.deltaX;
            inventoryRefs.current.forEach((ref, index) => {
              ref.current?.scrollTo({ scrollLeft });
            });

            calenderMonthsRef.current?.scrollTo(scrollLeft);

            calenderDatesRef.current?.scrollTo({
              scrollLeft,
            });

            animationFrame = null;
          });
        }
      };

      rootContainer.addEventListener("wheel", handler);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        rootContainer.removeEventListener("wheel", handler);
      };
    }
  }, [room_calendar]);

  // Memoized item count calculation

  const itemCount = React.useMemo(() => {
    if (!room_calendar?.pages) return 0;
    // Calculate exact count of loaded items
    const loadedCount = room_calendar.pages.reduce(
      (count, page) => count + page.data.room_categories.length,
      0
    );
    // Only add 1 to represent the next possible item if there's a next page
    return hasNextPage ? loadedCount + 1 : loadedCount;
  }, [room_calendar?.pages, hasNextPage]);

  // Improved isItemLoaded check
  const isItemLoaded = useCallback(
    (index: number): boolean => {
      if (!room_calendar?.pages) return false;

      let countSoFar = 0;
      for (const page of room_calendar.pages) {
        const pageItemCount = page.data.room_categories.length;
        if (index < countSoFar + pageItemCount) {
          // console.log(index,"page item count",countSoFar + pageItemCount);
          return true;
        }
        countSoFar += pageItemCount;
      }
      return false;
    },
    [room_calendar?.pages]
  );

  // Enhanced loadMore function with better loading logic
  const [pendingRequest, setPendingRequest] = useState(false);

  const loadMore = useCallback(
    async (startIndex: number, stopIndex: number) => {
      if (!hasNextPage || isFetchingNextPage || pendingRequest) return;

      // console.log("Checking Index", { startIndex, stopIndex });

      // Calculate current loaded items
      const currentLoadedItems =
        room_calendar?.pages.reduce(
          (count, page) => count + page.data.room_categories.length,
          0
        ) || 0;

      // Fetch only when reaching the last few items
      if (stopIndex >= currentLoadedItems - 3) {
        setPendingRequest(true);
        try {
          await fetchNextPage();
          listRef.current?.resetAfterIndex(currentLoadedItems);
        } catch (error) {
          console.error("Error loading more items:", error);
        } finally {
          setPendingRequest(false);
        }
      }
    },
    [
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      room_calendar?.pages,
      pendingRequest,
    ]
  );

  const getRowHeight = useCallback(
    (index: number): number => {
      // Return cached height if available
      if (heightCache.current[index] !== undefined) {
        return heightCache.current[index];
      }

      const category = findCategory(index, room_calendar?.pages);
      const isLastElement = index === itemCount - 1;

      const height = calculateVirtualizedListHeight(category, isLastElement);
      heightCache.current[index] = height;

      return height;
    },
    [room_calendar?.pages, itemCount]
  );
  // Calculate dynamic heights based on content
  const calculateDynamicHeight = useCallback(
    (index: number): number => {
      if (dynamicHeights[index]) return dynamicHeights[index];

      const category = findCategory(index, room_calendar?.pages);
      if (!category) return 200; // Default height

      const baseHeight = 150; // Base height for category
      const contentHeight = calculateRoomCategoryHeight(
        category.rate_plans.length
      );
      const newHeight = baseHeight + contentHeight;

      // Update height cache
      heightCache.current[index] = newHeight;
      setDynamicHeights((prev) => ({ ...prev, [index]: newHeight }));

      return newHeight;
    },
    [room_calendar?.pages, dynamicHeights]
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        heightCache.current = {};
        setDynamicHeights({});
        listRef.current?.resetAfterIndex(0);
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Row renderer with dynamic height calculation
  const RowRenderer = memo(({ index, style }: ListChildComponentProps) => {
    const isLoading = !isItemLoaded(index);
    const category = findCategory(index, room_calendar?.pages);

    if (isLoading) {
      return (
        <Box
          style={style}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "200px",
            backgroundColor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!category) return null;

    return (
      <Box
        style={style}
        onLoad={() => {
          // Recalculate height after content loads
          const newHeight = calculateDynamicHeight(index);
          if (newHeight !== heightCache.current[index]) {
            heightCache.current[index] = newHeight;
            listRef.current?.resetAfterIndex(index);
          }
        }}
      >
        <RoomRateAvailabilityCalendar
          key={`${category.id}-${index}`}
          index={index}
          InventoryRefs={inventoryRefs}
          room_category={category}
          handleCalenderScroll={handleCalenderScroll}
          isLastElement={index === itemCount - 1}
        />
      </Box>
    );
  }, areEqual);

  return (
    <Container sx={{ backgroundColor: "#EEF2F6", scrollBehavior: "smooth" }}>
      <Navbar />
      <Box>
        <CalendarHeader control={control} />
        <Card elevation={1} sx={{ my: 6, padding: 3 }} ref={rootContainerRef}>
          <MonthContainer ref={calenderMonthsRef} months={calenderMonths} />
          <DateContainer
            ref={calenderDatesRef}
            outerRef={mainGridContainerRef}
            onScroll={handleDatesScroll}
            dates={calenderDates}
          />
          {/* Infinite Scrolling Room Categories */}
          <Grid container sx={{ height: "100vh" }}>
            <AutoSizer>
              {({ height, width }) => (
                <InfiniteLoader
                  isItemLoaded={isItemLoaded}
                  itemCount={itemCount}
                  loadMoreItems={loadMore}
                  threshold={1}
                >
                  {({ onItemsRendered, ref }) => (
                    <VariableSizeList
                      ref={ref}
                      height={height}
                      width={width}
                      itemCount={itemCount}
                      itemSize={getRowHeight}
                      onItemsRendered={onItemsRendered}
                      style={{ scrollBehavior: "smooth" }}
                      overscanCount={1}
                    >
                      {RowRenderer}
                    </VariableSizeList>
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </Grid>
        </Card>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          textAlign: "center",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Grit System. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}
