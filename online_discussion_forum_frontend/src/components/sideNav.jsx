import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Affix } from 'antd';
import { Stack, Typography } from '@mui/material';
import ForumIcon from '@mui/icons-material/Forum';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Sider from 'antd/es/layout/Sider';

const { Header } = Layout;

const SideNav = () => {
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const [userData, setUserData] = useState(null);
    const [imageData, setImageData] = useState(null);
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

    const getAdmin = async () => {
        try {
            const response = await axiosPrivate.get(`/users/${decoded.userId}/`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
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
                            <Avatar style={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                                {userData && userData.user && userData.user.length > 0 && (
                                    <img src={imageData} alt="Firefly" style={{ borderRadius: '50%' }} />
                                )}
                            </Avatar>
                            <Typography  variant="h3" sx={{ paddingTop: '12px', fontFamily: 'Roboto', fontSize: '25px', fontWeight: 1000 }}>
                                {userData && userData.user && userData.user.length > 0 && (
                                    userData.user[0].first_name + ' ' + userData.user[0].family_name
                                )}
                            </Typography>
                            <Typography  variant="body1">
                                Admin
                            </Typography>
                        </Stack>
                    )}
                    <Menu theme='light'>
                        <Menu.Item key="dashboard" icon={<DashboardIcon />} >
                            <Link to="/admin/dashboard">Dashboard</Link>
                        </Menu.Item>
                        <Menu.Item key="bulletin_board" icon={<FilterFramesIcon />}>
                            <Link to="/admin/bulletin$board">Bulletin Board</Link>
                        </Menu.Item>
                        <Menu.Item key="disc_forums" icon={<ForumIcon />}>
                            <Link to="/admin/forums">Discussion Forums</Link>
                        </Menu.Item>
                        <Menu.Item key="reports" icon={<AssessmentIcon />}>
                            <Link to="/admin/reports">Reports</Link>
                        </Menu.Item>
                        <Menu.Item key="users" icon={<PeopleAltIcon />}>
                            <Link to="/admin/users">Users</Link>
                        </Menu.Item>
                    </Menu>
                </Sider>
            </Affix>
        </Layout>
    );
}

export default SideNav;
