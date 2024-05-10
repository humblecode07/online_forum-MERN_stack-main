import React, { useState } from 'react'
import { Typography, Box, Tab, Stack, Avatar, Button, Paper } from '@mui/material/';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import Image from 'mui-image'
import { useEffect } from 'react';
import UserThreads from '../../components/userThreads';
import UserComments from '../../components/userComments';
import UserUpvoted from '../../components/userUpvoted';
import UserDownvoted from '../../components/userDownvoted';
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const Students = () => {
    const [student, setStudent] = useState();
    const [instructor, setInstructor] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { studentId } = useParams();

    const { auth } = useAuth()
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchStudentData = async () => {
            try {
                const response = await axiosPrivate.get(`/users/${studentId}`, {
                    signal: controller.signal
                });

                if (response.data && response.data.user && response.data.user.length > 0) {
                    const userData = response.data.user[0];
                    setStudent(userData);

                    // Fetch instructor data using the officer ID
                    if (userData.officer) {
                        const instructorResponse = await axiosPrivate.get(`/instructors/${userData.officer}`, {
                            signal: controller.signal
                        });

                        if (instructorResponse.data) {
                            setInstructor(instructorResponse.data);
                        }
                    }
                } else {
                    throw new Error('Response data is empty or missing user information');
                }
            } catch (err) {
                console.error(err);
                navigate('/login', { state: { from: location }, replace: true });
            }
        };

        fetchStudentData();

        return () => {
            controller.abort();
        };
    }, [axiosPrivate, studentId, navigate, location]);

    const handleStudentClick = () => {
        if (decoded.roles.includes('Admin')) {
            if (!window.location.pathname.startsWith('/client')) {
                // If the current path does not start with '/client', navigate to the admin page
                navigate(`/admin/student/${studentId}/settings`)
            }
            else {
                navigate(`/client/student/${studentId}/settings`)
            }
        } else if (decoded.roles.includes('Instructor')) {
            navigate(`/instructor/student/${studentId}/settings`)
        } else if (decoded.roles.includes('Student')) {
            console.log('reached');
            navigate(`/client/student/${studentId}/settings`)
        }
    };

    return (
        <Box maxWidth={'60dvw'} width={'60dvw'} display={'flex'} justifyContent={'center'} paddingBottom={'300px'}>
            <Box width={'1202px'}>
                <Image height={'35dvh'} src={`https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto`} />
                {student && ( // Check if student data is available
                    <Stack direction={'row'} alignItems={'center'} marginBottom={'50px'}>
                        <Avatar src={student.profile ? `http://localhost:3000/images/${student.profile}` : `https://picsum.photos/id/237/200/300`} sx={{
                            width: 160,
                            height: 160,
                            border: '3px solid #f2f2f2',
                            marginTop: '-35px',
                            marginLeft: '25px',
                            marginRight: '15px'
                        }}
                        />
                        <Stack width={'34dvw'} maxWidth={'34dvw'}>
                            <Typography fontWeight={'700'} fontSize={'25px'}>{student.first_name + ' ' + student.family_name}</Typography>
                            <Typography>{student.user_name}</Typography>
                        </Stack>
                        {decoded.roles.includes('Admin') || decoded.userId === studentId ? (
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
                        width: 'fit-content', // or 'auto' for automatic width based on content
                        height: 'fit-content', // or 'auto' for automatic height based on content
                        maxWidth: '40%',
                        maxHeight: '300px',
                        borderRadius: '20px'
                    }}>
                        <Stack alignItems={'center'}>
                            <Typography fontWeight={700} fontSize={'24px'} marginBottom={'15px'}>Intro</Typography>
                            <Typography>{student?.bio}</Typography>
                        </Stack>
                    </Paper>
                    <Paper elevation={4} sx={{
                        padding: '20px',
                        paddingLeft: '10%',
                        paddingRight: '10%',
                        marginBottom: '50px',
                        width: 'fit-content', // or 'auto' for automatic width based on content
                        height: 'fit-content', // or 'auto' for automatic height based on content
                        maxHeight: '300px',
                        borderRadius: '20px'
                    }}>
                        <Stack alignItems={'center'} justifyContent={'center'}>
                            <Typography fontWeight={700} fontSize={'24px'} marginBottom={'15px'}>Details</Typography>
                            <Typography fontWeight={700}>School Id</Typography>
                            <Typography marginBottom={'5px'}>{student?.school_id}</Typography>
                            <Typography fontWeight={700}>Education Level</Typography>
                            <Typography marginBottom={'5px'}>{student?.department}</Typography>
                            <Typography fontWeight={700}>Level</Typography>
                            <Typography marginBottom={'5px'}>{student?.year_level}</Typography>
                            <Typography fontWeight={700}>Instructor</Typography>
                            <Typography>
                                {instructor && instructor.instructor.length > 0 ? `${instructor.instructor[0].first_name} ${instructor.instructor[0].family_name}` : "Instructor Name"}
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>
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

export default Students
