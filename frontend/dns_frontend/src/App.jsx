import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import TopBar from './Components/TopBar';
import About from './Pages/About';
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login';
import Mods from './Pages/Mods';
import Settings from './Pages/Settings';
import ProtectedRoute from './ProtectedRoute';


const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  return (
    <>
      <BrowserRouter>
        <TopBar links={ isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : null} />
        {/* { !isLoggedIn ? <Navigate replace to='/manage' /> : <></>} */}
        <Routes>
          <Route path='/manage' element={<Login setLoggedIn={setLoggedIn} />}/>
          <Route exact path = '/manage/dashboard' element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Dashboard/> } /> } />
          <Route exact path = '/manage/mods'      element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Mods/> } /> } />
          <Route exact path = '/manage/settings'  element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <Settings/> } /> } />
          <Route exact path = '/manage/about'     element={ <ProtectedRoute isLoggedIn={isLoggedIn} element={ <About/> } /> } />

          <Route path='/*' element={ <Navigate to={isLoggedIn ? '/manage/dashboard' : '/manage'} /> } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
