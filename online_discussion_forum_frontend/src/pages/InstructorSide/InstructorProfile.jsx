import { Avatar, Box, Button, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { jwtDecode } from 'jwt-decode';
import useAuth from '../../hooks/useAuth';
import Image from 'mui-image';

const InstructorProfile = () => {
	const [instructor, setInstructor] = useState();
	const axiosPrivate = useAxiosPrivate();
	const navigate = useNavigate();
	const location = useLocation();
	const { instructorId } = useParams();

	const { auth } = useAuth()
	const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

	const [value, setValue] = React.useState('1');

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	useEffect(() => {
		const controller = new AbortController();

		const fetchInstructorData = async () => {
			try {
				const response = await axiosPrivate.get(`/instructors/${instructorId}`, {
					signal: controller.signal
				});

				if (response.data && response.data.user && response.data.user.length > 0) {
					const userData = response.data.user[0];
					setInstructor(userData);
				} else {
					throw new Error('Response data is empty or missing user information');
				}
			} catch (err) {
				console.error(err);
				navigate('/login', { state: { from: location }, replace: true });
			}
		};

		fetchInstructorData();

		return () => {
			controller.abort();
		};
	}, [axiosPrivate, instructorId, navigate, location]);

	const handleStudentClick = () => {
		navigate(`/instructor/profile/${instructorId}/settings`)
	};

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
                            <Typography fontWeight={'700'} fontSize={'25px'}>{instructor.first_name + ' ' + instructor.family_name}</Typography>
                            <Typography>{instructor.user_name}</Typography>
                        </Stack>
                        <Button variant='contained' sx={{
                            width: '20%'
                        }}
                            onClick={() => {
                                handleStudentClick();
                            }}
                        >
                            Edit Profile
                        </Button>
                    </Stack>
                )}
			</Box>
		</Box>
	)
}

export default InstructorProfile
