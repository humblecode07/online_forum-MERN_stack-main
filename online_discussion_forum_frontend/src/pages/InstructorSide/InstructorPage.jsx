import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import SideNav from '../../components/Instructor/sideNav'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom/dist/umd/react-router-dom.development';
import NavBar from '../../components/Instructor/navBar';

const InstructorPage = () => {
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

  console.log(window.location.href)

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
      <Box flex={'none'}>
        <SideNav />
      </Box>
      <Box sx={{ overflowX: 'hidden' }}>
        <NavBar searchDisabled={searchDisabled} searchType={searchType} />
        <Box width={'50vw'} sx={{ paddingLeft: '5%' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default InstructorPage
