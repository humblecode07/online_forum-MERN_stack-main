import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Affix } from 'antd';
import { Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Sider from 'antd/es/layout/Sider';
import ForumIcon from '@mui/icons-material/Forum';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';

const SideNav = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [userData, setUserData] = useState(null);
  const [imageData, setImageData] = useState(null);
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

  const getAdmin = async () => {
    try {
      const response = await axiosPrivate.get(`/instructors/${decoded.userId}/`, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      const fetchedUserData = response.data;

      console.log(fetchedUserData.instructor[0].profile)

      const imageResponse = await axiosPrivate.get(`/images/${fetchedUserData?.instructor[0]?.profile}`, {
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

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (decoded?.userId) {
      getAdmin();
    }
  }, [decoded?.userId]);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 900);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log(userData)

  return (
    <Layout style={{ padding: 0 }}>
      <Affix offsetTop={0}>
        <Sider collapsed={collapsed} trigger={null} collapsible className='sidebar' style={{
          height: '100dvh',
          backgroundColor: '#fff',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        }}>
          {!collapsed && (
            <Stack direction="column" spacing={1} alignItems="center" sx={{ marginBottom: '30px' }}>
              <Stack spacing={9} direction={'row'} justifyContent={'space-around'} alignItems={'center'} sx={{ paddingTop: '15px' }}>
                <Typography variant="h5" sx={{ paddingTop: '10px', paddingBottom: '10px', fontFamily: 'Roboto', fontSize: '20px', fontWeight: 300 }}>
                  DYCI HUB
                </Typography>
              </Stack>
              <Avatar src={userData && userData.instructor && userData.instructor.length > 0 ? imageData : null} style={{ width: 100, height: 100, backgroundColor: 'primary.main' }} />
              <Typography variant="h3" sx={{ paddingTop: '12px', fontFamily: 'Roboto', fontSize: '25px', fontWeight: 1000 }}>
                {userData && userData.instructor && userData.instructor.length > 0 && (
                  userData.instructor[0].first_name + ' ' + userData.instructor[0].family_name
                )}
              </Typography>
              <Typography variant="body1">
                Instructor
              </Typography>
            </Stack>
          )}
          <Menu theme='light'>
            <Menu.Item key="bulletin_board" icon={<FilterFramesIcon />}>
              <Link to="/instructor/bulletin$board">Bulletin Board</Link>
            </Menu.Item>
            <Menu.Item key="disc_forums" icon={<ForumIcon />}>
              <Link to="/instructor/forums">Discussion Forums</Link>
            </Menu.Item>
            <Menu.Item key="users" icon={<PeopleAltIcon />}>
              <Link to="/instructor/users">Users</Link>
            </Menu.Item>
          </Menu>
        </Sider>
      </Affix>
    </Layout>
  )
}

export default SideNav
