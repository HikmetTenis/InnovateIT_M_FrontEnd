import logo from './logo.svg';
import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { ThemeProvider } from '@ui5/webcomponents-react';
import { Button, Panel, SideNavigation, SideNavigationItem, SideNavigationSubItem, BusyIndicator,ListItemStandard,ShellBar,Text, Avatar,Popover,FlexBox, Input, Icon, List   } from '@ui5/webcomponents-react';
import Home from './components/home';
import React, { useState, useEffect,useContext,useRef } from 'react';
import MonitoringPageDetails from "./components/monitoring-tile-details";
import MonitoringLanes from './components/monitoring-lanes';
import MonitoringConfigure from './components/monitoring-configure';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import MessageBoxComponent from "./components/message-box"
import MessageToastComponent from "./components/message-toast"
import {getAvatar,getSystemInfo} from "./services/s-profile"
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
import { useNotifications } from './helpers/notification-context';
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
  const { notifications, removeNotification,updateNotification } = useNotifications();
  const[page, setpage] = useState("home") 
  const[isAuthorized, setIsAuthorized] = useState(false) 
  const[isCollapsed, setIsCollapsed] = useState(true) 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const { instance, accounts } = useMsal(); // Use MSAL hook to get instance and accounts
  const { getAccessToken,getAccessTokenGraph } = useContext(AuthContext);
  const [popoverBody, setPopoverBody] = useState([]);
  const [popoverRef, setPopoverRef] = useState(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [popoverBody1, setPopoverBody1] = useState([]);
  const [popoverIsOpen1, setPopoverIsOpen1] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const environments = useRef([]);
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
        const envs = await getSystemInfo()
        environments.current = envs.data.obj
        let system = null
        for (const env of envs.data.obj) {
          if (env.key === "SYSTEM"){
            system = env.value
          }
        }
        document.title = "Watchmen"+" ("+system+")"
      }else{
        
      }
      
    };
    initializeInterceptor();
    var shellBarHeader = $(".app-shellbar").children('header:first'); 
    shellBarHeader.append('<Button  design="Transparent"  icon="menu2"/>')
    
    
  }, [instance, accounts]);
  useEffect(() => {
    const l = notifications.filter(notification => !notification.markAsRead)
    setNotificationCount(l.length);
  },[notifications])
  const [message,setMessage] = useState({open:false,message:"",result:null, callback:null, toast:false})
  const showDetails = (newpage) =>{ 
    setpage(newpage) 
  } 
  const markAsRead = (counter, e, value) => {
    const off_pin = document.getElementById('off'+counter);
    const on_pin = document.getElementById('on'+counter);
    if(value){
      off_pin.style.display = '';
      on_pin.style.display = 'none';
    }else{
      off_pin.style.display = 'none';
      on_pin.style.display = '';
    }
    e.markAsRead = value
    updateNotification(e)
  }
  const showNotifications = (e) => {
    setPopoverRef(e.detail.targetRef)
    setPopoverIsOpen(true)  
    let listItems = []
    let counter = 0
    notifications.forEach(function(notification) {
      let message = null;
      let color = "red"
      let type = "message-error"
      let markedAsRead = false
      if(notification.category === "MESSAGE"){
        message = notification.count+" number of messages are failed in last hour."
      }
      if(notification.markedAsRead){
        markedAsRead = notification.markedAsRead
      }
      if(notification.message){
        message = notification.message
      }
      const n = {
        category:notification.category,
        message:message,
        markAsRead:markedAsRead,
        color:color,
        type:type
      }
      const c = counter
      listItems.push(
        <ListItemStandard additionalText="" key={counter}>
          <FlexBox justifyContent="SpaceBetween" alignItems="Center">
            <FlexBox>
              <Icon name={n.type} style={{color:n.color,marginRight:"10px",borderLeft:"none"}}/>{n.message}
            </FlexBox>
            <FlexBox>
              <Button id={"off"+counter} style={{display:"none"}} onClick={() => markAsRead(c, n, false)} design="Transparent"  icon="pushpin-off"/>
              <Button id={"on"+counter}  onClick={() => markAsRead(c, n, true)} design="Transparent"  icon="pushpin-on"/>
            </FlexBox>
          </FlexBox>
        </ListItemStandard>
      )
      counter++
    })
    setPopoverBody(listItems)
  }
  const showConfig = (message) => {
    setPopoverIsOpen1(true)  
    let listItems = []
    for (const env of environments.current) {
      listItems.push(
        <ListItemStandard additionalText={env.value}>
          {env.key}
        </ListItemStandard>
      )
    }
    setPopoverBody1(listItems)
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
                    notificationsCount={notificationCount}
                    onCoPilotClick={function _a(){}}
                    onLogoClick={function _a(){}}
                    onMenuItemClick={function _a(){}}
                    onNotificationsClick={showNotifications}
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
              <BusyIndicator active={!isAuthorized} style={{height:"100%",width:"100%",display: isAuthorized ? "none" : "block"}} size="M"></BusyIndicator>
              <Popover
                  className="footerPartNoPadding"
                  header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Notifications</Text></FlexBox>}
                  horizontalAlign="Start"
                  onBeforeClose={function ks(){}}
                  onBeforeOpen={function ks(){}}
                  onOpen={function ks(){}}
                  opener={popoverRef}
                  open={popoverIsOpen}
                  allowTargetOverlap="true"
                  onClose={() => {
                    setPopoverIsOpen(false);
                  }}
                  placement="Bottom"
                  verticalAlign="Top">
                    <List style={{minWidth:"450px"}}>
                      {popoverBody}
                    </List>
                </Popover>
                <Popover 
                  className="footerPartNoPadding"
                  header={<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true"><Text>Config</Text></FlexBox>}
                  horizontalAlign="Start"
                  onBeforeClose={function ks(){}}
                  onBeforeOpen={function ks(){}}
                  onOpen={function ks(){}}
                  opener="configButton"
                  open={popoverIsOpen1}
                  allowTargetOverlap="true"
                  onClose={() => {
                      setPopoverIsOpen1(false);
                  }}
                  placement="Start"
                  verticalAlign="Top">
                  <List style={{minWidth:"400px"}}>
                      {popoverBody1}
                  </List>
              </Popover>
              <div style={{height:"100%",gap:"10px",width:"100%",display: !isAuthorized ? "none" : "flex"}}>
                <SideNavigation collapsed={isCollapsed} style={{zIndex:"100"}} fixedItems={<><SideNavigationItem id="configButton" icon="action-settings" onClick={()=> showConfig()} text="Settings"/></>}>
                  <SideNavigationItem icon="home" text="Home" onClick={()=> showDetails("home")} selected/>
                  <SideNavigationItem expanded icon="dimension" text="Monitoring">
                    <SideNavigationSubItem onClick={()=> showDetails("monitoring")} text="Monitoring By Messages" />
                    <SideNavigationSubItem onClick={()=> showDetails("monitoringStatus")} text="Monitoring By Statuses" />
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
                      exit="exit">{page === "monitoring" && isAuthorized && (<MonitoringPageDetails style={{width:"100%", height:"100%"}}></MonitoringPageDetails>)}</motion.div>
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