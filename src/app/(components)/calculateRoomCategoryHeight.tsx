import { IRoomCategoryCalender } from '../(hooks)/useRoomRateAvailabilityCalendar';

// Types for grid data
interface IGridData {
  type: 'inventory' | 'rate_calendar';
  row: 'status' | 'available' | 'booked' | 'rate' | 'min_length_of_stay' | 'reservation_deadline';
  rate_plan?: {
    id: number;
    name: string;
    calendar: Array<any>; // Replace with proper rate calendar type if available
  };
}

// Types for paginated data
interface IPage {
  data: {
    room_categories: IRoomCategoryCalender[];
  };
}

// Constants for precise height measurements
const HEIGHTS = {
  ROOM_CATEGORY: {
    HEADER: 64,        // Room category title height
    PADDING: 32,       // Padding around header (16px top + 16px bottom)
  },
  INVENTORY: {
    ROW_HEIGHT: 30,    // Height for each inventory row
    ROWS: 3,           // Number of inventory rows (status, available, booked)
    TOTAL: 90,         // Pre-calculated (30 * 3)
  },
  RATE_PLAN: {
    HEADER: 60,        // Rate plan name + occupancy info
    ROW_HEIGHT: 30,    // Height for restriction rows
    ROWS_PER_PLAN: 2,  // Number of restriction rows (min stay + reservation deadline)
    TOTAL: 120,        // Pre-calculated (60 + 30 * 2)
  },
  SPACING: {
    SECTION_GAP: 16,   // Gap between major sections
    BOTTOM_MARGIN: 24, // Bottom margin for the container
  }
} as const;

// Utility function to find category from paginated data
export const findCategory = (
  index: number, 
  pages?: IPage[]
): IRoomCategoryCalender | null => {
  if (!pages) return null;
  
  let currentIndex = 0;
  
  for (const page of pages) {
    const categories = page.data.room_categories;
    for (const category of categories) {
      if (currentIndex === index) {
        return category;
      }
      currentIndex++;
    }
  }
  
  return null;
};

// Calculate height for a single room category
export const calculateRoomCategoryHeight = (
  ratePlansCount: number, 
  isLastElement: boolean = false
): number => {
  const baseHeight = 
    // Room category header
    HEIGHTS.ROOM_CATEGORY.HEADER +
    HEIGHTS.ROOM_CATEGORY.PADDING +
    
    // Inventory section
    HEIGHTS.INVENTORY.TOTAL +
    HEIGHTS.SPACING.SECTION_GAP +
    
    // Rate plans section (multiplied by number of rate plans)
    (ratePlansCount * HEIGHTS.RATE_PLAN.TOTAL) +
    
    // Additional spacing for last element
    (isLastElement ? HEIGHTS.SPACING.BOTTOM_MARGIN : 0);

  // Ensure minimum height and return
  return Math.max(baseHeight, 400);
};

// Calculate grid row height based on content type
export const calculateGridRowHeight = (rowData: IGridData | null): number => {
  if (!rowData) return HEIGHTS.RATE_PLAN.HEADER; // Default fallback

  switch (rowData.type) {
    case 'inventory':
      return HEIGHTS.INVENTORY.ROW_HEIGHT;
    case 'rate_calendar':
      return rowData.row === 'rate' 
        ? HEIGHTS.RATE_PLAN.HEADER 
        : HEIGHTS.RATE_PLAN.ROW_HEIGHT;
    default:
      return HEIGHTS.RATE_PLAN.ROW_HEIGHT;
  }
};

// Calculate total height for virtualized list
export const calculateVirtualizedListHeight = (
  roomCategory: IRoomCategoryCalender | null, 
  isLastElement: boolean
): number => {
  if (!roomCategory) return 800; // Minimum height for loading state

  const ratePlansCount = roomCategory.rate_plans?.length || 0;
  return calculateRoomCategoryHeight(ratePlansCount, isLastElement);
};

// Type for the height cache
export interface HeightCache {
  [key: number]: number;
}