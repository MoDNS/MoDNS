import { Box } from "@mui/material";
import { Button, IconButton, Typography } from "@mui/material";
import React from "react";
import MainBox from "../Components/MainBox";

// import PieChart from "../Components/DashboardComponents/PieChart";

// To be removed later
import {
  mockDataFruits,
  mockTransactions,
  mockPieData,
  mockBarData,
  mockLineData,
} from "../Tmp/TempData";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailIcon from "@mui/icons-material/Email";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import TrafficIcon from "@mui/icons-material/TrafficOutlined";
import StatBox from "../Components/DashboardComponents/StatBox";
import PieChart from "../Components/DashboardComponents/PieChart";
import LineChart from "../Components/DashboardComponents/LineChart";
import BarChart from "../Components/DashboardComponents/BarChart";

const Dashboard = () => {
  return (
    <MainBox title={"Dashboard"}>
      {/* Grid */}
      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px">
        {/* Row 1 */}
        <Box
          gridColumn="span 3"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title="12,316"
            subtitle="DNS Requests"
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
            subtitle="DNS Errors"
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
            subtitle="Cookies"
            progress=".50"
            increase="+0%"
            icon={<DownloadOutlinedIcon />}
          />
        </Box>
        <Box
          gridColumn="span 6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="300px"
        >
          <LineChart data={mockLineData} />
        </Box>
        <Box
          gridColumn="span 4"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="300px"
        >
          <PieChart data={mockDataFruits} />
        </Box>
        <Box
          gridColumn="span 6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="300px"
        >
          <BarChart data={mockBarData} />
        </Box>
      </Box>
    </MainBox>
  );
};

export default Dashboard;
