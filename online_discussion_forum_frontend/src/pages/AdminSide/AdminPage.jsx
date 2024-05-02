import React, { useEffect, useState } from 'react';
import useLogout from '../../hooks/useLogout';
import { Box, Grid } from '@mui/material';
import Dashboard from './Dashboard';

import SideNav from '../../components/sideNav';
import NavBar from '../../components/navBar';
import { Outlet } from 'react-router-dom';

const AdminPage = () => {
  return (
    <Box
      height={"100dvh"}
      width={"100dvw"}
      display={"flex"}
      flexDirection={"row"}
      bgcolor={"grey"}
    >
      <SideNav />
      <Box
        flex={4}
        bgcolor={"#f2f2f2"}
        paddingLeft={'30px'}
      >
        <NavBar />
        <Outlet />
      </Box>

      
    </Box>
  )
}

export default AdminPage;
