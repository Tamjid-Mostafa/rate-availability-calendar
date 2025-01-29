import { Box } from "@mui/material";
import dayjs from "dayjs";
import React, { memo } from "react";
import { GridChildComponentProps, areEqual } from "react-window";

interface DateRowProps extends GridChildComponentProps {
  dates: Array<dayjs.Dayjs>;
}

const DateRow: React.FC<DateRowProps> = ({ columnIndex, style, dates }) => {
  return (
    <Box style={style}>
      <Box
        sx={{
          pr: 1,
          fontSize: "12px",
          textAlign: "right",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>{dates[columnIndex].format("ddd")}</Box>
        <Box>{dates[columnIndex].format("DD")}</Box>
      </Box>
    </Box>
  );
};

export default memo(DateRow, areEqual);
