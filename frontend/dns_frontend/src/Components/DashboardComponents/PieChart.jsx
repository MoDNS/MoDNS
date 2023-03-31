import { ResponsivePie } from "@nivo/pie";
// import { mockDataFruits as data } from "../../Tmp/TempData.js"
import { useTheme } from "@mui/material";

const PieChart = ({ data }) => {
  const theme = useTheme();
  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={4}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#ffffff"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={theme.palette.background.default}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor="black"
      isInteractive={false}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "rgba(255, 255, 255, 0.3)",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      fill={[
        {
          match: {
            id: "ruby",
          },
          id: "dots",
        },
        {
          match: {
            id: "c",
          },
          id: "dots",
        },
        {
          match: {
            id: "go",
          },
          id: "dots",
        },
        {
          match: {
            id: "python",
          },
          id: "dots",
        },
        {
          match: {
            id: "scala",
          },
          id: "lines",
        },
        {
          match: {
            id: "lisp",
          },
          id: "lines",
        },
        {
          match: {
            id: "elixir",
          },
          id: "lines",
        },
        {
          match: {
            id: "javascript",
          },
          id: "lines",
        },
      ]}
      legends={[
        {
          anchor: "right",
          direction: "column",
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 6,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: "#FFFFFF",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#FFFFFF",
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
              stroke: theme.palette.background.default
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
            stroke: theme.palette.background.default,
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

export default PieChart;
