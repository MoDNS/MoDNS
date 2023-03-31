import { Box } from "@mui/material";

const ProgressCircle = ({ progress = ".75", size = "40"}) => {

    const angle = progress * 360;

    return(
        <Box
        
            sx={{
                background: `radial-gradient(red 0%, transparent 0%),
                    conic-gradient(transparent 0deg ${angle}deg, green ${angle}deg 360deg),
                    blue`,
                borderRadius : "50%",
                width : `${size}px`,
                height : `${size}px`
            }}

        />
    )

}

export default ProgressCircle;