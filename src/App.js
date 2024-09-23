import logo from './logo.svg';
import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { ThemeProvider } from '@ui5/webcomponents-react';
import { Button, Panel, SideNavigation, SideNavigationItem, SideNavigationSubItem, BusyIndicator,ShellBar,Text, Avatar,ShellBarItem, Input, Icon, Bar   } from '@ui5/webcomponents-react';
import Home from './components/home';
import React, { useState, useEffect,useContext } from 'react';
import MonitoringPage from './components/monitoring-page'
import MonitoringLanes from './components/monitoring-lanes';
import MonitoringConfigure from './components/monitoring-configure';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import MessageBoxComponent from "./components/message-box"
import MessageToastComponent from "./components/message-toast"
import {getAvatar} from "./services/s-profile"
import { AuthContext } from './helpers/authcontext';
import '@ui5/webcomponents-react/dist/Assets'
import messageContext from "./helpers/message-context";
import $ from 'jquery';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import { setupAxiosInterceptors } from './helpers/axios-custom';
function App() {
  const wrapperVariants = {
      hidden: {
        opacity: 0,
        x: '-5vw',
        transition: { ease: 'easeInOut', delay: 0.1 },
        display: "none"
      },
      visible: {
        opacity: 1,
        x: 0,
        transition: { ease: 'easeInOut', delay: 0.4 },
        display: "flex"
      },
      exit: {
        x: '-5vh',
        transition: { ease: 'easeInOut' },
      },
  };
  
  const[page, setpage] = useState("home") 
  const[isAuthorized, setIsAuthorized] = useState(false) 
  const[isCollapsed, setIsCollapsed] = useState(true) 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { instance, accounts } = useMsal(); // Use MSAL hook to get instance and accounts
  const { getAccessToken,getAccessTokenGraph } = useContext(AuthContext);
  useEffect(() => {
    const initializeInterceptor = async () => {
      try {
        await instance.initialize();
        await instance.handleRedirectPromise(); // Handle redirect if returning from login
        if (accounts.length === 0) {
          // If no accounts, redirect to login
          instance.loginRedirect(loginRequest);
        }
      } catch (error) {
        console.error('Redirect handling error:', error);
      }
      
      if (accounts.length > 0) {
        await setupAxiosInterceptors(getAccessToken); // Await interceptor setup
        const imageObjectURL = await getAvatar(getAccessTokenGraph)
        setProfilePhoto(imageObjectURL);
        setIsAuthorized(true)
      }else{
        
      }
    };
    // const getProfilePhoto = async () => {
    //   try {
    //     const request = {
    //       scope: 'User.Read',
    //       account: accounts[0],
    //     };
    //     const resp = await instance.acquireTokenSilent(request);
    //     const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
    //       headers: {
    //         Authorization: `Bearer ${resp.accessToken}`,
    //       },
    //     });

    //     if (response.ok) {
    //       // User has a profile photo
    //       const imageBlob = await response.blob();
    //       const imageObjectURL = URL.createObjectURL(imageBlob);
    //       setProfilePhoto(imageObjectURL);
    //     } else if (response.status === 404) {
    //       // User does not have a profile photo
    //       console.warn('No profile photo found for the user.');
    //       setProfilePhoto(null);
    //     } else {
    //       console.error('Error fetching profile photo:', response.statusText);
    //     }
    //   } catch (error) {
    //     console.error('Error fetching profile photo:', error);
    //   }
    // };

    
    initializeInterceptor();
    var shellBarHeader = $(".app-shellbar").children('header:first'); 
    shellBarHeader.append('<Button  design="Transparent"  icon="menu2"/>')
  }, [instance, accounts]);

  const [message,setMessage] = useState({open:false,message:"",result:null, callback:null, toast:false})
  const showDetails = (newpage) =>{ 
    setpage(newpage) 
  } 

  return (
    <div className="App">
      <messageContext.Provider value={{message,setMessage}}>
        <body>
          <div className="main">
            
              <div className='App-Header'>
                <Button style={{display:"block",position:"fixed",left:"20px", top:"20px", zIndex:"100", color:"black"}} onClick={() => setIsCollapsed(!isCollapsed)} design="Transparent"  icon="menu2"/>
                <ShellBar className='app-shellbar'
                    logo={<img style={{maxHeight:"2.5rem", marginTop:"-5px"}}alt="Innovate IT" src={process.env.PUBLIC_URL + '/shield.png'} />}
                    //menuItems={<><StandardListItem data-key="1">Menu Item 1</StandardListItem><StandardListItem data-key="2">Menu Item 2</StandardListItem><StandardListItem data-key="3">Menu Item 3</StandardListItem></>}
                    notificationsCount="10"
                    onCoPilotClick={function _a(){}}
                    onLogoClick={function _a(){}}
                    onMenuItemClick={function _a(){}}
                    onNotificationsClick={function _a(){}}
                    onProductSwitchClick={function _a(){}}
                    onProfileClick={function _a(){}}
                    onSearchButtonClick={function _a(){}}
                    //primaryTitle={<span style={{fontFamily:'"72Black","72Blackfull","72","72full",Arial,Helvetica,sans-serif'}}>Watchmen</span>}
                    primaryTitle="Watchmen"
                    profile={isAuthorized && profilePhoto ? (
                      <Avatar style={{ padding:"0" }}><img
                        src={profilePhoto}
                        alt="User Avatar"
                        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                      /></Avatar>
                    ) : isAuthorized && (
                      <Avatar style={{ padding:"0" }}><div
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          backgroundColor: '#ccc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          color: '#fff',
                        }}
                      >
                        {accounts[0]?.name?.charAt(0).toUpperCase() || 'U'}
                      </div></Avatar>
                    )}
                    searchField={<Input icon={<Icon interactive name="search"/>} showClearIcon/>}
                    secondaryTitle=""
                    showCoPilot="false"
                    showNotifications
                    showProductSwitch="false">
                  {/* <ShellBarItem
                    count="3"
                    icon="add"
                    text="ShellBarItem"
                  /> */}
                </ShellBar>
              </div>
              <div className='main-body'>
                <SideNavigation collapsed={isCollapsed} style={{zIndex:"100"}} fixedItems={<><SideNavigationItem icon="action-settings" text="Settings"/></>}>
                  <SideNavigationItem icon="home" text="Home" onClick={()=> showDetails("home")} selected/>
                  <SideNavigationItem expanded icon="dimension" text="Monitoring">
                    <SideNavigationSubItem onClick={()=> showDetails("monitoring")} text="Monitoring Messages" />
                    <SideNavigationSubItem onClick={()=> showDetails("monitoringStatus")} text="Monitoring Statuses" />
                  </SideNavigationItem>
                  <SideNavigationItem icon="add-process" onClick={()=>showDetails("configuremonitoring")} text="Configure Monitoring"/>
                </SideNavigation>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === 'home' ? 'visible' : 'hidden'}
                      exit="exit">{page === "home" && isAuthorized && (<Home></Home>)} </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "monitoring" ? 'visible' : 'hidden'}
                      exit="exit">{page === "monitoring" && isAuthorized && (<MonitoringPage style={{width:"100%", height:"100%"}}></MonitoringPage>)}</motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "monitoringStatus" ? 'visible' : 'hidden'}
                      exit="exit">{page === "monitoringStatus" && isAuthorized && (<MonitoringLanes style={{width:"100%", height:"100%"}}></MonitoringLanes>)}</motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "configuremonitoring" ? 'visible' : 'hidden'}
                      exit="exit">{page === "configuremonitoring" && isAuthorized && (<MonitoringConfigure style={{width:"100%", height:"100%"}}></MonitoringConfigure>)}</motion.div>
                </AnimatePresence>
              </div>
              <MessageBoxComponent/>
              <MessageToastComponent/>

          </div>
        </body>
      </messageContext.Provider>
    </div>
  );
}
export default App;
library.add(fab, fas, far)