import React, { useState } from 'react'
import { Typography, Box, Tabs, Tab, Stack, Grid, Card, CardContent, Avatar } from '@mui/material/';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

const StudentList = () => {
	const [users, setUsers] = useState([]);

	const axiosPrivate = useAxiosPrivate();
	const navigate = useNavigate();
	const location = useLocation();

	const handleStudentClick = (studentId) => {
		if (window.location.pathname.startsWith('/admin')) {
			navigate(`/admin/student/${studentId}/`)
		}
		else if (window.location.pathname.startsWith('/instructor')) {
			navigate(`/instructor/student/${studentId}/`)
		}
		else if (window.location.pathname.startsWith('/client')) {
			navigate(`/client/student/${studentId}/`)
		}
	}

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const getUsers = async () => {
			try {
				const response = await axiosPrivate.get('/users', {
					signal: controller.signal
				});
				const userData = response.data.users.map(user => ({
					_id: user._id,
					user_name: user.user_name,
					profile: user.profile,
					school_id: user.school_id,
					first_name: user.first_name,
					family_name: user.family_name,
					email: user.email,
					bio: user.bio,
					date_of_birth: user.date_of_birth,
					sex: user.sex,
					department: user.department,
					year_level: user.year_level,
					officer: user.officer,
					role: user.role
				}));
				isMounted && setUsers(userData);
			} catch (err) {
				console.log(err)
				navigate('/admin/login', { state: { from: location }, replace: true });
			}
		}

		getUsers();

		return () => {
			isMounted = false;
			controller.abort();
		}
	}, []);

	return (
		<Box sx={{
			paddingTop: '20px'
		}}>
			{users?.length ? (
				<Grid container spacing={2} direction="column" sx={{ width: '60vw' }}>
					{users.map((user) => (
						<Card
							key={user._id} // Add a unique key for each card
							sx={{
								border: '1px solid #ccc',
								borderRadius: '8px',
								display: 'flex',
								flexDirection: 'row',
								marginBottom: '20px'
							}}
						>
							<CardContent
								style={{ cursor: 'pointer' }}
								sx={{ width: '100%' }}
								onClick={() => handleStudentClick(user._id)}
							>
								<Box display="flex" flexDirection="row" gap={3}>
									<Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
										{user.profile ? (
											<img
												src={`http://localhost:3000/images/${user.profile}`}
												alt="userProfile"
												style={{
													width: '100%', 
													height: '100%', 
													objectFit: 'cover', 
													borderRadius: '50%' 
												}}
											/>
										) : (
											<img
												src={`https://picsum.photos/id/237/200/300`}
												alt="userProfile"
												style={{
													width: '100%', 
													height: '100%', 
													objectFit: 'cover', 
													borderRadius: '50%' 
												}}
											/>
										)}
									</Avatar>
									<Box display="flex" flexDirection="column">
										<Stack direction={'row'} gap={2} alignItems={'center'}>
											<Typography fontWeight={700} fontSize={'24px'}>{user.first_name + ' ' + user.family_name}</Typography>
											<Typography fontWeight={400} fontSize={'18px'}>{user.user_name}</Typography>
										</Stack>
										<Typography fontWeight={300} fontSize={'18px'} key={user.id}>
											{user.role.filter(role => role === 'Admin').length > 0 && (
												<span>Admin, </span>
											)}
											{user.role.filter(role => role === 'Student').length > 0 && (
												<span>Student</span>
											)}
										</Typography>
										<Typography fontWeight={400}>
											{user.bio}
										</Typography>
										<Typography fontWeight={400}>
											{user.department}
										</Typography>
										<Typography fontWeight={400}>
											{user.year_level} {user.department.toLowerCase().includes('college') ? 'Year' : 'Grade'}
										</Typography>
									</Box>
								</Box>
							</CardContent>
						</Card>
					))}
				</Grid>
			) : (
				<p>No users found</p>
			)}
		</Box>
	)
}

export default StudentList
