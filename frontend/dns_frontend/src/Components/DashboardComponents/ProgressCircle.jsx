import { Box } from "@mui/material";

const ProgressCircle = ({ progress = 75, size = "40"}) => {

    const angle = progress / 100 * 360;

    return(
        <div style={{ marginTop: 'auto', marginBottom: 'auto' }} >
            <Box
                sx={{
                    background: `radial-gradient(red 0%, transparent 0%),
                        conic-gradient(transparent 0deg ${angle}deg, red ${angle}deg 360deg),
                        green`,
                    borderRadius : "50%",
                    width : `${size}px`,
                    height : `${size}px`
                }}
    
            />
        </div>
    )

}

export default ProgressCircle;