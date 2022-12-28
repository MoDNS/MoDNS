import { Button, IconButton, InputAdornment, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';

import MainBox from '../Components/MainBox';
import Title from '../Components/Title';
import InputField from '../Components/InputField';



const Login = ({setLoggedIn}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();

        if(password){
            console.log(password);
            setLoggedIn(true);
            navigate('/manage/dashboard');
        }
        
    }

    return (
        <MainBox sx={{ width: 500, height: 475, marginTop: 10 }}>
            <Title sx={{ textAlign: 'center', marginTop: 8 }}>
                Login
            </Title>
            <Box type='form' sx={{ marginTop: 19, paddingLeft: 10, paddingRight: 10, marginBottom: 8, paddingBottom: 0 }}>
                <InputField
                    fullWidth
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
                                    sx={{ color: theme.palette.text.primary }}
                                    onClick={ () => setShowPass(!showPass) }
                                    onMouseDown= { (e) => { e.preventDefault() } }
                                >
                                    {showPass ? <VisibilityOff /> : <Visibility /> }
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                >
                    {/* <InputMask mask="" maskChar="*" /> */}
                </InputField>
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
                    onClick={(e) => handleSubmit(e)}
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