import { FormControlLabel, Switch, TextField, Typography } from "@mui/material";

import { settingsPageJson } from "../API/default_settings";


const maxWidth = 2;

export const parseCustomSettings = (uuid) => {
    let settingsJson = settingsPageJson;

    let rows = [];
    var sub_elements = [];
    let key = 0;
    let amt = 2;
    let children;
    for (let index = 0; index < settingsJson.length; index++) {

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
                        sx={{ width: `${settingsJson[index].wide ? '100%' : '55%'}`, justifyContent: 'left', marginLeft: 0 }}
                        control={
                            <Switch 
                                sx={{ marginX: 3, }}
                                onChange={() => {}}
                            />
                        } 
                    />
                );
                break;

            case 'input':
                sub_elements.push(
                    <div key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, display: 'flex', flexDirection: 'row' }} >
                        <Typography
                            sx={{ 
                                fontSize: 22,
                                marginRight: 2,
                            }}
                            >
                            Web Address:
                        </Typography>
                        <TextField
                            onFocus={ (e) => e.target.select() }
                            onInput={ e => {} }
                            sx={{ width: settingsJson[index].wide ? 300 : 200, marginLeft: settingsJson[index].wide ? 'auto' : 0}}
                        />
                    </div>
                )
                break;

            case 'pie':
                sub_elements.push(
                    <p key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, margin: 0 }}>
                        put pie chart here
                    </p>
                )
                break;

            case 'table':
                sub_elements.push(
                    <p key={key} style={{ width: `${settingsJson[index].wide ? '100%' : '50%'}`, margin: 0 }}>
                        put table here
                        put table hereput table hereput table hereput table hereput table hereput table hereput table hereput table hereput table hereput table hereput table here
                    </p>
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

        if (sub_elements.length >= maxWidth) {
            children = [ sub_elements[0] ];

            if (sub_elements.length >= 3 && sub_elements[2] === null) {
                amt = 1;
            } else {
                amt = 2;
                children.push(sub_elements[1]);
            }
            rows.push(<div key={`${key}${key}`} children={children} style={{ display: 'flex', marginBottom: 25 }} />);
            sub_elements.splice(0, amt);
        }
    }
    return (
        <div 
            style={{ padding: 25, paddingTop: 30, display:'flex', flexDirection: 'column' }}
        >
            { rows }
        </div>
    );
}


export const createCustomSettings = () => {

}