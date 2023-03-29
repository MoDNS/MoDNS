import { ResponsiveLine } from "@nivo/line";
import { useTheme } from '@mui/material';

const LineChart = ({ data }) => {
  const theme = useTheme();

  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "transportation",
        legendOffset: 36,
        legendPosition: "middle",
        fill: "white",
        fontSize: "12pt"
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "count",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: theme.palette.text,
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      // This is for themeing the stuff
      theme={{
        axis: {
          ticks: {
            line: {
              stroke: "black"
            },
            text: {
              fill: "white",
              fontSize: "8pt"
            }
          },
          legend: {
            text: {
              fill: "white",
              fontSize: "8pt"
            }
          }
        },
        grid: {
          line: {
            stroke: "black",
            strokeWidth: 2,
            strokeDasharray: "4 4"
          }
        },
        legends:{
          text: {
            fill: "white",
            fontSize: "12pt"
          }
        },
      }}
    />
  );
};

export default LineChart;
