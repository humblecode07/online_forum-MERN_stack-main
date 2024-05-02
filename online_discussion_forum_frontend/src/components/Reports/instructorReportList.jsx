import { Box } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const InstructorReportList = () => {
  const [instructors, setInstructors] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getInstructors = async () => {
      try {
        const response = await axiosPrivate.get('/instructors', {
          signal: controller.signal
        });

        const instructorData = response.data.instructors.map(instructor => ({
          id: instructor._id,
          user_name: instructor.user_name,
          school_id: instructor.school_id,
          first_name: instructor.first_name,
          family_name: instructor.family_name,
          email: instructor.email,
          date_of_birth: instructor.date_of_birth,
          sex: instructor.sex,
          subjects: instructor.subjects,
          students: instructor.students.length,
          threads: instructor.threads.length,
          comments: instructor.comments.length,
          upvotedThreads: instructor.upvotedThreads.length,
          downvotedThreads: instructor.downvotedThreads.length
        }));

        isMounted && setInstructors(instructorData);
      }
      catch (err) {
        console.log(err);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    getInstructors();

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
    { field: 'subjects', headerName: 'Subjects', width: 150 },
    { field: 'students', headerName: 'Students Count', width: 150 },
		{ field: 'threads', headerName: 'Threads Created', width: 150 },
		{ field: 'comments', headerName: 'Comments Created', width: 150 },
		{ field: 'upvotedThreads', headerName: 'Upvoted Comments', width: 150 },
		{ field: 'downvotedThreads', headerName: 'Dowvoted Comments', width: 150 },
	];

  return (
    <Box sx={{
			width: '60dvw'
		}}>
      <DataGrid rows={instructors} columns={columns} slots={{ toolbar: GridToolbar }} />
    </Box>
  )
}

export default InstructorReportList
