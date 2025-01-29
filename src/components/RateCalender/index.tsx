"use client";

import RoomRateAvailabilityCalendar from "@/app/(components)/RoomCalendar";
import { findCategory } from "@/app/(components)/calculateRoomCategoryHeight";
import useRoomRateAvailabilityCalendar from "@/app/(hooks)/useRoomRateAvailabilityCalendar";
import {
  Box,
  Card,
  CircularProgress,
  Container,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React, { RefObject, memo, useEffect, useRef } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FixedSizeGrid,
  ListChildComponentProps,
  VariableSizeGrid,
  VariableSizeList,
  areEqual,
} from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Navbar from "../Navbar";
import { CalendarHeader } from "./components/CalenderHeader";
import DateContainer from "./components/DateContainer";
import MonthContainer from "./components/MonthContainer";
import { useCalendarSetup } from "./hooks/useCalendarSetup";
import { useHeightManagement } from "./hooks/useHeightManagement";
import { useInfiniteLoading } from "./hooks/useInfiniteLoading";
import { useScrollSync } from "./hooks/useScrollSync";
import { useCalendarStore } from "./store/useCalenderStore";

const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

export default function RateCalender() {
  const theme = useTheme();
  const propertyId = 1;

  // Get store values

  // Initialize refs
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const calenderMonthsRef = useRef<VariableSizeList | null>(null);
  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);
  const inventoryRefs = useRef<Array<RefObject<VariableSizeGrid | null>>>([]);

  const { calendarDates, calendarMonths } = useCalendarStore();
  const { control, watchedDateRange } = useCalendarSetup();

  // Your fetch logic using watchedDateRange
  const {
    data: room_calendar,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useRoomRateAvailabilityCalendar({
    property_id: propertyId,
    start_date: watchedDateRange[0]!.format("YYYY-MM-DD"),
    end_date: watchedDateRange[1]
      ? watchedDateRange[1].format("YYYY-MM-DD")
      : watchedDateRange[0]!.add(2, "month").format("YYYY-MM-DD"),
  });
  // console.log("Room Calendar Pages:", room_calendar?.pages);
  // Calculate item count
  const itemCount = React.useMemo(() => {
    if (!room_calendar?.pages) return 0;
    const loadedCount = room_calendar.pages.reduce(
      (count, page) => count + page.data.room_categories.length,
      0
    );
    return hasNextPage ? loadedCount + 1 : loadedCount;
  }, [room_calendar?.pages, hasNextPage]);

  // Setup height management
  const { listRef, resizeTimeoutRef, getRowHeight, resetHeights } =
    useHeightManagement(room_calendar, itemCount);

  // Setup scroll synchronization
  const { handleScroll } = useScrollSync({
    inventoryRefs,
    calenderMonthsRef,
    calenderDatesRef,
  });
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
  // Setup infinite loading
  const { isItemLoaded, loadMore } = useInfiniteLoading({
    room_calendar,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    listRef,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = setTimeout(() => {
        resetHeights();
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [resetHeights, resizeTimeoutRef]);

  // Row renderer component
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
      <Box style={style}>
        <RoomRateAvailabilityCalendar
          key={`${category.id}-${index}`}
          index={index}
          InventoryRefs={inventoryRefs}
          room_category={category}
          handleCalenderScroll={handleScroll}
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
          <MonthContainer ref={calenderMonthsRef} months={calendarMonths} />
          <DateContainer
            ref={calenderDatesRef}
            outerRef={mainGridContainerRef}
            onScroll={handleScroll}
            dates={calendarDates}
          />
          {isLoading ? (
            <Box
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
          ) : (
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
                      <StyledVariableSizeList
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
                      </StyledVariableSizeList>
                    )}
                  </InfiniteLoader>
                )}
              </AutoSizer>
            </Grid>
          )}
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
