import { Button, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React from 'react';
import SquareIcon from '@mui/icons-material/Square';
import themes from '../../themes';
import { getThemeStorage, setThemeStroage } from '../../scripts/getsetThemeLocal';


const ChangePassword = () => {
    return (
        <>
            <Typography
                sx={{ 
                    fontSize: 25,
                }}
            >
                Theme Selector
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexGrow: 1, }} >
                <RadioGroup >
                    {themeSelectionRows}
                </RadioGroup>
                
            </div>

            <Button
                variant={'contained'}
                sx={{  position: 'sticky', bottom: 0, }}
                onClick={ () => handleApplyChanges() }
            >
                Apply Changes
            </Button>  
        </>
    );
};

export default ChangePassword;