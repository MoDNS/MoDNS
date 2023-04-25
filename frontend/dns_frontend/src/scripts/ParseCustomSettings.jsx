import { Button, Checkbox, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { PropTypes } from 'prop-types';
import { configurePlugin, executePluginCommand, getPluginConfig } from "../API/getsetAPI";


const maxWidth = 2;

export const ParseCustomSettings = ({uuid, settingsJson, buildMode}) => {
    let settingsDict = {}
    let empties = {
        'switch': false,
        'input': "",
        'checkbox': [],
    }
    settingsJson.forEach(setting => {
        if ('key_name' in setting) {
            settingsDict[setting.key_name] = buildMode ? empties[setting["type"]] : getPluginConfig(uuid, setting.key_name);
        }
    });
    const [customSettings, setCustomSettings] = useState({...settingsDict});
    settingsDict = null;
    
    const handleCustSettingsChange = (settingUuid, newValue, applyNow) => {
        let settingsDict = customSettings;
        settingsDict[settingUuid] = newValue;
        setCustomSettings({...settingsDict});

        if (!buildMode && applyNow) {
            configurePlugin(uuid, settingUuid, newValue);
        }
    }

    if (!settingsJson) {
        return (
            <div style={{ padding: 30, display: 'flex', flexDirection: 'column' }} >
                <Typography
                    fontSize={22}
                    noWrap={false}
                    align={'center'}
                >
                    You can customize what settings show up here.
                </Typography>
                <Typography
                    fontSize={22}
                    noWrap={false}
                    align={'center'}
                >
                    Either read the documentation or use our settings builder.
                </Typography>
                <Button
                    sx={{ marginX: 'auto', marginTop: 2 }}
                    variant="contained"
                >
                    Settings Builder
                </Button>
            </div>
        )
    }

    let rows = [];
    var sub_elements = [];
    let key = 0;
    let children;
    for (let index = 0; index < settingsJson.length; index++) {

        let settingKey = settingsJson[index]["key_name"];

        switch (settingsJson[index].type) {
            case 'title':
                sub_elements.push(
                    <Typography 
                        key={key}
                        fontSize={28}
                    > 
                        {settingsJson[index].display_text} 
                    </Typography>
                );
                break;

            case 'text':
                sub_elements.push(
                    <Typography 
                        key={key}   
                        fontSize={22}
                        width={settingsJson[index].wide ? '100%' : '50%'}
                        noWrap={false}
                        sx={{ wordWrap: 'break-word', paddingLeft: 2, paddingRight: 2 }}
                    > 
                        {settingsJson[index].display_text} 
                    </Typography>
                );
                break;

            case 'switch':
                sub_elements.push(
                    <FormControlLabel
                        key={key}
                        label={<Typography fontSize={22} > {settingsJson[index].display_text} </Typography>}
                        labelPlacement={'start'}
                        sx={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, justifyContent: 'center', paddingLeft: 15, paddingRight: 15  }}
                        control={
                            <Switch 
                                sx={{ marginX: 3, }}
                                checked={ customSettings[settingKey] ? customSettings[settingKey] : false }
                                onChange={() => {
                                    handleCustSettingsChange(settingKey, !customSettings[settingKey], true)
                                }}
                            />
                        } 
                    />
                );
                break;

            case 'input':
                sub_elements.push(
                    <div key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, display: 'flex', flexDirection: 'row', paddingLeft: 15, paddingRight: 15  }} >
                        <Typography
                            sx={{ 
                                fontSize: 22,
                                marginRight: 'auto',
                            }}
                            >
                            {settingsJson[index].display_text}
                        </Typography>
                        <TextField
                            onFocus={ (e) => e.target.select() }
                            value={ customSettings[settingKey] ? customSettings[settingKey] : "" }
                            onInput={ e => handleCustSettingsChange(settingKey, e.target.value, false) }
                            sx={{ width: settingsJson[index].wide ? 250 : 140, marginRight: 2,  }}
                            
                        />
                        <div sx={{ marginBottom: 'auto' }} >
                            <Button
                                variant="contained"
                                sx={{ paddingBottom: 'auto', }}
                                onClick={() => handleCustSettingsChange(settingKey, customSettings[settingKey], true)}
                            >
                                Apply
                            </Button>
                        </div>
                    </div>
                )
                break;
            case 'button':
                sub_elements.push(
                    <div key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, display: 'flex', paddingLeft: 15, paddingRight: 15 }} >
                        <Typography
                            sx={{ 
                                fontSize: 22,
                                marginRight: 'auto',
                            }}
                        >
                            {settingsJson[index].display_text}
                        </Typography>
                        <div sx={{ marginBottom: 'auto',  }} >
                            <Button
                                onClick={() => executePluginCommand(uuid, settingsJson[index].command)}
                                variant="contained"
                                >
                                Execute
                            </Button>
                        </div>
                    </div>
                )
                break;
            case 'checkbox':
                sub_elements.push(
                    <div key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, paddingLeft: 15, paddingRight: 15 }} >
                        <Typography
                            sx={{ 
                                fontSize: 22,
                            }}
                        >
                            {settingsJson[index].display_text}
                        </Typography>
                        <div style={{ display: 'flex', flexDirection: `${settingsJson[index].wide ? 'row' : 'column'}`, marginLeft: 15 }} >
                            {
                                settingsJson[index].list.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <FormControlLabel control={
                                            <Checkbox 
                                                checked={ customSettings[settingKey] ? customSettings[settingKey].includes(item) : false }
                                                onChange={ () => {
                                                    let checkArray = customSettings[settingKey];
                                                    if (!checkArray) {
                                                        checkArray = [];
                                                    }
                                                    
                                                    if (checkArray.includes(item)) {
                                                        checkArray = checkArray.filter( function (value) {
                                                            return value !== item;
                                                        });
                                                    } else {
                                                        checkArray.push(item);
                                                    }

                                                    handleCustSettingsChange(settingKey, checkArray, true);
                                                    
                                                }}
                                            />
                                        } label={item} />
                                    </React.Fragment>
                                ))
                            }
                        </div>
                    </div>
                )
                break;
            case 'placeholder':
                sub_elements.push(null);
                break;

            default:
                break;
        }
        key++;

        if (settingsJson[index].wide) {
            sub_elements.push(null);
        }

        while (sub_elements.length >= maxWidth || index + 1 === settingsJson.length) {
            children = [ sub_elements[0] ];

            if (sub_elements.length >= 3 && sub_elements[2] === null) {
                rows.push(<div key={`${key}${key}`} children={children} style={{ display: 'flex', marginBottom: 25 }} />);
                sub_elements.splice(0, 1);
            } else {
                children.push(sub_elements[1]);
                rows.push(<div key={`${key}${key}`} children={children} style={{ display: 'flex', marginBottom: 25 }} />);
                sub_elements.splice(0, 2);
            }

            key++;
            if (sub_elements.length === 0) {
                break;
            }
        }
    }
    return (
        <div 
            style={{ padding: 15, paddingTop: 30, display:'flex', flexDirection: 'column' }}
        >
            { rows }
        </div>
    );
}




export default ParseCustomSettings;

ParseCustomSettings.propTypes = {
    buildMode: PropTypes.bool
};

ParseCustomSettings.defaultProps = {
    buildMode: false
};