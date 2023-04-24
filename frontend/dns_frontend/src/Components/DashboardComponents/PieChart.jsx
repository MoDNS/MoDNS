import { ResponsivePie } from "@nivo/pie";
import { Typography, useTheme } from "@mui/material";
import { PropTypes } from 'prop-types';

const PieChart = ({ label, data, height }) => {
  const theme = useTheme();

  return (
    <div style={{ direction: 'column', width: '100%', }}>
      <Typography
        variant="h4" 
        fontWeight="bold"        
      >
        {label}
      </Typography>
      <ResponsivePie
        data={data.data || []}
        height={height}
        margin={{ top: 20, right: 100, bottom: 10, left: 0 }}
        innerRadius={0.5}
        padAngle={0.7}
        sortByValue
        cornerRadius={3}
        enableArcLinkLabels={false}
        colors={{  scheme: 'nivo' }}
        isInteractive={false}
        legends={[
          {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 140,
              translateY: 0,
              itemsSpacing: 6,
              itemWidth: 170,
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
                  stroke: theme.palette.primary.dark,
                },
                text: {
                  fill: theme.palette.text.primary,
                  fontSize: "8pt"
                }
              },
              legend: {
                text: {
                  fill: theme.palette.text.primary,
                  fontSize: "8pt"
                }
              }
            },
            grid: {
              line: {
                stroke: theme.palette.primary.dark,
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

PieChart.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

PieChart.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};
