import "@ui5/webcomponents-icons/dist/AllIcons.js";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion"
import React, { useState } from 'react';
import { TableCell,Table, TableColumn, TableRow,DynamicPage,DynamicPageHeader,Bar, DynamicPageTitle, BusyIndicator,Button, FlexBox,Label,DynamicSideContent, MessageStrip,Title,Badge,ObjectStatus,Breadcrumbs,BreadcrumbsItem} from '@ui5/webcomponents-react';
const MonitoringPageDetails = props => {
  const [details, setDetails] = useState(false);
  const showDetails = (d) => {
      setDetails(d);
  };
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
    setTimeout(() => {
      showDetails(true)
    }, 5000);
    return (
      <DynamicSideContent className='monitoring-content' hideSideContent="true">
      <Bar
        design="Header">
          <Button design="Transparent" icon="slim-arrow-left" slot="startContent" ui5-button="" icon-only="" has-icon="" onClick={props.onClick}></Button>
          </Bar>
          <DynamicPage
            headerContent={
            <DynamicPageHeader>
              <FlexBox wrap="Wrap">
                <FlexBox direction="Column">
                  <Label>Location: Warehouse A</Label>
                  <Label>Halway: 23L</Label>
                  <Label>Rack: 34</Label>
                </FlexBox>
                <span style={{width: '1rem'}} />
                <FlexBox direction="Column">
                  <Label>Availability:</Label>
                  <ObjectStatus state="Success">In Stock</ObjectStatus>
                </FlexBox>
              </FlexBox>
            </DynamicPageHeader>}
            headerTitle={
              <DynamicPageTitle actions={<>
                <Button design="Emphasized">Edit</Button>
                <Button design="Transparent">Delete</Button>
                <Button design="Transparent">Copy</Button>
                <Button design="Transparent" icon="action"/></>} 
                breadcrumbs={
                  <Breadcrumbs>
                    <BreadcrumbsItem>Home</BreadcrumbsItem>
                  </Breadcrumbs>} 
                expandedContent={<MessageStrip>Information (only visible if header content is expanded)</MessageStrip>} 
                header={<Title>Header Title</Title>} 
                navigationActions={<>
                  <Button design="Transparent" icon="full-screen"/>
                  <Button design="Transparent" icon="exit-full-screen"/>
                  <Button design="Transparent" icon="decline"/></>} 
                snappedContent={<MessageStrip>Information (only visible if header content is collapsed/snapped)</MessageStrip>} subHeader={<Label>This is a sub header</Label>}><Badge>Status: OK</Badge>
              </DynamicPageTitle>}
            onPinnedStateChange={function _a(){}}
            onToggleHeaderContent={function _a(){}}
            style={{
              maxHeight: '700px'
            }}>
            <motion.div style={{flex:"1 1 auto"}}
                variants={wrapperVariants}
                initial="hidden"
                animate={!details ? 'visible' : 'hidden'}
                exit="exit">
                    <BusyIndicator
                      active
                      delay={1000}
                      size="Medium"
                    />
            </motion.div>
            <motion.div style={{flex:"1 1 auto"}}
                variants={wrapperVariants}
                initial="visible"
                animate={details ? 'visible' : 'hidden'}
                exit="exit">
                  <Table
                      columns={<><TableColumn style={{width: '12rem'}}><span>Product</span></TableColumn><TableColumn minWidth={800} popinText="Supplier"><span>Supplier</span></TableColumn><TableColumn demandPopin minWidth={600} popinText="Dimensions"><span>Dimensions</span></TableColumn><TableColumn demandPopin minWidth={600} popinText="Weight"><span>Weight</span></TableColumn><TableColumn><span>Price</span></TableColumn></>}
                      onLoadMore={function _a(){}}
                      onPopinChange={function _a(){}}
                      onRowClick={function _a(){}}
                      onSelectionChange={function _a(){}}>
                        <TableRow>
                          <TableCell>
                            <span>
                              Notebook Basic
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              Very Best Screens
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              30 x 18 x 3cm
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              4.2KG
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              956EUR
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <span>
                              Notebook Basic 17HT-1001
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              Very Best Screens
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              29 x 17 x 3.1cm
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              4.5KG
                            </span>
                          </TableCell>
                          <TableCell>
                            <span>
                              1249EUR
                            </span>
                          </TableCell>
                        </TableRow>
                  </Table>
                </motion.div>
            </DynamicPage>
          </DynamicSideContent>
        
      );
}
export default MonitoringPageDetails;