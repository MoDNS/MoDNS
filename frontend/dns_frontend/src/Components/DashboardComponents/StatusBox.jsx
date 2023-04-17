import { Box, Typography } from "@mui/material";

const StatusBox = ({ title, status, height }) => {
  return (
    <Box width="100%" m="20px 20px" height={height} >
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "white" }}>
            {title}
          </Typography>

          <Box display="flex" justifyContent="space-between">
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "white " }}
            >
                {status}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default StatusBox;
