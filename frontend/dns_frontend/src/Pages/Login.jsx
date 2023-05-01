import { Button, IconButton, InputAdornment, TextField, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import MainBox from '../Components/MainBox';
import { getAuthentication } from '../API/getsetAPI';

import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import { ReactComponent as MoDNSLogo} from '../images/logo.svg';


const Login = ({ setLoggedIn }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();

        if(getAuthentication(password)){
            setLoggedIn(true);
            navigate('/manage/dashboard');
        } else {
            alert("Incorrect Password");
        }
        
    }

    // this adds enter to submit
    function handleKeyPress(e) {
        var key = e.key;
        if (key === "Enter") {
            handleSubmit(e)
        }
    }
    
    return (
        <MainBox 
            id='MBox' 
            sx={{ position: 'relative', top: 150, marginLeft: 'auto', marginRight: 'auto', width: 415, }} 
            title={
                <div style={{ height: 220, width: '100%', marginBottom: 60, marginTop: 5, paddingRight: 10 }} >
                    <MoDNSLogo stroke={theme.palette.text.primary} fill={theme.palette.text.primary}/>
                </div>
            }
            titleCentered
        >

            <Box 
                type='form'
                sx={{ width: '100%' }}
            >
                <TextField
                    fullWidth
                    autoFocus
                    onKeyPress={(e) => handleKeyPress(e)} //this adds enter to submit
                    required
                    type={ showPass ? 'text' : 'password' }
                    autoComplete='current-password'
                    placeholder='Enter Password'
                    label='Password'
                    onInput={ e=> setPassword(e.target.value) }
                    onFocus={event => {
                        event.target.select();
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
                <Box 
                    display='flex'
                    justifyContent="right"
                    overflow='visible'
                >
                    <Link
                        style={{ 
                            color: theme.palette.link.main,
                            marginTop: 2,
                        }}
                    >
                        Forgot Password?
                    </Link>
                </Box>
                <Button 
                    type='submit'
                    fullWidth
                    variant='contained'
                    onClick={(e) => handleSubmit(e)}

                    sx={{
                        marginTop: 2,
                        marginBottom: 0,
                    }} 
                >    
                    Sign in 
                </Button>
            </Box>
        </MainBox>
    );
};

export default Login;

Login.propTypes = {
    setLoggedIn: PropTypes.func.isRequired,     // sets the logged in status to true if login successful
};