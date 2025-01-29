// Import necessary modules and components
import { Person } from "@mui/icons-material";
import { Box, Grid2 as Grid, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React, { RefObject, memo, useEffect, useMemo } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  GridChildComponentProps,
  GridOnScrollProps,
  VariableSizeGrid,
  areEqual,
} from "react-window";
import {
  IRateCalendar,
  IRoomCategoryCalender,
  IRoomInventory,
} from "../(hooks)/useRoomRateAvailabilityCalendar";
import RoomRateCell from "./RateCell";
import RoomRateRestrictionsCell from "./RestrictionsCell";
import RoomInventoryStatusCell from "./StatusCell";
// import RateCalendarGrid from "@/components/RateCalenderGrid/CalenderGrid";

// const RoomRateCell = dynamic(()=> import("./RateCell"),{ssr: false})
// const RoomRateRestrictionsCell = dynamic(()=> import("./RestrictionsCell"),{ssr: false})
// Define the props for the RoomRateAvailabilityCalendar component
interface IProps {
  InventoryRefs: RefObject<Array<RefObject<VariableSizeGrid | null>>>;
  handleCalenderScroll: ({ scrollLeft }: GridOnScrollProps) => void;
  index: number;
  isLastElement: boolean;
  room_category: IRoomCategoryCalender;
}

// Define the data structure for the grid
interface IGridData {
  type: string;
  row: string;
  rate_plan?: {
    id: number;
    name: string;
    calendar: IRateCalendar[];
  };
}

// Component to render the room rate availability calendar
export default function RoomRateAvailabilityCalendar(props: IProps) {
  const theme = useTheme(); // Get the theme for styling
  const InventoryRef = useMemo(() => React.createRef<VariableSizeGrid>(), []);

  // Dynamically add the current ref to the parent component's refs array
  useEffect(() => {
    props.InventoryRefs.current[props.index] = InventoryRef;
    return () => {
      props.InventoryRefs.current[props.index].current = null;
    };
  }, [InventoryRef, props.InventoryRefs, props.index]);



  // Memoize the grid data to avoid unnecessary re-renders
  const calendarGridData = useMemo(() => {
    const data: Array<IGridData> = [
      { type: "inventory", row: "status" },
      { type: "inventory", row: "available" },
      { type: "inventory", row: "booked" },
      ...props.room_category.rate_plans.flatMap((ratePlan) => [
        { type: "rate_calendar", row: "rate", rate_plan: ratePlan },
        {
          type: "rate_calendar",
          row: "min_length_of_stay",
          rate_plan: ratePlan,
        },
        {
          type: "rate_calendar",
          row: "reservation_deadline",
          rate_plan: ratePlan,
        },
      ]),
    ];

    return data;
  }, [props.room_category.rate_plans]);

  // Component to render each cell in the grid
  const RateCalendarGrid: React.FC<GridChildComponentProps> = memo(
    function RateCalendarGridFC({ columnIndex, rowIndex, style, data }) {
      const { rowData, inventoryData } = data as {
        rowData: Array<IGridData>;
        inventoryData: Array<IRoomInventory>;
      };

      const row = rowData[rowIndex];
      const inventory = inventoryData[columnIndex];

      const isInventoryRow = row.type === "inventory";

      const baseStyle = useMemo(
        () => ({
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          pr: 1,
          fontSize: "12px",
          fontWeight: "bold",
          borderLeft: "1px solid",
          borderBottom: "1px solid",
          borderColor: inventory.status
            ? theme.palette.divider
            : theme.palette.error.dark,
          color: inventory.status
            ? "inherit"
            : theme.palette.background.default,
          backgroundColor: inventory.status
            ? "inherit"
            : theme.palette.error.light,
        }),
        [inventory.status, theme.palette]
      );

      if (isInventoryRow) {
        switch (row.row) {
          case "status":
            return (
              <Box style={style}>
                <RoomInventoryStatusCell
                  inventory={inventory}
                  room_category={props.room_category}
                />
              </Box>
            );
          case "available":
            return (
              <Box style={style}>
                <Box sx={baseStyle}>{inventory.available}</Box>
              </Box>
            );
          default:
            return (
              <Box style={style}>
                <Box sx={baseStyle}>{inventory.booked}</Box>
              </Box>
            );
        }
      } else {
        const ratePlan = row.rate_plan!;
        const rateCalendar = ratePlan.calendar[columnIndex];

        const renderRateCell = useMemo(() => {
          switch (row.row) {
            case "rate":
              return (
                <RoomRateCell
                  room_category={props.room_category}
                  rate_plan={ratePlan}
                  room_rate={rateCalendar}
                  inventory={inventory}
                />
              );
            case "min_length_of_stay":
              return (
                <RoomRateRestrictionsCell
                  type="min_length_of_stay"
                  room_category={props.room_category}
                  rate_plan={ratePlan}
                  room_rate={rateCalendar}
                  inventory={inventory}
                />
              );
            default:
              return (
                <RoomRateRestrictionsCell
                  type="reservation_deadline"
                  room_category={props.room_category}
                  rate_plan={ratePlan}
                  room_rate={rateCalendar}
                  inventory={inventory}
                />
              );
          }
        }, [row.row, props.room_category, ratePlan, rateCalendar, inventory]);

        return <Box style={style}>{renderRateCell}</Box>;
      }
    },
    areEqual
  );
  // const RateCalendarGrid = React.memo(
  //   ({ columnIndex, rowIndex, style }:any) => (
  //     <div style={style}>
  //       <div>Row{rowIndex}</div>
  //       <div>Column{columnIndex}</div>
  //     </div>
  //   ),
  //   areEqual
  // );

  // Style the VariableSizeGrid to hide the scrollbar if it's not the last element
  const StyledVariableSizeGrid = styled(VariableSizeGrid)(
    props.isLastElement
      ? {}
      : {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }
  );

  return (
    <React.Fragment key={props.index}>
      <Grid container sx={{ py: 4, px: 4 }}>
        <Grid size={10}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
            }}
          >
            {props.room_category.name}
          </Typography>
        </Grid>
        <Grid size={2}></Grid>
      </Grid>
      <Grid
        container
        sx={{
          height: props.isLastElement
            ? 90 + props.room_category.rate_plans.length * 120 + 10
            : 90 + props.room_category.rate_plans.length * 120,
        }}
      >
        <Grid
          sx={{
            pl: 4,
            fontSize: "12px",
            fontWeight: 500,
          }}
          container
          size={{
            xs: 4,
            sm: 4,
            md: 3,
            lg: 2,
            xl: 2,
          }}
        >
          <Grid
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              height: 30,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
            }}
            size={12}
          >
            Room status
          </Grid>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              height: 30,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
            }}
            size={12}
          >
            Rooms to sell
          </Grid>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              height: 30,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
            }}
            size={12}
          >
            Net booked
          </Grid>
          {props.room_category.rate_plans.map((rate_plan, key) => (
            <>
              <Grid
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  flexDirection: "column",
                  height: 60,
                  borderBottom: "1px solid",
                  borderColor: theme.palette.divider,
                }}
                size={12}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {rate_plan.name}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Person fontSize="small" />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      ml: 0.5,
                    }}
                  >
                    {props.room_category.occupancy}
                  </Typography>
                </Box>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  height: 30,
                  borderBottom: "1px solid",
                  borderColor: theme.palette.divider,
                }}
                size={12}
              >
                Min. length of stay
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  height: 30,
                  borderBottom: "1px solid",
                  borderColor: theme.palette.divider,
                }}
                size={12}
              >
                Min. advance reservation
              </Grid>
            </>
          ))}
        </Grid>

        <Grid
          container
          size={{
            xs: 8,
            sm: 8,
            md: 9,
            lg: 10,
            xl: 10,
          }}
        >
          <AutoSizer>
            {({ height, width }) => (
              <StyledVariableSizeGrid
                height={height}
                width={width}
                columnCount={props.room_category.inventory_calendar.length}
                columnWidth={() => 74}
                rowCount={calendarGridData.length}
                rowHeight={(index: number) => {
                  if (calendarGridData[index].type === "inventory") {
                    return 30;
                  } else {
                    if (calendarGridData[index].row === "rate") {
                      return 60;
                    } else {
                      return 30;
                    }
                  }
                }}
                onScroll={props.handleCalenderScroll}
                ref={InventoryRef}
                itemData={{
                  rowData: calendarGridData,
                  inventoryData: props.room_category.inventory_calendar,
                  room_category: props.room_category
                }}
              >
                {RateCalendarGrid}
              </StyledVariableSizeGrid>
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
