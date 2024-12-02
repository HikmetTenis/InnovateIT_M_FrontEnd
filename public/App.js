import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/P_login';
import RegisterPage from './pages/P_register';
import ResetPassword from './pages/P_reset-password';
import RouteProtecter from './components/C_route-protecter';
import Home from './pages/P_home';
import MessageBoxComponent from "./components/C_message-box"
import MessageToastComponent from "./components/C_message-toast"
import React, { useState,useEffect } from 'react';
import messageContext from "./helpers/U_message-context";

function App() {
  const [message,setMessage] = useState({open:false,message:"",result:null, callback:null, toast:false})
  return (
    <Router> 
      <div className="App">
        <messageContext.Provider value={{message,setMessage}}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:userId/:link" element={<ResetPassword />} />
            <Route path="/*"
            element={
              <RouteProtecter>
                <Home />
              </RouteProtecter>
            }
          />
          </Routes>
          <MessageBoxComponent/>
          <MessageToastComponent/>
        </messageContext.Provider>
      </div>
    </Router>
  );
}

export default App;
