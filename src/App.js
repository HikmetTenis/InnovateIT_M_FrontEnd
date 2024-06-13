import logo from './logo.svg';
import './App.css';
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { ThemeProvider, Button, Panel, SideNavigation, SideNavigationItem, SideNavigationSubItem, BusyIndicator,ShellBar,Text, Avatar,ShellBarItem, Input, Icon, Bar   } from '@ui5/webcomponents-react';
import MonitoringPage from './components/monitoring-page';

function App() {
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
              fixedItems={<><SideNavigationItem href="https://www.sap.com/index.html" icon="chain-link" target="_blank" text="External Link"/><SideNavigationItem icon="history" text="History"/></>}
              onSelectionChange={function _a(){}}
              >
                <SideNavigationItem
                  icon="home"
                  text="Home"
                />
                <SideNavigationItem
                  expanded
                  icon="group"
                  text="People"
                >
                  <SideNavigationSubItem text="From My Team" />
                  <SideNavigationSubItem text="From Other Teams" />
                </SideNavigationItem>
                <SideNavigationItem
                  icon="locate-me"
                  selected
                  text="Locations"
                />
                <SideNavigationItem
                  icon="calendar"
                  text="Events"
                >
                  <SideNavigationSubItem text="Local" />
                  <SideNavigationSubItem text="Others" />
                </SideNavigationItem>
              </SideNavigation>
              <MonitoringPage></MonitoringPage>
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
