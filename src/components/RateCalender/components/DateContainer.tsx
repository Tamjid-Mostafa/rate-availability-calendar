// components/DateRow.tsx
import React, { RefObject, memo } from "react";
import {
  FixedSizeGrid,
  GridOnScrollProps,
  ListChildComponentProps,
  VariableSizeList,
  areEqual,
} from "react-window";
import { Grid2 as Grid } from "@mui/material";
import AutoSizer from "react-virtualized-auto-sizer";
import { styled } from "@mui/material/styles";
import DateRow from "./DateRow";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";

// Style the VariableSizeList to hide the scrollbar
const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",

  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

interface DateContainerProps {
  dates: Array<dayjs.Dayjs>;
  onScroll: ({scrollLeft}:GridOnScrollProps) => void;
  outerRef: RefObject<HTMLDivElement | null>;
  ref: RefObject<FixedSizeGrid | null>;
}

const DateContainer: React.FC<DateContainerProps> = ({
  dates,
  onScroll,
  outerRef,
  ref,
}) => {
  const theme = useTheme();
  return (
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
              columnCount={dates.length}
              columnWidth={74}
              rowCount={1}
              rowHeight={37}
              ref={ref}
              outerRef={outerRef}
              onScroll={onScroll}
            >
              {(props) => <DateRow {...props} dates={dates} />}
            </FixedSizeGrid>
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
};

export default memo(DateContainer, areEqual);
