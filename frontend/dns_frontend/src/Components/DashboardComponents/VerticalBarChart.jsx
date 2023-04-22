import { ResponsiveBar } from "@nivo/bar";
import { Typography, useTheme } from "@mui/material";
import { PropTypes } from 'prop-types';

const VerticalBarChart = ({ label, data, height }) => {
  const theme = useTheme();
  
  const getLegendFromSample = () => {
    let theData = data.data ? data.data[0] : {}
    theData = Object.keys(theData);
    theData.splice(theData.indexOf(data ? data.index_by : ''), 1);
    return theData;
  }

  return (
    <div style={{ direction: 'column', width: '100%', }}>
      <Typography
        variant="h4" 
        fontWeight="bold"        
      >
        {label}
      </Typography>
      <ResponsiveBar
        data={data.data || []}
        height={height}
        keys={getLegendFromSample()}
        indexBy={data.index_by || ''}
        margin={{ top: 20, right: 140, bottom: 50, left: 60 }}
        padding={0.3}
        groupMode="grouped"
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "nivo" }}
        enableLabel={false}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: data.x_axis_label || '',
          legendPosition: "middle",
          legendOffset: 36,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: data.y_axis_label || '',
          legendPosition: "middle",
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={theme.palette.primary.dark}
        isInteractive={false}
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
              fontSize: "12pt",
            },
          },
        }}
      />
    </div>
  );
};

export default VerticalBarChart;

VerticalBarChart.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

VerticalBarChart.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};