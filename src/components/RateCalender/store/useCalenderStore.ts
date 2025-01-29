// store/useCalendarStore.ts
import { DateRange } from '@mui/x-date-pickers-pro';
import dayjs from 'dayjs';
import { create } from 'zustand';

interface CalendarState {
  dateRange: DateRange<dayjs.Dayjs>;
  calendarDates: Array<dayjs.Dayjs>;
  calendarMonths: Array<[string, number]>;
  dynamicHeights: Record<number, number>;
  heightCache: Record<number, number>;
  setDateRange: (range: DateRange<dayjs.Dayjs>) => void;
  setCalendarDates: (dates: Array<dayjs.Dayjs>) => void;
  setCalendarMonths: (months: Array<[string, number]>) => void;
  setDynamicHeight: (index: number, height: number) => void;
  updateHeightCache: (index: number, height: number) => void;
  resetHeights: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  dateRange: [dayjs(), dayjs().add(4, "month")],
  calendarDates: [],
  calendarMonths: [],
  dynamicHeights: {},
  heightCache: {},
  setDateRange: (range) => set({ dateRange: range }),
  setCalendarDates: (dates) => set({ calendarDates: dates }),
  setCalendarMonths: (months) => set({ calendarMonths: months }),
  setDynamicHeight: (index, height) =>
    set((state) => ({
      dynamicHeights: { ...state.dynamicHeights, [index]: height },
    })),
  updateHeightCache: (index, height) =>
    set((state) => ({
      heightCache: { ...state.heightCache, [index]: height },
    })),
  resetHeights: () => set({ dynamicHeights: {}, heightCache: {} }),
}));