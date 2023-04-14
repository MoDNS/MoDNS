import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, progressCircle }) => {
  return (
    <Box width="100%" m="20px 20px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography variant="h4" fontWeight="bold" sx={{ color: "white" }}>
            {title}
          </Typography>
          { progressCircle && <Box>
            <ProgressCircle progress={progress} />
          </Box>}
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" fontStyle="Bold" sx={{ color: "white" }}>
              {subtitle}
            </Typography>
            <Typography variant="h5" fontStyle="italic" sx={{ color: "white" }}>
              {increase}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default StatBox;
