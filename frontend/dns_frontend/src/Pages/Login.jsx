import { Button, TextField } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import MainBox from '../Components/MainBox';
import Title from '../Components/Title';
import themes from '../themes';


const Login = ({setLoggedIn}) => {
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
                    InputProps={{
                        sx: { '& input': { color: themes.theme1.text } },
                    }}
                    
                    sx={{  
                        "& .MuiFormLabel-root": {color: themes.theme1.text},
                        "& .MuiInput-underline:after": {
                            borderBottomColor: themes.theme1.text,
                        },
                        "& .MuiInput-underline:before": {
                            borderBottomColor: themes.theme1.text,
                        },

                    }}    
                />
                <Box display='flex' justifyContent="right">
                    <Link
                        style={{ 
                            paddingTop: 2,
                            color: themes.theme1.link,
                        }}
                    >
                        Forgot Password?
                    </Link>
                </Box>
            <Button 
                type='submit'
                fullWidth
                onClick={handleSubmit}
                sx={{
                    marginTop: 3, 
                    backgroundColor: 
                    themes.theme1.secondary, 
                    color: themes.theme1.text, 
                    '&:hover': { backgroundColor: themes.theme1.secondary_light  }, }} >    
                Sign in
            </Button>
            </Box>
        </MainBox>
    );
};

export default Login;