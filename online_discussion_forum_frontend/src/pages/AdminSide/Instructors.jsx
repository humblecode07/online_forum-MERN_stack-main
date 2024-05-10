import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Avatar, Box, Button, Grid, IconButton, Menu, MenuItem, Paper, Stack, Tab, Typography } from '@mui/material'
import Image from 'mui-image'
import React, { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import UserThreads from '../../components/userThreads';
import UserComments from '../../components/userComments';
import UserUpvoted from '../../components/userUpvoted';
import UserDownvoted from '../../components/userDownvoted';

const Instructors = () => {
    const [instructor, setInstructor] = useState();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useAuth()
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined
    const { instructorId } = useParams();

    const [value, setValue] = React.useState('1');
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    console.log(instructorId)

    useEffect(() => {
        const controller = new AbortController();

        const fetchStudentData = async () => {
            try {
                const response = await axiosPrivate.get(`/instructors/${instructorId}`, {
                    signal: controller.signal
                });

                setInstructor(response.data.instructor[0])
            } catch (err) {
                console.error(err);
                navigate('/login', { state: { from: location }, replace: true });
            }
        };

        fetchStudentData();

        return () => {
            controller.abort();
        };
    }, [axiosPrivate, instructorId, navigate, location]);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleGoProfile = async (studentId) => {
        if (decoded.roles.includes('Admin')) {
            if (!window.location.pathname.startsWith('/client')) {
                // If the current path does not start with '/client', navigate to the admin page
                await navigate(`/admin/student/${studentId}`)
            }
            else {
                await navigate(`/client/student/${studentId}`)
            }
        } else if (decoded.roles.includes('Instructor')) {
            console.log(studentId)
            await navigate(`/instructor/student/${studentId}`)
        } else if (decoded.roles.includes('Student')) {
            console.log('reached');
            await navigate(`/client/student/${studentId}`)
        }
    }

    const handleGoProfileSettings = async (studentId) => {
        if (decoded.roles.includes('Admin')) {
            if (!window.location.pathname.startsWith('/client')) {
                // If the current path does not start with '/client', navigate to the admin page
                await navigate(`/admin/student/${studentId}/settings`)
            }
            else {
                await navigate(`/client/student/${studentId}/settings`)
            }
        } else if (decoded.roles.includes('Instructor')) {
            await navigate(`/instructor/student/${studentId}/settings`)
        } else if (decoded.roles.includes('Student')) {
            console.log('reached');
            await navigate(`/client/student/${studentId}/settings`)
        }
    }

    const handleStudentClick = () => {
        if (decoded.roles.includes('Admin')) {
            navigate(`/admin/instructor/${instructorId}/settings`)
        } 
        else if (decoded.roles.includes('Instructor')) {
            navigate(`/instructor/profile/${instructorId}/settings`)
        }
        else {
            navigate(`/unauthorized`)
        }
    };

    console.log(instructor?.students)

    return (
        <Box maxWidth={'60dvw'} width={'60dvw'} display={'flex'} justifyContent={'center'} paddingBottom={'300px'}>
            <Box width={'1202px'}>
                <Image height={'35dvh'} src={`https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto`} />
                {instructor && (
                    <Stack direction={'row'} alignItems={'center'} marginBottom={'50px'}>
                        <Avatar src={instructor.profile ? `http://localhost:3000/images/${instructor.profile}` : `https://picsum.photos/id/237/200/300`} sx={{
                            width: 160,
                            height: 160,
                            border: '3px solid #f2f2f2',
                            marginTop: '-35px',
                            marginLeft: '25px',
                            marginRight: '15px'
                        }}
                        />
                        <Stack width={'34dvw'} maxWidth={'34dvw'}>
                            <Typography fontWeight={'700'} fontSize={'25px'}>{instructor.first_name + ' ' + instructor.family_name}
                                <span style={{ fontWeight: '300' }}> (Instructor)</span>
                            </Typography>
                            <Typography>{instructor.user_name}</Typography>
                        </Stack>
                        {decoded.roles.includes('Admin') || decoded.userId === instructorId ? (
                            <Button variant='contained' sx={{
                                width: '20%'
                            }}
                            onClick={() => {
                                handleStudentClick();
                            }}
                            >
                                Edit Profile
                            </Button>
                        ) : ''}
                    </Stack>
                )}
                <Stack direction={'row'} gap={5} justifyContent={'center'}>
                    <Paper elevation={4} sx={{
                        padding: '20px',
                        paddingLeft: '5%',
                        paddingRight: '5%',
                        marginBottom: '50px',
                        width: 'fit-content',
                        height: 'fit-content',
                        maxWidth: '40%',
                        maxHeight: '300px',
                        borderRadius: '20px'
                    }}>
                        <Stack alignItems={'center'}>
                            <Typography fontWeight={700} fontSize={'24px'} marginBottom={'15px'}>Intro</Typography>
                            <Typography>{instructor?.bio}</Typography>
                        </Stack>
                    </Paper>
                    <Paper elevation={4} sx={{
                        padding: '20px',
                        paddingLeft: '10%',
                        paddingRight: '10%',
                        marginBottom: '50px',
                        width: 'fit-content',
                        height: 'fit-content',
                        maxHeight: '300px',
                        borderRadius: '20px'
                    }}>
                        <Stack alignItems={'center'} justifyContent={'center'}>
                            <Typography fontWeight={700} fontSize={'24px'} marginBottom={'15px'}>Details</Typography>
                            <Typography fontWeight={700}>School Id</Typography>
                            <Typography marginBottom={'5px'}>{instructor?.school_id}</Typography>
                            <Typography fontWeight={700}>Subjects</Typography>
                            <Typography marginBottom={'5px'}>{instructor?.subjects}</Typography>
                        </Stack>
                    </Paper>
                </Stack>

                <Paper elevation={4} sx={{ padding: '20px' }} style={{ maxHeight: '700px', overflowY: 'auto', marginBottom: '40px' }}>
                    <Box margin={'0 auto'}>
                        <Typography variant="h5" sx={{
                            fontWeight: '700',
                            fontSize: '25px',
                            textAlign: 'center', // Center the text
                            marginBottom: '50px'
                        }}>Students</Typography>
                    </Box>
                    {instructor?.students?.length ? (
                        <Grid container spacing={5} direction={'row'} width={'100%'} justifyContent={'flex-start'}>
                            {instructor?.students.map((student) => (
                                <Grid item xs={6} key={student._id}>
                                    <Stack flexDirection={'row'} alignItems="center" width={'100%'}>
                                        <Avatar src={`http://localhost:3000/images/${student.profile}`} style={{ width: 80, height: 80, backgroundColor: 'primary.main' }} sx={{ marginRight: '10px' }} />
                                        <Stack flexDirection={'column'} alignItems={'flex-start'} width={'200px'}>
                                            <Typography>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {student.first_name}{' '}{student.family_name}
                                                </span>
                                            </Typography>
                                            <Typography sx={{ color: 'gray' }}>
                                                {student.user_name}
                                            </Typography>
                                        </Stack>
                                        <Box sx={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton aria-label="more" color="primary" onClick={handleClick}>
                                                <MoreHorizIcon />
                                            </IconButton>
                                            <Menu
                                                id="demo-positioned-menu"
                                                aria-labelledby="demo-positioned-button"
                                                anchorEl={anchorEl}
                                                open={open}
                                                onClose={handleClose}
                                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                            >
                                                <MenuItem onClick={() => {
                                                    handleClose();
                                                    handleGoProfile(student._id);
                                                }}>Check Profile</MenuItem>
                                                {decoded.roles.includes('Admin') || decoded.userId === student._id ? (
                                                    <MenuItem onClick={() => {
                                                        handleClose();
                                                        handleGoProfileSettings(student._id);
                                                    }}>Edit Profile</MenuItem>
                                                ) : ''}

                                            </Menu>
                                        </Box>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}
                </Paper>

                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange}>
                            <Tab label="Threads" value="1" />
                            <Tab label="Comments" value="2" />
                            <Tab label="Upvoted" value="3" />
                            <Tab label="Downvoted" value="4" />
                        </TabList>
                    </Box>
                    <TabPanel value="1"><UserThreads /></TabPanel>
                    <TabPanel value="2"><UserComments /></TabPanel>
                    <TabPanel value="3"><UserUpvoted /></TabPanel>
                    <TabPanel value="4"><UserDownvoted /></TabPanel>
                </TabContext>
            </Box>
        </Box>
    )
}

export default Instructors
