import { AppBar } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

import themes from '../themes';


const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : null;

    return (
        <AppBar 
            sx={{
                backgroundColor: themes.theme1.primary,
                color: themes.theme1.text,
                flexDirection: 'row',
                height: 0.11,
                alignItems: 'center'
            }}
        >
            {
                links && links.map((link, index) => {
                    return (
                        <Link
                            key={index} 
                            to={"./manage/" + link.toLowerCase()}
                            style={{ 
                                color: themes.theme1.text,
                                paddingLeft: 30
                            }}
                        >
                            {link}
                        </Link>
                    );
                })
            }
            {isLoggedIn && <Link
                onClick={() => setLoggedIn(false)}
                to={"./manage/"}
                style={{ 
                    color: themes.theme1.text,
                    marginLeft: 'auto',
                    marginRight: 30
                }}
            >
                Log out
            </Link>}
        </AppBar>
    );
};

export default TopBar;
