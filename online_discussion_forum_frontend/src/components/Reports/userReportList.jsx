import { Box } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const UserReportList = () => {
	const [users, setUsers] = useState([]);

	const axiosPrivate = useAxiosPrivate();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const instructorResponse = async (instructorId) => {
			try {
				const response = await axiosPrivate.get(`/instructors/${instructorId}`, {
					signal: controller.signal
				});
				console.log(response.data.instructor)
				return response.data.instructor[0].first_name + ' ' + response.data.instructor[0].family_name;
			} catch (error) {
				console.error("Error fetching instructor details:", error);
				return "Unknown"; // Return default value if fetching instructor details fails
			}
		};

		const getUsers = async () => {
			const mapYearLevel = (department, yearLevel) => {
				if (department === "College Level") {
					return `${yearLevel} Year`;
				} else {
					return `${yearLevel} Grade`;
				}
			};

			try {
				const response = await axiosPrivate.get('/users', {
					signal: controller.signal
				});

				const userData = await Promise.all(response.data.users.map(async (user) => {
					const instructorName = await instructorResponse(user.officer);
					return {
						id: user._id,
						user_name: user.user_name,
						profile: user.profile,
						school_id: user.school_id,
						first_name: user.first_name,
						family_name: user.family_name,
						email: user.email,
						bio: user.bio,
						date_of_birth: new Date(user.date_of_birth).toLocaleDateString(),
						sex: user.sex,
						department: user.department,
						year_level: mapYearLevel(user.department, user.year_level),
						officer: instructorName,
						role: user.role,
						threads: user.threads.length,
						comments: user.comments.length,
						upvotedThreads: user.upvotedThreads.length,
						downvotedThreads: user.downvotedThreads.length
					};
				}));

				isMounted && setUsers(userData);
			} catch (err) {
				console.log(err);
				navigate('/admin/login', { state: { from: location }, replace: true });
			}
		};


		getUsers();

		return () => {
			isMounted = false;
			controller.abort();
		}
	}, []);

	const columns = [
		{ field: 'school_id', headerName: 'ID', width: 150 },
		{ field: 'first_name', headerName: 'First Name', width: 150 },
		{ field: 'family_name', headerName: 'Family Name', width: 150 },
		{ field: 'date_of_birth', headerName: 'Date of Birth', width: 150 },
		{ field: 'sex', headerName: 'Sex', width: 150 },
		{ field: 'user_name', headerName: 'User Name', width: 150 },
		{ field: 'email', headerName: 'School Email', width: 150 },
		{ field: 'department', headerName: 'Department', width: 150 },
		{ field: 'year_level', headerName: 'Year Level', width: 150 },
		{ field: 'officer', headerName: 'Instructor', width: 150 },
		{ field: 'threads', headerName: 'Threads Created', width: 150 },
		{ field: 'comments', headerName: 'Comments Created', width: 150 },
		{ field: 'upvotedThreads', headerName: 'Upvoted Comments', width: 150 },
		{ field: 'downvotedThreads', headerName: 'Dowvoted Comments', width: 150 },
	];

	return (
		<Box sx={{
			width: '60dvw'
		}}>
			<DataGrid rows={users} columns={columns} slots={{ toolbar: GridToolbar }} />
		</ Box>
	)
}

export default UserReportList
