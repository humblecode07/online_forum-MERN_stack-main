import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardContent, Grid, Typography, Stack, CardMedia } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import { jwtDecode } from 'jwt-decode';
import useAuth from '../hooks/useAuth';

const UserComments = () => {
  const [comments, setComments] = useState([]);
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
              comments: userData.comments
            }
            isMounted && setComments(studentData);
          }
          console.log(response);
        }
        else if (window.location.pathname.includes('/instructor/')) {
          response = await axiosPrivate.get(`/instructors/${instructorId}`, {
            signal: controller.signal
          });
          if (response.data && response.data.instructor && response.data.instructor.length > 0) {
            const userData = response.data.instructor[0];
            const studentData = {
              _id: userData._id,
              comments: userData.comments
            }
            isMounted && setComments(studentData);
          }
        }
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
  }, [axiosPrivate, studentId, instructorId, navigate, location]);


  const formatRelativeTime = (timestamp) => {
    const timestampDate = new Date(timestamp);
    const currentDate = new Date();
    const timeDifferenceMs = currentDate - timestampDate;
    const timeDifferenceSeconds = Math.floor(timeDifferenceMs / 1000);

    // Define time intervals
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 }
    ];

    // Format the output based on time difference
    for (const { label, seconds } of intervals) {
      const intervalCount = Math.floor(timeDifferenceSeconds / seconds);
      if (intervalCount > 0) {
        if (intervalCount === 1) {
          return `${intervalCount} ${label} ago`;
        } else {
          return `${intervalCount} ${label}s ago`;
        }
      }
    }

    return "just now";
  }

  const handleStudentClick = (forumId, threadId) => {
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
      {comments?.comments?.length ? (
        <Grid container spacing={2} direction="column" sx={{ width: '100%' }}>
          {comments.comments.map((comment) => (
            <Grid
              item
              key={comment._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              onClick={() => {
                handleStudentClick(comment.forumPost._id, comment.threadPost._id)
              }}
            >
              <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', height: '200px' }}>
                <Stack height={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <CardContent sx={{ width: '100%' }} style={{ cursor: 'pointer' }}>
                    <Stack direction={'row'} spacing={2} marginBottom={'8px'}>
                      <Typography fontWeight={700} fontSize={'14px'} >f/{comment?.forumPost?.name}</Typography>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          width: '50%'
                        }}
                      >
                        {comment.threadPost.title}
                      </Typography>
                    </Stack>
                    <Typography marginBottom={'10px'} fontSize={'14px'}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{comment.username}</span>
                      {' '}
                      {comment.parentId ? (
                        <>
                          replied to{' '}
                          <span style={{ fontSize: '12px', fontWeight: '700' }}>
                            {comment.threadPost.username}
                          </span>
                        </>
                      ) : (
                        'commented'
                      )}{' '}
                      {formatRelativeTime(comment.timestamp)}
                    </Typography>
                    <Typography marginBottom={'10px'} fontSize={'14px'} sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                    }}>{comment.content}</Typography>
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
                      }}><Typography>{comment.upvotes}</Typography></Button>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        // handleVote(thread._id, 'downvote');
                      }} startIcon={<ThumbDownOffAltIcon />} sx={{
                        color: '#b01527',
                        '&:hover': {
                          bgcolor: 'b01527',
                          color: '#b01527'
                        }
                      }}><Typography>{comment.downvotes}</Typography></Button>
                    </Stack>
                  </CardContent>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : 'Nothing to display...'}
    </>
  )
}

export default UserComments
