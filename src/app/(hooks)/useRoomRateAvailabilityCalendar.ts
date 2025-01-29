import { useInfiniteQuery } from "@tanstack/react-query";
import Fetch from "@/utils/Fetch";
import { Dayjs } from "dayjs";

// Define interfaces for the data structures used in the calendar
export interface IRoomInventory {
  id: string;
  date: Dayjs;
  available: number;
  status: boolean;
  booked: number;
}

export interface IRoomRatePlans {
  id: number;
  name: string;
}

export interface IRateCalendar {
  id: string;
  date: Dayjs;
  rate: number;
  min_length_of_stay: number;
  reservation_deadline: number;
}

export interface IRatePlanCalendar extends IRoomRatePlans {
  calendar: Array<IRateCalendar>;
}

export interface IRoomCategory {
  id: string;
  name: string;
  occupancy: number;
}

export interface IRoomCategoryCalender extends IRoomCategory {
  inventory_calendar: Array<IRoomInventory>;
  rate_plans: Array<IRatePlanCalendar>;
}

export interface IGridData {
  type: "inventory" | "rate";
  row: "status" | "available" | "booked" | "rate" | "min_length_of_stay" | "reservation_deadline";
  rate_plan?: {
    id: number;
    name: string;
    calendar: IRateCalendar[];
  };
}

interface IParams {
  property_id: number;
  start_date: string;
  end_date: string;
}

interface IResponse {
  room_categories: Array<IRoomCategoryCalender>;
  nextCursor?: number;
}

export default function useRoomRateAvailabilityCalendar(params: IParams) {
  return useInfiniteQuery({
    queryKey: ["property_room_calendar", params],
    queryFn: async ({ pageParam = 0 }) => {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/property/${params.property_id}/rate-calendar/assessment`
      );

      url.search = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
        cursor: pageParam.toString(),
      }).toString();

      const response = await Fetch<IResponse>({
        method: "GET",
        url,
      });

      // Ensure the response data has the expected structure
      if (!response.data || !Array.isArray(response.data.room_categories)) {
        throw new Error("Invalid response format");
      }

      return response;
    },

    getNextPageParam: (lastPage) => {
      // Check if there's data and if nextCursor exists
      if (!lastPage.data.room_categories.length || !lastPage.data.nextCursor) {
        return undefined; // Returns undefined to signal no more pages
      }
      return lastPage.data.nextCursor;
    },
    initialPageParam: 0,
  });
}