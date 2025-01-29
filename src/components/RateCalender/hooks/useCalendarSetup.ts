// hooks/useCalendarSetup.ts
import { countDaysByMonth } from '@/utils';
import { useEffect } from 'react';
import { useCalendarStore } from '../store/useCalenderStore';

export const useCalendarSetup = () => {
  const { dateRange, setCalendarMonths, setCalendarDates } = useCalendarStore();

  useEffect(() => {
    const { months, dates } = countDaysByMonth(
      dateRange[0]!,
      dateRange[1] ? dateRange[1] : dateRange[0]!.add(2, "month")
    );

    setCalendarMonths(months);
    setCalendarDates(dates);
  }, [dateRange, setCalendarMonths, setCalendarDates]);

  return { dateRange };
};