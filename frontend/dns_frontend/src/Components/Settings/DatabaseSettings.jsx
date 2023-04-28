import { Button, Icon, IconButton, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getServerConfig, setServerConfig } from '../../API/getsetAPI';

import ErrorIcon from '@mui/icons-material/Error';
import { IPInputValidation } from '../../scripts/scripts';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { DB_TYPE_KEY, POSTGRES_IP_KEY, POSTGRES_PASS_KEY, POSTGRES_PORT_KEY, POSTGRES_USER_KEY, SQLITE_PATH_KEY } from '../../Constants';

const DatabaseSettings = () => {

    const [dataBaseType, setDataBaseType] = useState({});

    const [sqlitePath, setSQLitePath] = useState({});

    const [postgresIP, setPostgresIP] = useState({});
    const [postgresPort, setPostgresPort] = useState({});
    const [postgresUser, setPostgresUser] = useState({})
    const [postgresPassword, setPostgresPassword] = useState({});

    const [showPass, setShowPass] = useState(false);
    const [errorPostgresIP, setErrorPostgresIP] = useState( false );

    useEffect(() => {
        getServerConfig(DB_TYPE_KEY).then(res => {
            setDataBaseType(res[DB_TYPE_KEY]);
        });
        getServerConfig(SQLITE_PATH_KEY).then(res => {
            setSQLitePath(res[SQLITE_PATH_KEY]);
        });
        getServerConfig(POSTGRES_IP_KEY).then(res => {
            setPostgresIP(res[POSTGRES_IP_KEY]);
            setErrorPostgresIP(!IPInputValidation(res[POSTGRES_IP_KEY].value || ""));
        })
        getServerConfig(POSTGRES_PORT_KEY).then(res => {
            setPostgresPort(res[POSTGRES_PORT_KEY]);
        })
        getServerConfig(POSTGRES_USER_KEY).then(res => {
            console.log(res)
            setPostgresUser(res[POSTGRES_USER_KEY]);
        })
        getServerConfig(POSTGRES_PASS_KEY).then(res => {
            setPostgresPassword({
                overridden: res[POSTGRES_PASS_KEY].overridden,
                value: ""
            });
        })

    }, []);


    const inputPostgresIP = (ip) => {
        setPostgresIP(ip);
        if (!IPInputValidation(ip.value)) {
            setErrorPostgresIP(true);
        }
        else {
            setErrorPostgresIP(false);
        }
    }

    ///// called when apply changes is pressed /////
    const handleSetDataBaseType = () => {
        setServerConfig(DB_TYPE_KEY, dataBaseType.value)
    }
    const handleSetSQLitepath = () => {
        setServerConfig(SQLITE_PATH_KEY, sqlitePath.value);
    }
    const handleSetPostgresIP = () => {
        if (errorPostgresIP) {
            alert("Postgres IP format not correct")
        } else {
            setServerConfig(POSTGRES_IP_KEY, postgresIP.value);
        }
    }
    const handleSetPostgresPort = () => {
        setServerConfig(POSTGRES_PORT_KEY, postgresPort.value);
    }
    const handleSetPostgresUser = () => {
        if (postgresUser.value !== "" && postgresUser.value !== null && postgresUser.value !== undefined ) {
            setServerConfig(POSTGRES_USER_KEY, postgresUser.value);
        }
    }
    const handleSetPostgresPassword = () => {
        if (postgresPassword.value !== "" && postgresPassword.value !== null && postgresPassword.value !== undefined ) {
            setServerConfig(POSTGRES_PASS_KEY, postgresPassword.value);
        }
    }


    const applyChanges = () => {
        !(dataBaseType && dataBaseType.overridden) && handleSetDataBaseType();
        if (dataBaseType && dataBaseType.value === "Sqlite") {
            !sqlitePath.overridden && handleSetSQLitepath();
        } else if (dataBaseType && dataBaseType.value === "Postgres") {
            !(postgresIP && postgresIP.overridden) && handleSetPostgresIP()
            !(postgresPort && postgresPort.overridden) && handleSetPostgresPort();
            !(postgresUser.overridden) && handleSetPostgresUser();
            !(postgresPassword.overridden) && handleSetPostgresPassword();
        }
    }

    return (
        <>
            <Typography
                sx={{
                    fontSize: 35,
                }}
            >
                Database Settings
            </Typography>
            <div style={{ direction: 'row', alignItems: 'center', height: '100%', width: '100%', paddingLeft: 50, paddingRight: 50, overflowY: 'auto', paddingTop: 30, paddingBottom: 30, }} >
                <div style={{ direction: 'column'}}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography
                            sx={{ 
                                fontSize: 25,
                                marginRight: 'auto',
                            }}
                            >
                            Database Type:
                        </Typography>
                        <Select
                            disabled={dataBaseType && dataBaseType.overridden}
                            value={(dataBaseType && dataBaseType.value) || ""}
                            onChange={(e) => {
                                let x = dataBaseType;
                                x.value = e.target.value
                                setDataBaseType({...x});
                            }}
                            sx={{ width: 100, marginTop: 'auto' }} 
                        >
                            <MenuItem value={"Sqlite"} > SQLite </MenuItem>
                            <MenuItem value={"Postgres"} > Postgres </MenuItem>
                        </Select>
                    </div>
                </div>

                {
                    dataBaseType && dataBaseType.value === "Sqlite" ? <>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}
                            >
                                File Path:
                            </Typography>
                            <TextField
                                disabled={sqlitePath && sqlitePath.overridden}
                                value={(sqlitePath && sqlitePath.value) || ""}
                                onChange={(e) => {
                                    let x = sqlitePath;
                                    x.value = e.target.value;
                                    setSQLitePath({...x});
                                }}
                            />
                        </div>
                        
                    </> : <>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}
                            >
                                IP Address:
                            </Typography>
                            <TextField
                                disabled={postgresIP && postgresIP.overridden}
                                value={(postgresIP && postgresIP.value) || ""}
                                onChange={(e) => {
                                    let x = postgresIP;
                                    x.value = e.target.value;
                                    inputPostgresIP({...x});
                                }}
                                inputProps={{style: { textAlign: 'right', paddingRight: 0, }}}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            { errorPostgresIP &&
                                                <Icon>
                                                    <ErrorIcon />
                                                </Icon>
                                            }
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}

                            >
                                Port:
                            </Typography>
                            <TextField
                                disabled={postgresPort && postgresPort.overridden}
                                value={(postgresPort && postgresPort.value) || ""}
                                inputProps={{ maxLength: 5, style: { textAlign: 'right', paddingRight: 0, }}}

                                onChange={(e) => {
                                    let input = e.target.value;
                                    if(/^\d*$/.test(input)){
                                        let x = postgresPort;
                                        x.value = input;
                                        setPostgresPort({...x});
                                    }
                                }}
                            />
                        </div>


                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}

                            >
                                Postgres Username:
                            </Typography>
                            <TextField
                                disabled={postgresUser && postgresUser.overridden}
                                value={(postgresUser && postgresUser.value) || ""}
                                onInput={ e => {
                                    let x = postgresUser;
                                    x.value = e.target.value;
                                    setPostgresUser({...x});
                                } }
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}

                            >
                                Postgres Password:
                            </Typography>
                            <TextField
                                disabled={postgresPassword && postgresPassword.overridden}
                                type={ showPass ? 'text' : 'password' }
                                value={(postgresPassword && postgresPassword.value) || ""}
                                onInput={ e => {
                                    let x = postgresPassword;
                                    x.value = e.target.value;
                                    setPostgresPassword({...x});
                                } }
                                onFocus={e => {
                                    e.target.select();
                                }}
                                
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position='end'>
                                            <IconButton
                                                onClick={ () => setShowPass(!showPass) }
                                                onMouseDown= { (e) => { e.preventDefault() } }
                                            >
                                                {showPass ? <VisibilityOff /> : <Visibility /> }
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </div>
                    </>

                }
            </div>
            <Button
                fullWidth
                variant={'contained'}
                sx={{  position: 'sticky', bottom: 0, }}
                onClick={ () => applyChanges() }
            >
                Apply Changes
            </Button>   
        </>
    );
};

export default DatabaseSettings;