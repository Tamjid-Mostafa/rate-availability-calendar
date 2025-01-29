"use client";

import {
  Grid2 as Grid,
  Typography,
  Card,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";
import React, { RefObject, memo, useEffect, useRef } from "react";
import {
  VariableSizeList,
  ListChildComponentProps,
  areEqual,
  FixedSizeGrid,
  VariableSizeGrid,
} from "react-window";
import { styled } from "@mui/material/styles";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import { findCategory } from "@/app/(components)/calculateRoomCategoryHeight";
import { useCalendarStore } from "./store/useCalenderStore";
import { useCalendarSetup } from "./hooks/useCalendarSetup";
import useRoomRateAvailabilityCalendar from "@/app/(hooks)/useRoomRateAvailabilityCalendar";
import { useHeightManagement } from "./hooks/useHeightManagement";
import { useScrollSync } from "./hooks/useScrollSync";
import { useInfiniteLoading } from "./hooks/useInfiniteLoading";
import RoomRateAvailabilityCalendar from "@/app/(components)/RoomCalendar";
import Navbar from "../Navbar";
import { CalendarHeader } from "./components/CalenderHeader";
import MonthContainer from "./components/MonthContainer";
import DateContainer from "./components/DateContainer";

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
  const { calendarDates, calendarMonths } = useCalendarStore();

  // Initialize refs
  const rootContainerRef = useRef<HTMLDivElement>(null);
  const calenderMonthsRef = useRef<VariableSizeList | null>(null);
  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);
  const inventoryRefs = useRef<Array<RefObject<VariableSizeGrid | null>>>([]);

  // Setup calendar
  const { dateRange } = useCalendarSetup();

  // Initialize form
  const { control } = useForm({
    defaultValues: {
      date_range: dateRange,
    },
  });

  // Fetch calendar data
  const {
    data: room_calendar,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRoomRateAvailabilityCalendar({
    property_id: propertyId,
    start_date: dateRange[0]!.format("YYYY-MM-DD"),
    end_date: (dateRange[1]
      ? dateRange[1]
      : dateRange[0]!.add(2, "month")
    ).format("YYYY-MM-DD"),
  });
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
  const {
    heightCacheRef,
    listRef,
    resizeTimeoutRef,
    getRowHeight,
    resetHeights,
  } = useHeightManagement(room_calendar, itemCount);

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
