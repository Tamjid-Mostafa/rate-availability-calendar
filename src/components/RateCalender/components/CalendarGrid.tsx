// src/components/RateCalendar/components/CalendarGrid.tsx
import { useCallback, useRef, useEffect, RefObject } from "react";
import { Grid2 as Grid } from "@mui/material";
import { AutoSizer } from "react-virtualized";
import { FixedSizeGrid, GridOnScrollProps, VariableSizeGrid, VariableSizeList } from "react-window";
import { styled } from "@mui/material/styles";
import { CalendarData } from "../types";
import { MonthRow } from "./MonthRow";
import { DateRow } from "./DateRow";

const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

interface CalendarGridProps {
  calendarData: CalendarData;
  onScroll: (props: GridOnScrollProps) => void;
  inventoryRefs: RefObject<Array<RefObject<VariableSizeGrid | null>>>;
}

export const CalendarGrid = ({ calendarData, onScroll, inventoryRefs }: CalendarGridProps) => {
  const calenderMonthsRef = useRef<VariableSizeList | null>(null);
  const calenderDatesRef = useRef<FixedSizeGrid | null>(null);
  const mainGridContainerRef = useRef<HTMLDivElement | null>(null);

  // ... rest of the grid implementation with proper refs and scroll handling

  return (
    <Grid container>
      {/* Month row */}
      <Grid size={12}>
        <AutoSizer disableHeight>
          {({ width }) => (
            <StyledVariableSizeList
              height={19}
              width={width}
              itemCount={calendarData.months.length}
              itemSize={(index) => calendarData.months[index][1] * 74}
              layout="horizontal"
              ref={calenderMonthsRef}
            >
              {(props) => (
                <MonthRow {...props} month={calendarData.months[props.index][0]} />
              )}
            </StyledVariableSizeList>
          )}
        </AutoSizer>
      </Grid>

      {/* Date row */}
      <Grid size={12}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeGrid
              height={height}
              width={width}
              columnCount={calendarData.dates.length}
              columnWidth={74}
              rowCount={1}
              rowHeight={37}
              ref={calenderDatesRef}
              outerRef={mainGridContainerRef}
              onScroll={onScroll}
            >
              {(props) => (
                <DateRow {...props} date={calendarData.dates[props.columnIndex]} />
              )}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
};