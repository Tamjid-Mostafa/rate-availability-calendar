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
import useRoomRateAvailabilityCalendar from "@/app/(hooks)/useRoomRateAvailabilityCalendar";
import MonthRow from "./components/MonthRow";
import DateRow from "./components/DateRow";
import AutoSizer from "react-virtualized-auto-sizer";

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
const LOADING = 1;
const LOADED = 2;
let itemStatusMap = {} as any;
const loadMoreItems = ({ startIndex, stopIndex }: any) => {
  for (let index = startIndex; index <= stopIndex; index++) {
    itemStatusMap[index] = LOADING;
  }
  return new Promise<void>((resolve) =>
    setTimeout(() => {
      for (let index = startIndex; index <= stopIndex; index++) {
        itemStatusMap[index] = LOADED;
      }
      resolve();
    }, 10)
  );
};
export default function RateCalender() {
  const theme = useTheme(); // Get the theme for styling

  const propertyId = 1; // Example property ID

  // State for calendar dates and months
  const [calenderDates, setCalenderDates] = useState<Array<dayjs.Dayjs>>([]);
  const [calenderMonths, setCalenderMonths] = useState<Array<[string, number]>>(
    []
  );

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
console.log({isFetched,
  isSuccess,
  hasNextPage,
  isFetchingNextPage,});
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

  return (
    <Container sx={{ backgroundColor: "#EEF2F6", scrollBehavior: "smooth" }}>
      <Navbar />
      <Box>
        <Card elevation={1} sx={{ padding: 4, mt: 4 }}>
          <Grid container columnSpacing={2}>
            <Grid size={12}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: 0,
                }}
              >
                Rate Calendar
              </Typography>
            </Grid>

            <Grid size={4}>
              <Controller
                name="date_range"
                control={control}
                rules={{
                  required: "Please specify a date range.",
                }}
                render={({ field, fieldState: { invalid, error } }) => (
                  <DateRangePicker
                    {...field}
                    autoFocus
                    minDate={dayjs()}
                    maxDate={dayjs().add(2, "year")}
                    slots={{ field: SingleInputDateRangeField }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: invalid,
                        helperText: invalid ? error?.message : null,
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>
        <Card elevation={1} sx={{ my: 6, padding: 3 }} ref={rootContainerRef}>
          <Grid container columnSpacing={2}>
            <Grid
              size={{
                xs: 4,
                sm: 4,
                md: 3,
                lg: 2,
                xl: 2,
              }}
            ></Grid>

            <Grid
              size={{
                xs: 8,
                sm: 8,
                md: 9,
                lg: 10,
                xl: 10,
              }}
            >
              <AutoSizer disableHeight>
                {({ width }) => (
                  <StyledVariableSizeList
                    key={calenderMonths.length}
                    height={19}
                    width={width}
                    itemCount={calenderMonths.length}
                    itemSize={(index: number) => {
                      const no_of_days = calenderMonths[index][1];
                      return no_of_days * 74;
                    }}
                    layout="horizontal"
                    ref={calenderMonthsRef}
                  >
                    {(props) => <MonthRow {...props} months={calenderMonths} />}
                  </StyledVariableSizeList>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          <Grid container sx={{ height: 48 }}>
            <Grid
              sx={{
                borderBottom: "1px solid",
                borderColor: theme.palette.divider,
              }}
              size={{
                xs: 4,
                sm: 4,
                md: 3,
                lg: 2,
                xl: 2,
              }}
            ></Grid>
            <Grid
              size={{
                xs: 8,
                sm: 8,
                md: 9,
                lg: 10,
                xl: 10,
              }}
            >
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeGrid
                    height={height}
                    width={width}
                    columnCount={calenderDates.length}
                    columnWidth={74}
                    rowCount={1}
                    rowHeight={37}
                    ref={calenderDatesRef}
                    outerRef={mainGridContainerRef}
                    onScroll={handleDatesScroll}
                  >
                    {(props) => <DateRow {...props} dates={calenderDates} />}
                  </FixedSizeGrid>
                )}
              </AutoSizer>
            </Grid>
          </Grid>

          {isSuccess &&
            room_calendar.pages.map((page, pageIndex) =>
              page.data.room_categories.map((room_category, key) => {
                const flatIndex =
                  room_calendar.pages
                    .slice(0, pageIndex)
                    .reduce(
                      (count, p) => count + p.data.room_categories.length,
                      0
                    ) + key;

                return (
                  <RoomRateAvailabilityCalendar
                    key={`${room_category.id}-${pageIndex}-${key}`}
                    index={flatIndex}
                    InventoryRefs={inventoryRefs}
                    isLastElement={
                      pageIndex === room_calendar.pages.length - 1 &&
                      key === page.data.room_categories.length - 1
                    }
                    room_category={room_category}
                    handleCalenderScroll={handleCalenderScroll}
                  />
                );
              })
            )}

          {hasNextPage && (
            <Button
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? <CircularProgress /> : "Load More"}
            </Button>
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
