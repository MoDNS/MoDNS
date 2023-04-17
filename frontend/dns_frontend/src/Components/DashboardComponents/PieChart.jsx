import { ResponsivePie } from "@nivo/pie";
// import { mockDataFruits as data } from "../../Tmp/TempData.js"
import { useTheme } from "@mui/material";

const PieChart = ({ data, height }) => {
  const theme = useTheme();
  return (
      <div style={{ height: height }} >

          <ResponsivePie
            data={data}
            margin={{ top: 20, right: 100, bottom: 10, left: 0 }}
            innerRadius={0.5}
            padAngle={0.7}
            sortByValue
            cornerRadius={3}
            enableArcLinkLabels={false}
            isInteractive={false}
            legends={[
              {
                  anchor: "bottom-right",
                  direction: "column",
                  justify: false,
                  translateX: 140,
                  translateY: 0,
                  itemsSpacing: 6,
                  itemWidth: 150,
                  itemHeight: 18,
                  itemTextColor: `${theme.palette.text.primary}`,
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
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
                    fill: theme.palette.text.primary,
                    fontSize: "12pt"
                  }
                },
              }}
          />
      </div>
  );
};

export default PieChart;
