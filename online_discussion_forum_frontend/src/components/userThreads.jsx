import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Typography, Stack, CardMedia } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import { jwtDecode } from 'jwt-decode';
import useAuth from '../hooks/useAuth';

const UserThreads = () => {
  const [threads, setThreads] = useState([]);
  const { auth } = useAuth()
  const { studentId } = useParams();
  const { instructorId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

  console.log(studentId)

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        let response;

        if (window.location.pathname.includes('/admin/student') || window.location.pathname.includes('/client')) {
          if (window.location.pathname.includes('/client/instructor')) {
            response = await axiosPrivate.get(`/instructors/${instructorId}`, {
              signal: controller.signal
            });
  
            if (response.data && response.data.instructor && response.data.instructor.length > 0) {
              const userData = response.data.instructor[0];
              const studentData = {
                _id: userData._id,
                threads: userData.threads
              }
              isMounted && setThreads(studentData);
            }
          }
          else {
            response = await axiosPrivate.get(`/users/${studentId}`, {
              signal: controller.signal
            });
  
            if (response.data && response.data.user && response.data.user.length > 0) {
              const userData = response.data.user[0];
              const studentData = {
                _id: userData._id,
                threads: userData.threads
              }
              isMounted && setThreads(studentData);
            }
          }

          
          console.log(response)
        }
        else if (window.location.pathname.includes('/instructor/')) {
          if (window.location.pathname.includes('/instructor/student')) {
            response = await axiosPrivate.get(`/users/${studentId}`, {
              signal: controller.signal
            });

            if (response.data && response.data.user && response.data.user.length > 0) {
              const userData = response.data.user[0];
              const studentData = {
                _id: userData._id,
                threads: userData.threads
              }
              isMounted && setThreads(studentData);
            }
          }
          else {
            response = await axiosPrivate.get(`/instructors/${instructorId}`, {
              signal: controller.signal
            });

            if (response.data && response.data.instructor && response.data.instructor.length > 0) {
              const userData = response.data.instructor[0];
              const studentData = {
                _id: userData._id,
                threads: userData.threads
              }
              isMounted && setThreads(studentData);
            }
          }
        }
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
  }, [axiosPrivate, studentId, instructorId, navigate, location]);

  const handleStudentClick = (forumId, threadId) => {
    (async () => {
      try {
        await axiosPrivate.patch(`/forums/${forumId}/threads/${threadId}/checkView`);

      } catch (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
    });

		if (decoded.roles.includes('Admin')) {
			if (!window.location.pathname.startsWith('/client')) {
				navigate(`/admin/${forumId}/${threadId}`)
			}
			else {
				navigate(`/client/${forumId}/${threadId}`)
			}
		} else if (decoded.roles.includes('Instructor')) {
			navigate(`/instructor/${forumId}/${threadId}`)
		} else if (decoded.roles.includes('Student')) {
			console.log('reached');
      navigate(`/client/${forumId}/${threadId}`)
		}
	};

  return (
    <>
      {threads?.threads?.length ? (
        <Grid container spacing={2} direction="column" sx={{ width: '100%' }}>
          {threads.threads.map((thread) => (
            <Grid item key={thread._id} xs={12} sm={6} md={4} lg={3}
              onClick={() => {
                handleStudentClick(thread.forumPost, thread._id)
              }}
            >
              <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', height: '200px', }}>
                <Stack height={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <CardContent sx={{
                    width: '60%'
                  }} style={{ cursor: 'pointer' }}>
                    <Stack direction={'row'} spacing={2}>
                      <Typography>{thread.username}</Typography>
                      <Typography>{new Date(thread.timestamp).toLocaleDateString()}</Typography>
                      <Typography>{thread.edited === true ? 'edited' : ''}</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      fontSize: '16px',
                      marginBottom: '5px'
                    }}>{thread.title}</Typography>
                    <Typography sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      fontSize: '15px'
                    }}>{thread.content}</Typography>
                    <Stack direction={'row'} spacing={2}>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        // handleVote(thread._id, 'upvote');
                      }} startIcon={<ThumbUpOffAltIcon />} sx={{
                        color: '#1976d2',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#1976d2'
                        }
                      }}><Typography>{thread.upvotes}</Typography></Button>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        // handleVote(thread._id, 'downvote');
                      }} startIcon={<ThumbDownOffAltIcon />} sx={{
                        color: '#b01527',
                        '&:hover': {
                          bgcolor: 'b01527',
                          color: '#b01527'
                        }
                      }}><Typography>{thread.downvotes}</Typography></Button>
                      <Button startIcon={<CommentIcon />}><Typography>{thread.commentCount}</Typography></Button>
                      <Button startIcon={<VisibilityIcon />}><Typography>{thread.viewCount}</Typography></Button>
                    </Stack>
                  </CardContent>
                  <CardMedia
                    component="img"
                    style={{ borderRadius: '30px', height: '150px', width: '200px', objectFit: 'none', marginRight: '20px' }}
                    image={thread.image && thread.image[0] ? `http://localhost:3000/images/${thread.image[0]}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
                  />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : 'Nothing to display...'}
    </>
  )
}

export default UserThreads
