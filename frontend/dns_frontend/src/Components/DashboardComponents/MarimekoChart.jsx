import { ResponsiveBar } from "@nivo/bar";
// import { mockDataFruits as data } from "../../Tmp/TempData.js"
import { useTheme } from "@mui/material";

const MarimekoChart = ({ data }) => {
  const theme = useTheme();
  return (
    <ResponsiveBar
      data={data}
      keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
      indexBy="country"
      margin={{ top: 50, right: 130, bottom: 50, left: 65 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      isInteractive={false}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "country",
        legendPosition: "middle",
        legendOffset: 36,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "food",
        legendPosition: "middle",
        legendOffset: -45,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={theme.palette.primary.dark}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
        },
      ]}
      role="application"
      // This is for themeing the stuff
      theme={{
        axis: {
          ticks: {
            line: {
              stroke: theme.palette.primary.dark,
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

export default MarimekoChart;