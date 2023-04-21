import { ResponsiveLine } from "@nivo/line";
import { Typography, useTheme } from "@mui/material";
import { PropTypes } from 'prop-types';

const LineChart = ({ label, data, height }) => {
  const theme = useTheme();

  return (
    <div style={{ direction: 'column', width: '100%', }}>
      <Typography
        fontSize={24}
      >
        {label}
      </Typography>
      <ResponsiveLine
        data={data.data || []}
        height={height}
        margin={{ top: 20, right: 110, bottom: 70, left: 70 }}
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
          legend: data.x_axis_label || '',
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
          legend: data.y_axis_label || '',
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
              fontSize: "10pt",
            },
          },
        }}
      />
      </div>
  );
};

export default LineChart;

LineChart.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

LineChart.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};
