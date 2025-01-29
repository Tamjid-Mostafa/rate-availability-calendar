import { ErrorOutline } from "@mui/icons-material";
import { Box, InputAdornment } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Controller, useForm } from "react-hook-form";
import {
  IRateCalendar,
  IRoomInventory,
} from "../(hooks)/useRoomRateAvailabilityCalendar";

interface IProps {
  rate_plan: {
    id: number;
    name: string;
  };
  room_rate: IRateCalendar;
  room_category: {
    id: string;
    name: string;
  };
  inventory: IRoomInventory;
}
const StyledInputContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
}));

const StyledInput = styled("input")<
  React.InputHTMLAttributes<HTMLInputElement>
>(({ theme }) => ({
  width: "100%",
  padding: "4px",
  textAlign: "right",
  fontSize: "12px",
  fontWeight: "bold",
  backgroundColor: "inherit",
  outline: "none",
  border: "2px solid transparent",
  transition: "border-color 0.3s ease", // Smooth transitions
  "&:hover": {
    borderColor: theme.palette.success.main,
  },
  "&:focus": {
    borderColor: theme.palette.success.main,
  },
  "&.error": {
    borderColor: theme.palette.error.main,
  },
}));
const ErrorIcon = styled(InputAdornment)(({ theme }) => ({
  position: "absolute",
  right: "4px",
  color: theme.palette.error.main,
  fontSize: "14px",
}));
export default function RoomRateCell(props: IProps) {
  const theme = useTheme();

  const { control } = useForm<{
    rate: number | string;
  }>();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "end",
          width: "100%",
          height: "100%",
          fontSize: "12px",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: props.inventory.status
            ? theme.palette.divider
            : theme.palette.error.dark,
          color: props.inventory.status
            ? "inherit"
            : theme.palette.background.default,
          backgroundColor: props.inventory.status
            ? "inherit"
            : theme.palette.error.light,
        }}
      >
        <Controller
          name="rate"
          control={control}
          rules={{
            min: {
              value: 0,
              message: "Rate must be minimum 0",
            },
            pattern: {
              value: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "Please enter only numbers.",
            },
          }}
          defaultValue={props.room_rate.rate}
          render={({ field, fieldState: { invalid } }) => (
            <StyledInputContainer>
              <StyledInput
                {...field}
                className={invalid ? "error" : ""}
                type="text"
              />
              {invalid && (
                <ErrorIcon position="end">
                  <ErrorOutline />
                </ErrorIcon>
              )}
            </StyledInputContainer>
          )}
        />
      </Box>
    </>
  );
}
