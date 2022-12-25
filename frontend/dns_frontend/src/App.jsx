import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TopBar from './Components/TopBar';
import Login from './Pages/Login';

var isLoggedIn = true;

function App() {
  return (
    <>
      <BrowserRouter>
        <TopBar links={ isLoggedIn ? ["Dashboard", "Mods", "Settings", "About"] : []} />
        <Routes>

          <Route path='/manage' component={Login}/>

          <Route path='/manage/dashboard' />

          <Route path='/manage/mods' />

          <Route path='/manage/settings' />

          <Route path='/manage/about' />

          <Route path='/' />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
