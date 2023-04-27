import { CssBaseline, ThemeProvider } from '@mui/material';
import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import TopBar from './Components/TopBar';
import About from './Pages/About';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Plugins from './Pages/Plugins';
import Settings from './Pages/Settings';
import Tools from './Pages/Tools';
import ProtectedRoute from './ProtectedRoute';
import { getThemeStorage } from './scripts/getsetLocalStorage';

import themes from './themes';

const App = () => {
  // user logged in status
  const [isLoggedIn, setLoggedIn] = useState(false);
  // theming state
  const [theme, setTheme] = useState(getThemeStorage());

  return (
  gg ez
    <>
      <ThemeProvider theme={themes[theme]}>
        <CssBaseline>
          <BrowserRouter>
            <TopBar isLoggedIn={isLoggedIn} setLoggedIn={setLoggedIn} />
            
            <Routes>
              <Route path='/man
