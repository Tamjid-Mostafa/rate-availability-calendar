import { ErrorOutline } from "@mui/icons-material";
import { Box, InputAdornment } from "@mui/material";
import { styled } from "@mui/material/styles";
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
  type: "min_length_of_stay" | "reservation_deadline";
  room_category: {
    id: string;
    name: string;
  };
  inventory: IRoomInventory;
}

const StyledInputContainer = styled(Box)(() => ({
}));

const StyledInput = styled("input")<React.InputHTMLAttributes<HTMLInputElement>>(
  ({ theme }) => ({
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
  })
);



const ErrorIcon = styled(InputAdornment)(({ theme }) => ({
  position: "absolute",
  right: "4px",
  color: theme.palette.error.main,
  fontSize: "14px",
}));

export default function RoomRateRestrictionsCell(props: IProps) {
  const { control } = useForm<{
    nights: number | string;
  }>();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        borderLeft: "1px solid",
        borderBottom: "1px solid",
        borderColor: props.inventory.status ? "divider" : "error.dark",
        color: props.inventory.status ? "inherit" : "background.default",
        backgroundColor: props.inventory.status ? "inherit" : "error.light",
      }}
    >
      <Controller
        name="nights"
        control={control}
        rules={{
          min: {
            value: 0,
            message: "Nights must be greater than 0",
          },
          pattern: {
            value: /^[0-9]*$/,
            message: "Please enter only numbers.",
          },
        }}
        defaultValue={
          props.type === "min_length_of_stay"
            ? props.room_rate.min_length_of_stay
            : props.room_rate.reservation_deadline
        }
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
  );
}
