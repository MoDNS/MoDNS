import { useTheme } from "@emotion/react";
import { Box, Icon, Typography } from "@mui/material";
import { PropTypes } from 'prop-types';

import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const StatusBox = ({ label, data, height }) => {
  
  const theme = useTheme();
  return (
    <Box width="100%" m="20px 20px" height={height} >
      <div>
        <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
          {label}
        </Typography>

        <Box display="flex">
            <Icon sx={{ marginLeft: 1, marginRight: 1 }} >
              {
                data && data.status_good ? <CheckIcon /> : <ErrorOutlineIcon />
              }
            </Icon>
          <div>
          <Typography
            fontWeight="bold"
            fontSize={24}
            sx={{ color: theme.palette.text.primary }}
          >
              {data && data.status_label}
          </Typography>
          </div>
        </Box>
      </div>
    </Box>
  );
};
export default StatusBox;

StatusBox.propTypes = {
  label: PropTypes.string,
  data: PropTypes.object,
  height: PropTypes.number,
};

StatusBox.defaultProps = {
  label: "Insert Label",
  data: {},
  height: 300,
};
