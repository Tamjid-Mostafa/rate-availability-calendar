// hooks/useCalendarSetup.ts
import { countDaysByMonth } from '@/utils';
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCalendarStore } from '../store/useCalenderStore';


export type CalendarForm = {
  date_range: DateRange<dayjs.Dayjs>;
};

export const useCalendarSetup = () => {
  const { dateRange, setCalendarMonths, setCalendarDates } = useCalendarStore();
  
  // Initialize form with store's date range
  const { control, watch } = useForm<CalendarForm>({
    defaultValues: {
      date_range: dateRange,
    },
  });

  const watchedDateRange = watch('date_range');

  // Update calendar dates and months when date range changes
  useEffect(() => {
    if (!watchedDateRange[0]) return;

    const { months, dates } = countDaysByMonth(
      watchedDateRange[0],
      watchedDateRange[1]
        ? watchedDateRange[1]
        : watchedDateRange[0].add(2, "month")
    );

    setCalendarMonths(months);
    setCalendarDates(dates);
  }, [watchedDateRange, setCalendarMonths, setCalendarDates]);

  return {
    control,
    watchedDateRange,
  };
};