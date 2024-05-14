import { Stack, Avatar, Box, IconButton, Tooltip, MenuItem, Divider, ListItemIcon, Menu } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import useAuth from '../hooks/useAuth';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';
import useLogout from '../hooks/useLogout';
import SearchResultList from './searchResultList'
import SearchBar from './searchBar';
import { Affix, Layout } from 'antd';
import { Header } from 'antd/es/layout/layout';

const NavBar = ({ searchDisabled, searchType }) => {
  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const logout = useLogout();
  const [results, setResults] = useState([]);
  const [clicked, setClicked] = useState(false);

  const [userData, setUserData] = useState(null);
  const [imageData, setImageData] = useState(null);

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStudentClick = (studentId, settings) => {
    if (decoded.roles.includes('Admin')) {
      if (!window.location.pathname.startsWith('/client')) {
        navigate(`/admin/student/${studentId}/${settings ? 'settings' : ''}`);
      }
      else {
        navigate(`/client/student/${studentId}/${settings ? 'settings' : ''}`);
      }
    } else if (decoded.roles.includes('Instructor')) {
      navigate(`/instructor/${studentId}/${settings ? 'settings' : ''}`);
    } else if (decoded.roles.includes('Student')) {
      console.log('reached');
      navigate(`/client/student/${studentId}/${settings ? 'settings' : ''}`);
    }
  };

  const getUser = async () => {
    try {
      const response = await axiosPrivate.get(`/users/${decoded.userId}/`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })

      console.log(response)

      const fetchedUserData = response.data;

      const imageResponse = await axiosPrivate.get(`/images/${fetchedUserData?.user[0]?.profile}`, {
        responseType: 'blob',
        withCredentials: true
      });
      const imageUrl = URL.createObjectURL(imageResponse.data);
      setImageData(imageUrl);

      setUserData(fetchedUserData);
    }
    catch (err) {
      console.error('Error fetching user data:', err);
    }
  }
  useEffect(() => {
    if (decoded?.userId) {
      getUser();
    }
  }, [decoded?.userId]);

  return (
    <Layout style={{ padding: 0, paddingTop: '20px' }}>
      <Affix offsetTop={0} offsetBottom={0}>
        <Header style={{
          width: '100dvw',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          backgroundColor: '#fff', 
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        }}>
          <Stack direction={'column'}>
            <SearchBar setResults={setResults} setClicked={setClicked} searchDisabled={searchDisabled} searchType={searchType} />
            <SearchResultList results={results} isClicked={clicked} />
          </Stack>
          <Stack direction={'row'}>
            <IconButton aria-label="dark-mode">
              <DarkModeIcon />
            </IconButton>
          </Stack>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar sx={{
                cursor: 'pointer',
              }}>
                {userData && userData.user && userData.user.length > 0 && (
                  <img src={imageData} alt="Firefly" style={{ borderRadius: '50%' }} />
                )}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => {
              handleClose();
              handleStudentClick(decoded.userId, false)
            }}>
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              handleClose();
              handleStudentClick(decoded.userId, true)
            }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={() => {
              handleClose();
              logout();
            }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Header>
      </Affix>
    </Layout>
  )
}

export default NavBar
