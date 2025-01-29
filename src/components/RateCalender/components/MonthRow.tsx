import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React, { memo } from "react";
import { ListChildComponentProps, areEqual } from "react-window";

interface MonthRowProps extends ListChildComponentProps {
  months: Array<[string, number]>;
}

const MonthRow: React.FC<MonthRowProps> = ({ index, style, months }) => {
  const theme = useTheme();
  const month = months[index][0];

  return (
    <Box style={style}>
      <Box
        sx={{
          px: 1,
          fontSize: "12px",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
        }}
      >
        <Box
          component="span"
          sx={{
            position: "sticky",
            left: 2,
            zIndex: 1,
          }}
        >
          {month}
        </Box>
      </Box>
    </Box>
  );
};

export default memo(MonthRow, areEqual);
