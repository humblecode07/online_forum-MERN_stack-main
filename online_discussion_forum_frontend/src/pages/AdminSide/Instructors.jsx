import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Avatar, Box, Button, Paper, Stack, Tab, Typography } from '@mui/material'
import Image from 'mui-image'
import React, { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

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
                navigate('/admin/login', { state: { from: location }, replace: true });
            }
        };

        fetchStudentData();

        return () => {
            controller.abort();
        };
    }, [axiosPrivate, instructorId, navigate, location]);

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
                        <Button variant='contained' sx={{
                            width: '20%'
                        }}
                        // onClick={() => {
                        //     handleStudentClick();
                        // }}
                        >
                            Edit Profile
                        </Button>
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
                            <Typography>{instructor?.bio}</Typography>
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
                            <Typography marginBottom={'5px'}>{instructor?.school_id}</Typography>
                            <Typography fontWeight={700}>Subjects</Typography>
                            <Typography marginBottom={'5px'}>{instructor?.subjects}</Typography>
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
                    <TabPanel value="1"> </TabPanel>
                    <TabPanel value="2"></TabPanel>
                    <TabPanel value="3"></TabPanel>
                    <TabPanel value="4"></TabPanel>
                </TabContext>
            </Box>
        </Box>
    )
}

export default Instructors
