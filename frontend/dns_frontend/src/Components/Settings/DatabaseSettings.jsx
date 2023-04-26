import { Button, Icon, IconButton, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getServerConfig, setServerConfig } from '../../API/getsetAPI';

import ErrorIcon from '@mui/icons-material/Error';
import { IPInputValidation } from '../../scripts/scripts';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

const DatabaseSettings = () => {

    const [dataBaseType, setDataBaseType] = useState({});

    const [sqlitePath, setSQLitePath] = useState({});
    const [sqlitePassword, setSqlitePassword] = useState({});

    const [postgresIP, setPostgresIP] = useState({});
    const [postgresPort, setPostgresPort] = useState({});
    const [postgresPassword, setPostgresPassword] = useState({});

    useEffect(() => {
        getServerConfig('database_type').then(res => {
            setDataBaseType(res);
        });
        getServerConfig('sqlite_file_path').then(res => {
            setSQLitePath(res);
        });
        getServerConfig('postgres_ip').then(res => {
            setPostgresIP(res);
        })
        getServerConfig('postgres_port').then(res => {
            setPostgresPort(res);
        })
        getServerConfig('postgres_password').then(res => {
            setPostgresPassword(res);
        })
        getServerConfig('sqlite_password').then(res => {
            setSqlitePassword(res);
        })

    }, []);

    const [showPass, setShowPass] = useState(false);
    const [errorPostgresIP, setErrorPostgresIP] = useState( postgresIP && postgresIP.value ? !IPInputValidation(postgresIP.value) : true );
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
        setServerConfig('database_type', dataBaseType.value)
    }
    const handleSetSQLitepath = () => {
        setServerConfig('sqlite_file_path', sqlitePath.value);
    }
    const handleSetPostgresIP = () => {
        setServerConfig('postgres_ip', postgresIP.value);
    }
    const handleSetPostgresPort = () => {
        setServerConfig('postgres_port', postgresPort.value);
    }


    const applyChanges = () => {
        !(dataBaseType && dataBaseType.overridden) && handleSetDataBaseType();
        if (dataBaseType && dataBaseType.value === "sqlite") {
            !sqlitePath.overridden && handleSetSQLitepath();
        } else if (dataBaseType && dataBaseType.value === "postgres") {
            !(postgresIP && postgresIP.overridden) && handleSetPostgresIP()
            !(postgresPort && postgresPort.overridden) && handleSetPostgresPort();
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
                            <MenuItem value={"sqlite"} > SQLite </MenuItem>
                            <MenuItem value={"postgres"} > PostGres </MenuItem>
                        </Select>
                    </div>
                </div>

                {
                    dataBaseType && dataBaseType.value === "sqlite" ? <>
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

                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 35 }}>
                            <Typography
                                sx={{
                                    fontSize: 25,
                                    marginRight: 'auto',
                                    marginBottom: 'auto'
                                }}

                            >
                                SQLite Password:
                            </Typography>
                            <TextField
                                disabled={sqlitePassword && sqlitePassword.overridden}
                                type={ showPass ? 'text' : 'password' }
                                value={(sqlitePassword && sqlitePassword.value) || ""}
                                onInput={ e => {
                                    let x = sqlitePassword;
                                    x.value = e.target.value;
                                    setSqlitePassword({...x});
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