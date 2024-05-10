import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import Dashboard from './Dashboard';
import { styled } from '@mui/system';

import SideNav from '../../components/sideNav';
import NavBar from '../../components/navBar';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom/dist/umd/react-router-dom.development';
import { Layout } from 'antd';

const RootContainer = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch', // Stretch items vertically
};

const SideNavBox = styled(Box)({
  flex: 'none',
});


const AdminPage = () => {
  const [searchDisabled, setSearchDisabled] = useState(true);
  const [searchType, setSearchType] = useState();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("/admin/forums")) {
      setSearchDisabled(false);
      setSearchType('F');
    }
    else if (location.pathname.match(/^\/admin\/\w+\/threads/)) {
      setSearchDisabled(false);
      setSearchType('T');
    }
    else if (location.pathname.includes("/admin/bulletin$board")) {
      setSearchDisabled(false);
      setSearchType('F');
    }
    else if (location.pathname.includes("/admin/users")) {
      setSearchDisabled(false);
      setSearchType('U');
    }
    else {
      setSearchDisabled(true);
      setSearchType(null);
    }
  }, [location]);


  return (
    <Layout style={RootContainer}>
      <SideNavBox>
        <SideNav />
      </SideNavBox>
      <Box sx={{ overflowX: 'hidden' }}>
        <NavBar searchDisabled={searchDisabled} searchType={searchType} />
        <Box marginTop={'20px'} width={'50vw'} sx={{ paddingLeft: '5%' }}>
          <Outlet />
        </Box>
      </Box>
    </Layout>
  )
}

export default AdminPage;
