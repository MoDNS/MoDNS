import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";
import { useTheme } from "@emotion/react";
import { PropTypes } from 'prop-types';

const StatBox = ({ label, data, height }) => {
  const theme = useTheme();
  return (
    <Box width="100%" p="20px 20px" height={height} >
        <div style={{ display: 'flex', flexDirection: 'column' }} >
          {/* {icon} */}
            <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              {label}
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'row' }} >
              { data && data.progress && <ProgressCircle progress={data.progress} /> }
              <div style={{ marginLeft: 'auto' }} >
                <Typography align="right" fontSize={22} fontStyle="Bold" sx={{ color: theme.palette.text.primary, paddingRight: 1 }}>
                  {data.statistic}
                </Typography>
                {
                  data && data.differenceFromLast && <Typography align="right" fontStyle="italic" sx={{ color: theme.palette.text.primary, paddingRight: 1 }}>
                    {data.differenceFromLast >= 0 ? "+" : ""}{data.differenceFromLast}
                  </Typography>
                }
              </div>
            </div>
        </div>
    </Box>
  );
};
export default StatBox;

StatBox.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

StatBox.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};