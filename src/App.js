import logo from './logo.svg';
import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { ThemeProvider, Button, Panel, SideNavigation, SideNavigationItem, SideNavigationSubItem, BusyIndicator,ShellBar,Text, Avatar,ShellBarItem, Input, Icon, Bar   } from '@ui5/webcomponents-react';
import Home from './components/home';
import React, { useState } from 'react';
import MonitoringPage from './components/monitoring-page';
import MonitoringConfigure from './components/monitoring-configure';
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
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
  const controls = useAnimationControls();
  const[page, setpage] = useState("home") 
  const showDetails = (newpage) =>{ 
    setpage(newpage) 
  } 
  return (
    <div className="App">
      {/* <header className="App-header">
        
      </header> */}
      <body>
        <div className="main">
        <ThemeProvider>
          <div className='App-Header'>
            <ShellBar className='app-shellbar'
                logo={<img style={{maxHeight:"2.5rem", marginTop:"-5px"}}alt="Innovate IT" src={process.env.PUBLIC_URL + '/logo3.png'} />}
                //menuItems={<><StandardListItem data-key="1">Menu Item 1</StandardListItem><StandardListItem data-key="2">Menu Item 2</StandardListItem><StandardListItem data-key="3">Menu Item 3</StandardListItem></>}
                notificationsCount="10"
                onCoPilotClick={function _a(){}}
                onLogoClick={function _a(){}}
                onMenuItemClick={function _a(){}}
                onNotificationsClick={function _a(){}}
                onProductSwitchClick={function _a(){}}
                onProfileClick={function _a(){}}
                onSearchButtonClick={function _a(){}}
                primaryTitle=""
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
              collapsed
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
                <motion.div style={{flex:"1 1 auto"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={page === 'home' ? 'visible' : 'hidden'}
                    exit="exit">{page === "home" && (<Home></Home>)} </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                <motion.div style={{flex:"1 1 auto"}}
                    variants={wrapperVariants}
                    initial="visible"
                    animate={page === "monitoring" ? 'visible' : 'hidden'}
                    exit="exit">{page === "monitoring" && (<MonitoringPage></MonitoringPage>)}</motion.div>
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
          </ThemeProvider>
          </div>
        </body>
    </div>
  );
}

export default App;
