import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import SideNav from '../../components/Clients/sideNav';
import NavBar from '../../components/navBar';

const StudentPage = () => {
  return (
    <Box
      height={"100dvh"}
      width={"100dvw"}
      display={"flex"}
      flexDirection={"row"}
      bgcolor={"#f2f2f2"}
      sx={{
        overflowX: 'hidden'
      }}
    >
      <SideNav />
      <Box
        flex={4}
        bgcolor={"#f2f2f2"}
        paddingLeft={'20dvw'}
      >
        <NavBar />
        <Outlet />
      </Box>
      <Box sx={{
        width: '15dvw'
      }}>
        
      </Box>
    </Box>
  )
}

export default StudentPage
