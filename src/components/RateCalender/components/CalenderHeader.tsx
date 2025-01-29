// src/components/RateCalendar/components/CalendarHeader.tsx
import { Controller } from "react-hook-form";
import { Grid2 as Grid, Typography, Card } from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { Control } from "react-hook-form";
import { CalendarForm } from "../types";
import dayjs from "dayjs";

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
);
