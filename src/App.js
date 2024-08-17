import logo from './logo.svg';
import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { ThemeProvider, Button, Panel, SideNavigation, SideNavigationItem, SideNavigationSubItem, BusyIndicator,ShellBar,Text, Avatar,ShellBarItem, Input, Icon, Bar   } from '@ui5/webcomponents-react';
import Home from './components/home';
import React, { useState, useEffect } from 'react';
import MonitoringPage from './components/monitoring-page';
import MonitoringConfigure from './components/monitoring-configure';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import MessageBoxComponent from "./components/message-box"
import MessageToastComponent from "./components/message-toast"
import '@ui5/webcomponents-react/dist/Assets'
import messageContext from "./helpers/message-context";
import $ from 'jquery';

import { library } from '@fortawesome/fontawesome-svg-core'
// import your icons
import { fab } from '@fortawesome/free-brands-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
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
  const[isCollapsed, setIsCollapsed] = useState(true) 
  
  const [message,setMessage] = useState({open:false,message:"",result:null, callback:null, toast:false})
  const showDetails = (newpage) =>{ 
    setpage(newpage) 
  } 
  useEffect(() => {
    var shellBarHeader = $(".app-shellbar").children('header:first'); 
    shellBarHeader.append('<Button  design="Transparent"  icon="menu2"/>')
  })
  return (
    <div className="App">
      <messageContext.Provider value={{message,setMessage}}>
      {/* <header className="App-header">
        
      </header> */}
      <body>
        <div className="main">
        <ThemeProvider>
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
                profile={<Avatar><img src="https://sap.github.io/ui5-webcomponents-react/main/assets/Person-B7wHqdJw.png" /></Avatar>}
                searchField={<Input icon={<Icon interactive name="search"/>} showClearIcon/>}
                secondaryTitle=""
                showCoPilot
                showNotifications
                showProductSwitch
              >
                
              <ShellBarItem
                count="3"
                icon="add"
                text="ShellBarItem"
              />
            </ShellBar>
            {/* <Bar design="Header" style={{height:"5px"}}/> */}
  
          </div>
          <div className='main-body'>
            <SideNavigation
              collapsed={isCollapsed} style={{zIndex:"100"}}
              fixedItems={<><SideNavigationItem icon="action-settings" text="Settings"/></>}
              onSelectionChange={function _a(){}}
              >
                <SideNavigationItem
                  icon="home"
                  text="Home"
                  onClick={()=> showDetails("home")}
                  selected
                />
                <SideNavigationItem
                  expanded
                  icon="dimension"
                  text="Monitoring"
                  onClick={()=> showDetails("monitoring")}
                >
                  {/* <SideNavigationSubItem text="From My Team" />
                  <SideNavigationSubItem text="From Other Teams" /> */}
                </SideNavigationItem>
                <SideNavigationItem
                  icon="add-process"
                  onClick={()=>showDetails("configuremonitoring")}
                  text="Configure Monitoring"
                />
              
              </SideNavigation>
              <AnimatePresence>
                <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={page === 'home' ? 'visible' : 'hidden'}
                    exit="exit">{page === "home" && (<Home></Home>)} </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={page === "monitoring" ? 'visible' : 'hidden'}
                    exit="exit">{page === "monitoring" && (<MonitoringPage style={{width:"100%", height:"100%"}}></MonitoringPage>)}</motion.div>
              </AnimatePresence>
              <AnimatePresence>
                <motion.div style={{flex:"1 1 auto",width:"100%", height:"100%"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={page === "configuremonitoring" ? 'visible' : 'hidden'}
                    exit="exit">{page === "configuremonitoring" && (<MonitoringConfigure style={{width:"100%", height:"100%"}}></MonitoringConfigure>)}</motion.div>
              </AnimatePresence>
              {/* <BusyIndicator
                active
                delay={1000}
                size="Medium"
              /> */}
          </div>
          <MessageBoxComponent/>
          <MessageToastComponent/>
          </ThemeProvider>
          
          </div>
          
        </body>
        </messageContext.Provider>
    </div>
  );
}

export default App;
library.add(fab, fas, far)