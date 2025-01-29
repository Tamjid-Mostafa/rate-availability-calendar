// src/components/RateCalendar/components/CalendarHeader.tsx
import { Card, Grid2 as Grid, Typography } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import dayjs from "dayjs";
import { Control, Controller } from "react-hook-form";
import { CalendarForm } from "../types";

interface CalendarHeaderProps {
  control: Control<CalendarForm>;
}

export const CalendarHeader = ({ control }: CalendarHeaderProps) => (
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

      <Grid
        size={{ md: 4, xs: "auto" }}
      >
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
                  size: "small",
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
);
