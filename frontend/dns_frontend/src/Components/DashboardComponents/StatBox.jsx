import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase}) => {
    return(
        <Box width = "100%" m="0 30px">
            <Box display="flex" justifyContent="space-between">
                <Box>
                    {icon}
                    <Typography variant="h4" fontWeight="bold" sx={{color: "white"}}>
                        {title}
                    </Typography>
                    <Box>
                        <ProgressCircle progress={progress}/>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="h5" sx={{color: "white"}}>
                            {subtitle}
                        </Typography>
                        <Typography variant="h5" fontStyle="italic" sx={{color: "white"}}>
                            {increase}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
export default StatBox;