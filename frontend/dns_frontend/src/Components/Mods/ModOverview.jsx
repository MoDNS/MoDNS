import { FormControlLabel, IconButton, Switch, Typography } from '@mui/material';
import React from 'react';
import { PropTypes } from 'prop-types';
import { Box } from '@mui/system';
import { useTheme } from '@emotion/react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState } from 'react';
import { enabledisableMod } from '../../API/getsetAPI';
import SettingsDialog from '../SettingsDialog';

const ModOverview = ({ uuid, name, description, home, implementations, interceptPosition, enabled }) => {

    const theme = useTheme();
    const [modEnabled, setModEnabled] = useState(enabled);
    const [dialogOpen, setDialogStatus] = useState(false);

    const handleModSwitch = () => {
        enabledisableMod(uuid, !modEnabled);
        setModEnabled(!modEnabled);
    }

    const listImplementations = () => {
        let output = "";
        const num = implementations.length;

        for(var i = 0; i < num; i++) {
            output += implementations[i];
            if (i !== num - 1) {
                output += ", ";
            }
        }
        return output;
    }


    return (
        <Box
            sx={{
                marginY: 1,
                borderRadius: 3, 
                paddingY: 1,
                paddingX: 3,
                display: 'flex',
                flexDirection: 'row',
                flexGrow: 1,
                border: `4px solid ${theme.palette.primary.dark}`,
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} >
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        sx={{ fontSize: 35, flexShrink: 0, }}
                    >
                        {name}
                    </Typography>
                    <Typography
                        noWrap={false}
                        sx={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'right', flexGrow: 1, padding: 1, }}
                    >
                        {description}
                    </Typography>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row'}} >
                    <Typography
                        fontWeight={"bold"}
                        marginRight={2}
                    >
                        Implementations:
                    </Typography>
                    <Typography
                    > 
                        {
                        listImplementations()
                        }
                    </Typography>
                </div>
            </div>
            <IconButton
                sx={{ marginLeft: 1, }}
                onClick={() => setDialogStatus(true)}
            >
                <SettingsIcon 
                    fontSize='large' 
                    sx={{ 
                        transitionProperty: 'transform',
                        '&:hover': {
                            transform: 'rotate(90deg)',
                          },
                    }}
                />
            </IconButton>
            <FormControlLabel 
                control={
                    <Switch 
                        checked={modEnabled}
                        onChange={handleModSwitch}
                    />
                } 
                sx={{ marginRight: 0, marginY: 'auto',marginLeft: 1 }}
            />



            <SettingsDialog
                uuid={uuid}
                name={name}
                description={description}
                home={home}
                implementations={implementations}
                dialogOpen={dialogOpen}
                setDialogStatus={setDialogStatus}
                handleModSwitch={handleModSwitch}
                modEnabled={modEnabled}
                 />
        </Box>
    );
};

export default ModOverview;

ModOverview.propTypes = {
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    home: PropTypes.string.isRequired,
    implementations: PropTypes.array.isRequired,
    interceptPosition: PropTypes.number,
    enabled: PropTypes.bool.isRequired,
};
