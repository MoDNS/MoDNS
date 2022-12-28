import { AppBar, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';



const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : null;

    return (
        <AppBar 
            sx={{
                flexDirection: 'row',
                height: 0.11,
                alignItems: 'center'
            }}
        >
            {
                links && links.map((link, index) => {
                    return (
                        <Button 
                            variant="text"
                            disableRipple 
                            sx={{ marginLeft: 4 }} 
                            component={Link} 
                            to={'./manage/' + link.toLowerCase()} 
                        >
                            {link}
                        </Button>

                    );
                })
            }
            {isLoggedIn &&
                <Button 
                    variant="text"
                    disableRipple 
                    sx={{ marginLeft: 'auto', marginRight: 4 }} 
                    component={Link}
                    onClick={ () => setLoggedIn(false) }
                    to={'./manage'} 
                >
                    Log Out
                </Button>

        }
        </AppBar>
    );
};

export default TopBar;
