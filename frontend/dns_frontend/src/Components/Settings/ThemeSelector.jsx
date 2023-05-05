import { FormControlLabel, Radio, RadioGroup, useTheme } from '@mui/material';
import React from 'react';
import SquareIcon from '@mui/icons-material/Square';
import themes from '../../themes';
import { PropTypes } from 'prop-types';

const ThemeSelector = ({ selectedTheme, setSelectedTheme }) => {

    const theme = useTheme();

    const handleChange = (event) => {
        setSelectedTheme("theme", event.target.value);
    };

    const themeSelectionRows = [];

    Object.keys(themes).forEach(function(key) {
        themeSelectionRows.push(
            <FormControlLabel
                value={key}
                key={key}
                label={
                    <div style={{ display: 'flex', flexDirection: 'row' }} >
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.primary.main, color: themes[key].palette.primary.main, border: '2px solid', borderColor: theme.palette.primary.dark }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.secondary.main, color: themes[key].palette.secondary.main, border: '2px solid', borderColor: theme.palette.primary.dark }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.text.primary, color: themes[key].palette.text.primary, border: '2px solid', borderColor: theme.palette.primary.dark }} />
                        <SquareIcon sx={{ fontSize: 30, margin: 0.5, backgroundColor: themes[key].palette.background.default, color: themes[key].palette.background.default, border: '2px solid', borderColor: theme.palette.primary.dark }} />
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
            <RadioGroup >
                {themeSelectionRows}
            </RadioGroup>
        </>
    );
};

export default ThemeSelector;


ThemeSelector.propTypes = {
    setTheme: PropTypes.func.isRequired,
};

ThemeSelector.defaultProps = {
    setTheme: () => {},
};