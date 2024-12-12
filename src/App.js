import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import Dashboard from './components/dashboard';
import React, {useState} from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { AuthProvider } from './helpers/authcontext'; 
import LoginPage from './components/login'
import RegisterPage from './components/register'
import ResetPassword from './components/reset-password'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RouteProtecter from './components/C_route-protecter';
import messageContext from "./helpers/message-context";
import MessageBoxComponent from "./components/message-box"
import MessageToastComponent from "./components/message-toast"
function App() {
  const [message,setMessage] = useState({open:false,message:"",result:null, callback:null, toast:false})
  return (
    
      <BrowserRouter>  
      <div className="App">
      <messageContext.Provider value={{message,setMessage}}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:userId/:link" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/*" element={
                <RouteProtecter>
                  <Dashboard />
                </RouteProtecter> 
              }
            />
            
          </Routes>
        </AuthProvider>
        <MessageBoxComponent/>
        <MessageToastComponent/>
      </messageContext.Provider>
        </div>
      </BrowserRouter>
    
  )
}
export default App;
library.add(fab, fas, far)