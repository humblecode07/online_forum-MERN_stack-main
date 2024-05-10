import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';
import { Avatar, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const InstructorsList = () => {
  const [instructors, setInstructors] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const handleInstructorClick = (instructorId) => {
    if (window.location.pathname.startsWith('/admin')) {
      navigate(`/admin/instructor/${instructorId}/`)
    }
    else if (window.location.pathname.startsWith('/instructor')) {
      navigate(`/instructor/profile/${instructorId}/`)
    }
    else if (window.location.pathname.startsWith('/client')) {
      navigate(`/client/instructor/${instructorId}/`)
    }
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get('/instructors', {
          signal: controller.signal
        });

        console.log(response)
        const instructorData = response.data.instructors.map(instructor => ({
          _id: instructor._id,
          user_name: instructor.user_name,
          profile: instructor.profile,
          school_id: instructor.school_id,
          first_name: instructor.first_name,
          family_name: instructor.family_name,
          email: instructor.email,
          bio: instructor.bio,
          date_of_birth: instructor.date_of_birth,
          sex: instructor.sex,
          subjects: instructor.subjects,
          role: instructor.role
        }));
        isMounted && setInstructors(instructorData);
      } catch (err) {
        console.log(err)
        navigate('/login', { state: { from: location }, replace: true });
      }
    }

    getUsers();

    return () => {
      isMounted = false;
      controller.abort();
    }
  }, []);

  console.log(instructors?.length)

  return (
    <Box sx={{
      paddingTop: '20px'
    }}>
      {instructors?.length ? (
        <Grid container spacing={2} direction="column" sx={{ width: '60vw' }}>
          {instructors.map((instructor) => (
            <Card
              key={instructor._id} // Add a unique key for each card
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
                onClick={() => handleInstructorClick(instructor._id)}
              >
                <Box display="flex" flexDirection="row" gap={3}>
                  <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                    {instructor.profile ? (
                      <img
                        src={`http://localhost:3000/images/${instructor.profile}`}
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
                      <Typography fontWeight={700} fontSize={'24px'}>{instructor.first_name + ' ' + instructor.family_name}</Typography>
                      <Typography fontWeight={400} fontSize={'18px'}>{instructor.user_name}</Typography>
                    </Stack>
                    <Typography fontWeight={300} fontSize={'18px'} key={instructor.id}>
                      Instructor
                    </Typography>
                    <Typography fontWeight={400}>
                      {instructor.bio}
                    </Typography>
                    <Typography fontWeight={400}>
                    Subjects: {instructor.subjects.map(subject => subject.replace(/['"]+/g, '')).join(', ')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
      ) : (
        <Typography>No instructors to display</Typography>
      )}
    </Box>
  )
}

export default InstructorsList
