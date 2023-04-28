import { AppBar, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';


const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Plugins", "Tools", "Settings"] : null;

    return (
        <AppBar 
            position='fixed'
        >
            <div style={{ display: 'flex', justifyContent: 'space-around', width: 500, flexShrink: 0, marginLeft: 10 }} >
                {
                    links && links.map((link, index) => {
                        return (
                            <Button 
                                key={index}
                                variant="text"
                                component={Link} 
                                to={'./manage/' + link.toLowerCase()} 
                            >
                                {link}
                            </Button>

                        );
                    })
                }
            </div>
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