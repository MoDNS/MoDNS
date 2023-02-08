import { CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TopBar from './Components/TopBar';
import About from './Pages/About';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Plugins from './Pages/Plugins';
import Settings from './Pages/Settings';
import ProtectedRoute from './ProtectedRoute';
import { getThemeStorage } from './scripts/getsetLocalStorage';

import themes from './themes';

const App = () => {
  // user logged in status
  const [isLoggedIn, setLoggedIn] = useState(false);
  // theming state
  const [theme, setTheme] = useState(getThemeStorage());

  return (
    <>
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline>
          <BrowserRouter>
            <TopBar isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn} />
            
            <Routes>
              <Route path='/manage' element={<Login setLoggedIn={setLoggedIn} />}/>
              <Route exact path = '/manage/dashboard' element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Dashboard /> } /> } /> 
              <Route exact path = '/manage/plugins'   element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Plugins /> } /> } />
              <Route exact path = '/manage/settings'  element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Settings setTheme={setTheme} /> } /> } />
              <Route exact path = '/manage/about'     element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <About /> } /> } />
              
            </Routes>
          </BrowserRouter>
        </CssBaseline>
      </ThemeProvider>
    </>
  );
}

export default App;
