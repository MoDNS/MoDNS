import { Button, FormControlLabel, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React from 'react';
import SquareIcon from '@mui/icons-material/Square';
import themes from '../../themes';
import { getThemeStorage, setThemeStroage } from '../../scripts/getsetThemeLocal';

const ThemeSelector = ({ setTheme }) => {

    const theme = useTheme();

    const [selectedTheme, setSelectedTheme] = React.useState(getThemeStorage());

    const handleChange = (event) => {
        setSelectedTheme(event.target.value);
    };

    const themeSelectionRows = [];

    const handleApplyChanges = () => {
        setTheme(selectedTheme);
        setThemeStroage(selectedTheme);
    }

    Object.keys(themes).forEach(function(key) {
        themeSelectionRows.push(
            <FormControlLabel
                value={key}
                key={key}
                label={
                    <div style={{ display: 'flex', flexDirection: 'row' }} >
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.primary.main, color: themes[key].palette.primary.main, border: '2px solid', borderColor: theme.palette.background.default }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.secondary.main, color: themes[key].palette.secondary.main, border: '2px solid', borderColor: theme.palette.background.default }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.text.primary, color: themes[key].palette.text.primary, border: '2px solid', borderColor: theme.palette.background.default }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.background.default, color: themes[key].palette.background.default, border: '2px solid', borderColor: theme.palette.background.default }} />
                    </div>
                }
                control={
                    <Radio 
                        checked={selectedTheme === key}
                        onChange={ (e) => handleChange(e)}
                        sx={{ 
                            '& .MuiSvgIcon-root': {
                                fontSize: 35,
                            },
                        }}
                    />
                }
            />
        )
    });

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

export default ThemeSelector;