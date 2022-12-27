import { AppBar, useTheme } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';



const TopBar = ({ isLoggedIn, setLoggedIn }) => {
    const links = isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : null;
    const theme = useTheme();

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
                        <Link
                            key={index} 
                            to={"./manage/" + link.toLowerCase()}
                            style={{ 
                                color: theme.palette.text.primary,
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
                    color: theme.palette.text.primary,
                    marginLeft: 'auto',
                    marginRight: 30,
                }}
            >
                Log out
            </Link>}
        </AppBar>
    );
};

export default TopBar;
