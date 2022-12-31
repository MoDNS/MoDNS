import { AppBar, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';


const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : null;

    return (
        <AppBar 
            position='fixed'
            sx={{
                top: 0,
                height: 50,
                paddingLeft: 4,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            {
                links && links.map((link, index) => {
                    return (
                        <Button 
                            key={index}
                            variant="text"
                            sx={{ marginRight: 4 }} 
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

TopBar.propTypes = {
    isLoggedIn: PropTypes.bool,
    setLoggedIn: PropTypes.func,
};

TopBar.defaultProps = {
    isLoggedIn: false,
    setLoggedIn: () => {},
};