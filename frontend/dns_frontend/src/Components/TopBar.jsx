import { AppBar, Button } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { useTheme } from '@emotion/react';

import { ReactComponent as MoDNSLogo_Small} from '../images/logo_small.svg';
import { ReactComponent as MoDNSLogo} from '../images/logo.svg';

const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Plugins", "Tools", "Settings"] : null;

    const theme = useTheme();

    return (
        <AppBar 
            position='fixed'
        >
            {
                links &&
                <div style={{ height: '80%', marginTop: 'auto', marginBottom: 'auto', marginLeft: 20, marginRight: 30 }} >
                    <MoDNSLogo stroke={theme.palette.text.primary} fill={theme.palette.text.primary}/>
                </div>
            }
            <div style={{ display: 'flex', justifyContent: 'space-around', width: 500, flexShrink: 0, marginLeft: 10, height: '100%' }} >
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