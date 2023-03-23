import { Box } from "@mui/material";
import { Button, IconButton, Typography } from "@mui/material";
import React from "react";
import MainBox from "../Components/MainBox";

// import PieChart from "../Components/DashboardComponents/PieChart";

// To be removed later
import { mockTransactions } from "../Tmp/TempData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import TrafficIcon from "@mui/icons-material/TrafficOutlined";
import StatBox from "../Components/DashboardComponents/StatBox";

const Dashboard = () => {
  return (
    <MainBox title={"Dashboard"}>
      {/* Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
      >
        {/* Row 1 */}
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="12,316"
            Subtitle="DNS Requests"
            progress=".60"
            increase="+12%"
            icon={<TrafficIcon />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="11,111"
            Subtitle="DNS Errors"
            progress=".20"
            increase="+3%"
            icon={<ErrorOutline />}
          />
        </Box>
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="22,222"
            Subtitle="Cookies"
            progress=".50"
            increase="+0%"
            icon={<DownloadOutlinedIcon />}
          />
        </Box>
      </Box>
    </MainBox>
  );
};

export default Dashboard;
