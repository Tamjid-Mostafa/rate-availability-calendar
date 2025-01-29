// components/MonthRow.tsx
import { Grid2 as Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { RefObject, memo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  VariableSizeList,
  areEqual
} from "react-window";
import MonthRow from "./MonthRow";

// Style the VariableSizeList to hide the scrollbar
const StyledVariableSizeList = styled(VariableSizeList)({
  scrollbarWidth: "none",

  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
});

interface MonthContainerProps {
  months: Array<[string, number]>;
  ref: RefObject<VariableSizeList | null>;
}

const MonthContainer: React.FC<MonthContainerProps> = ({
  months,
  ref,
}) => {
  return (
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
              key={months.length}
              height={19}
              width={width}
              itemCount={months.length}
              itemSize={(index: number) => {
                const no_of_days = months[index][1];
                return no_of_days * 74;
              }}
              layout="horizontal"
              ref={ref}
            >
              {(props) => <MonthRow {...props} months={months} />}
            </StyledVariableSizeList>
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  );
};

export default memo(MonthContainer, areEqual);
