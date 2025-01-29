// types/calendar.ts
import { DateRange } from "@mui/x-date-pickers-pro";
import dayjs, { Dayjs } from "dayjs";
import { RefObject } from "react";
import { VariableSizeGrid, VariableSizeList } from "react-window";

export interface CalendarForm {
  date_range: DateRange<dayjs.Dayjs>;
}

export interface RoomCategory {
  id: string;
  rate_plans: any[]; // Define proper type based on your data structure
}

export interface HeightCache {
  [key: number]: number;
}

export interface CalendarRefs {
  monthsRef: RefObject<VariableSizeList>;
  datesRef: RefObject<VariableSizeGrid>;
  mainGridRef: RefObject<HTMLDivElement>;
  inventoryRefs: RefObject<Array<RefObject<VariableSizeGrid>>>;
}