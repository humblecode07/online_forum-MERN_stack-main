import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Typography, Stack, CardMedia } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const UserUpvoted = () => {
  const [upvoted, setUpvoted] = useState([]);
  const { studentId } = useParams();
  const { instructorId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const { auth } = useAuth()
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        let response;

        if (window.location.pathname.includes('/student')) {
          response = await axiosPrivate.get(`/users/${studentId}`, {
            signal: controller.signal
          });

          if (response.data && response.data.user && response.data.user.length > 0) {
            const userData = response.data.user[0];
            const studentData = {
              _id: userData._id,
              upvotedThreads: userData.upvotedThreads
            }
            isMounted && setUpvoted(studentData);
          }
          console.log(response)
        }
        else if (window.location.pathname.includes('/instructor/')) {
          response = await axiosPrivate.get(`/instructors/${instructorId}`, {
            signal: controller.signal
          });

          if (response.data && response.data.instructor && response.data.instructor.length > 0) {
            const userData = response.data.instructor[0];
            const studentData = {
              _id: userData._id,
              upvotedThreads: userData.upvotedThreads
            }
            isMounted && setUpvoted(studentData);
          }
        }
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
    })();

    if (decoded.roles.includes('Admin')) {
      if (!window.location.pathname.startsWith('/client')) {
        // If the current path does not start with '/client', navigate to the admin page
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
      {upvoted?.upvotedThreads?.length ? (
        <Grid container spacing={2} direction="column" sx={{ width: '100%' }}>
          {upvoted.upvotedThreads.map((upvote) => (
            <Grid
              item
              key={upvote._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              onClick={() => {
                handleStudentClick(upvote.forumPost, upvote._id)
              }}
            >
              <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', height: '200px' }}>
                <Stack height={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <CardContent sx={{
                    width: '60%',
                    cursor: 'pointer' // Moved cursor style to CardContent
                  }}>
                    <Stack direction={'row'} spacing={2}>
                      <Typography>{upvote.username}</Typography>
                      <Typography>{new Date(upvote.timestamp).toLocaleDateString()}</Typography>
                      <Typography>{upvote.edited === true ? 'edited' : ''}</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      fontSize: '16px',
                      marginBottom: '5px'
                    }}>{upvote.title}</Typography>
                    <Typography sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                      fontSize: '15px'
                    }}>{upvote.content}</Typography>
                    <Stack direction={'row'} spacing={2}>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        // handleVote(upvote._id, 'upvote');
                      }} startIcon={<ThumbUpOffAltIcon />} sx={{
                        color: '#1976d2',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#1976d2'
                        }
                      }}><Typography>{upvote.upvotes}</Typography></Button>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        // handleVote(upvote._id, 'downvote');
                      }} startIcon={<ThumbDownOffAltIcon />} sx={{
                        color: '#b01527',
                        '&:hover': {
                          bgcolor: 'b01527',
                          color: '#b01527'
                        }
                      }}><Typography>{upvote.downvotes}</Typography></Button>
                      <Button startIcon={<CommentIcon />}><Typography>{upvote.commentCount}</Typography></Button>
                      <Button startIcon={<VisibilityIcon />}><Typography>{upvote.viewCount}</Typography></Button>
                    </Stack>
                  </CardContent>
                  <CardMedia
                    component="img"
                    style={{ borderRadius: '30px', height: '150px', width: '200px', objectFit: 'none', marginRight: '20px' }}
                    image={upvote.image && upvote.image[0] ? `http://localhost:3000/images/${upvote.image[0]}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
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

export default UserUpvoted
