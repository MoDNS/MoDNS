import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";

const LineChart = ({ data }) => {
  const theme = useTheme();

  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 70, left: 60 }}
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
        tickPadding: 6,
        tickRotation: 45,
        legend: "transportation",
        legendOffset: 60,
        legendPosition: "middle",
        fill: theme.palette.text.primary,
        fontSize: "12pt",
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "count",
        legendOffset: -50,
        legendPosition: "middle",
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      tooltip={({ point }) => {
        return (
          <div
            style={{
              background: theme.palette.primary.dark,
              padding: ".13rem .25rem",
              border: theme.palette.primary.dark,
              text: theme.palette.primary.text,
            }}
          >
            <div>Time: {point.x}</div>
            <div>Value: {point.y}</div>
          </div>
        );
      }}
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
              stroke: theme.palette.background.default,
            },
            text: {
              fill: theme.palette.text.primary,
              fontSize: "10pt",
            },
          },
          legend: {
            text: {
              fill: theme.palette.text.primary,
              fontSize: "10pt",
            },
          },
        },
        grid: {
          line: {
            stroke: theme.palette.primary.dark,
            strokeWidth: 2,
            strokeDasharray: "4 4",
          },
        },
        legends: {
          text: {
            fill: theme.palette.text.primary,
            fontSize: "10pt",
          },
        },
      }}
    />
  );
};

export default LineChart;
