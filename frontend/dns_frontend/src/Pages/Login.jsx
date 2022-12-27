import { Button, TextField, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import MainBox from '../Components/MainBox';
import Title from '../Components/Title';



const Login = ({setLoggedIn}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');

    function handleSubmit(event, navi) {
        event.preventDefault();
        if(password){
            console.log(password);
        }
        setLoggedIn(true);

        navigate('/manage/dashboard');
        
    }

    return (
        <MainBox sx={{ width: 500, height: 475, marginTop: 20 }}>
            <Title sx={{ textAlign: 'center', marginTop: 8 }}>
                Login
            </Title>
            <Box type='form' sx={{ marginTop: 19, paddingLeft: 10, paddingRight: 10, marginBottom: 8, paddingBottom: 0 }}>
                <TextField 
                    fullWidth
                    required
                    autoComplete='current-password'
                    type='password'
                    variant='standard'
                    placeholder='Enter Password'
                    label='Password'
                    value={password}
                    onInput={ e=> setPassword(e.target.value) }
                    onFocus={event => {
                        event.target.select();
                    }}                    
                    sx={{  
                        '& label.Mui-focused': {
                            color: 'text.primary',
                          },
                        "& .MuiInput-underline:after": {
                            borderBottomColor: 'text.primary',
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: 'text.primary',
                        },
                        "& .MuiInput-root:hover::before": {
                            borderBottomColor: 'text.secondary',
                        },

                    }}    
                />
                <Box display='flex' justifyContent="right">
                    <Link
                        style={{ 
                            color: theme.palette.link.main,
                            paddingTop: 2,
                        }}
                    >
                        Forgot Password?
                    </Link>
                </Box>
                <Button 
                    type='submit'
                    fullWidth
                    variant='contained'
                    disableElevation
                    onClick={handleSubmit}
                    sx={{
                        marginTop: 3,
                    }} 
                    >    
                    Sign in 
                </Button>
            </Box>
        </MainBox>
    );
};

export default Login;