import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { Button,  SideNavigation, SideNavigationItem, Tag,SideNavigationSubItem,Menu, MenuItem,BusyIndicator,ListItemStandard,ShellBar,Text, Avatar,Popover,FlexBox, Input, Icon, List   } from '@ui5/webcomponents-react';
import React, { useState, useEffect,useRef } from 'react';
import MonitoringPageDetails from "./monitoring-tile-details";
import MonitoringLanes from './monitoring-lanes';
import MonitoringConfigure from './monitoring-configure';
import { motion, AnimatePresence } from "framer-motion"
import MessageBoxComponent from "./message-box"
import MessageToastComponent from "./message-toast"
import '@ui5/webcomponents-react/dist/Assets' 
import $ from 'jquery';
import { useNotifications } from '../helpers/notification-context';
import { useAuth } from "../helpers/authcontext";
import { getTrialPeriod } from "../services/s-account";
import Home from './home';
function Dashboard() {
  const { isAuthenticated,logout, user, token } = useAuth();
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
  const { notifications, removeNotification,updateNotification,addNotification } = useNotifications();
  const[page, setpage] = useState("home") 
  // const[isAuthorized, setIsAuthorized] = useState(false) 
  const[isCollapsed, setIsCollapsed] = useState(true) 
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [popoverBody, setPopoverBody] = useState([]);
  const [popoverRef, setPopoverRef] = useState(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [popoverBody1, setPopoverBody1] = useState([]);
  const [popoverIsOpen1, setPopoverIsOpen1] = useState(false);
  const [messageStatus, setMessageStatus] = useState("ALL");
  const [notificationCount, setNotificationCount] = useState(0);
  const buttonRef = useRef(null);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [trialPeriod, setTrialPeriod] = useState(0);
  const [fullname, setFullname] = useState('');
  const environments = useRef([]);
  useEffect(() => {
    const shellBarHeader = $(".app-shellbar").children('header:first'); 
    shellBarHeader.append('<Button  design="Transparent"  icon="menu2"/>')
    const initializeWorker = async () => {
      const worker = new Worker(new URL('../helpers/notificationWorker.js', import.meta.url));
      if(process.env.REACT_APP_SERVICE_TYPE === "Trial"){
        const period = await getTrialPeriod() 
        setTrialPeriod(period)
      }
      // Listen for messages from the web worker 1
      worker.onmessage = (event) => {
          const { data } = event; 
          if (data.error) {
            if(data.error.status === 401 || data.error.status === 403){
              if(process.env.REACT_APP_AUTHTYPE === "SAML"){
                localStorage.removeItem("jwtToken")
                window.location.href ="https://"+process.env.REACT_APP_SERVER_URL+":"+process.env.REACT_APP_SERVER_PORT+"/sso/loginSAML"
              }else{
                window.location.href ="/login"
              }
            }
            console.error(data.error);
          } else {
            if(data.length > 0)
              addNotification(data);
          }
      };
      const token = localStorage.getItem("jwtToken")
      worker.postMessage({token:token});
      // Clean up the worker when the component unmounts
      return () => {
          worker.terminate();
      };
      
    }
    initializeWorker()
    
    
  }, [token]);
  useEffect(() => {
    const l = notifications.filter(notification => !notification.markAsRead)
    setNotificationCount(l.length);
  },[notifications])
  useEffect(() => {
    setFullname(localStorage.getItem("fullname"))
  },[user])
  
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
  const tileClicked  = (e) => {
    setMessageStatus(e)
    setpage("monitoring") 
  }
  const menuItemClicked = (e) => {
    if(e.detail.text === "Logout"){
      logout()
    }
  }
  return  !isAuthenticated ? <BusyIndicator active={!isAuthenticated} style={{width:"100%", height:"100%"}} size="M"></BusyIndicator>:(
    <FlexBox direction="Row" alignItems="Center" justifyContent="Center" fitContainer="true">
        <Menu
            opener={buttonRef.current}
            open={menuIsOpen}
            onItemClick={(e) => menuItemClicked(e)}
            onClose={() => {
              setMenuIsOpen(false);
            }}>
            <MenuItem icon="log" text="Logout" />
        </Menu>
        <body style={{flex:"1 1 auto"}}>
          <div className="main">
              <div className='App-Header'>
                <Button style={{display:"block",position:"absolute",left:"20px", top:"20px", zIndex:"100", color:"black"}} onClick={() => setIsCollapsed(!isCollapsed)} design="Transparent"  icon="menu2"/>
                <ShellBar className='app-shellbar'
                    logo={<img style={{maxHeight:"2.5rem", marginTop:"-5px", marginRight:"-25px", paddingRight:"20px"}}alt="Innovate IT" src={process.env.PUBLIC_URL + '/shield.png'} />}
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
                    profile={isAuthenticated && profilePhoto ? (
                      <Avatar style={{ padding:"0" }}><img
                        src={profilePhoto}
                        alt="User Avatar"
                        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                      /></Avatar>
                    ) : isAuthenticated && (<FlexBox direction="Row" alignItems="Center" style={{height:"40px"}} justifyContent="Center" fitContainer="true">
                    <Button ref={buttonRef} onClick={() => {setMenuIsOpen(true);}} design="Transparent" icon="employee" title={fullname}
                      style={{
                        borderRadius: '50%',
                        border: '1px solid gray',
                      }}>
                      
                    </Button> <Tag design="Information"><span>{trialPeriod}</span></Tag></FlexBox>)}
                    searchField={<Input icon={<Icon interactive name="search"/>} showClearIcon/>}
                    secondaryTitle=""
                    showCoPilot="false"
                    showNotifications
                    showProductSwitch="false">
                </ShellBar>
              </div>
              <div className='main-body'>
              <BusyIndicator active={!isAuthenticated} style={{height:"100%",width:"100%",display: isAuthenticated ? "none" : "block"}} size="M"></BusyIndicator>
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
              <div style={{height:"100%",gap:"10px",width:"100%",display: !isAuthenticated ? "none" : "flex"}}>
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
                      exit="exit">{page === "home" && isAuthenticated && (<Home tileClicked={tileClicked}></Home>)} </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "monitoring" ? 'visible' : 'hidden'}
                      exit="exit">{page === "monitoring" && isAuthenticated && (<MonitoringPageDetails status={messageStatus} style={{width:"100%", height:"100%"}}></MonitoringPageDetails>)}</motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "monitoringStatus" ? 'visible' : 'hidden'}
                      exit="exit">{page === "monitoringStatus" && isAuthenticated && (<MonitoringLanes style={{width:"100%", height:"100%"}}></MonitoringLanes>)}</motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                      variants={wrapperVariants}
                      initial="visible"
                      animate={page === "configuremonitoring" ? 'visible' : 'hidden'}
                      exit="exit">{page === "configuremonitoring" && isAuthenticated && (<MonitoringConfigure style={{width:"100%", height:"100%"}}></MonitoringConfigure>)}</motion.div>
                </AnimatePresence>
              </div>
              </div>
              <MessageBoxComponent/>
              <MessageToastComponent/>

          </div>
        </body>
        </FlexBox>

    );

}
export default Dashboard;
