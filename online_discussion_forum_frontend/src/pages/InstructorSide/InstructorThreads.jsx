import { Box, Button, Card, CardContent, CardMedia, Grid, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ForumDisplay from '../../components/forumDisplay';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';

const InstructorThreads = () => {
  const [threads, setThreads] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { forumId } = useParams();

  const handleThreadClick = (threadId) => {
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
    
    navigate(`/instructor/${forumId}/${threadId}/`);
  }

  const handleVote = async (id, vote) => {
    try {
      await axiosPrivate.patch(`/forums/${forumId}/threads/${id}/vote`, { vote: vote }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
    } catch (err) {
      console.log(err);
    }
  }

  const fetchThreads = async () => {
    try {
      const response = await axiosPrivate.get(`/forums/${forumId}/threads`);
      const threadData = response.data.thread.map(thread => ({
        userId: thread.user,
        username: thread.username,
        forumPost: thread.forumPost,
        title: thread.title,
        content: thread.content,
        image: thread.image,
        upvotes: thread.upvotes,
        downvotes: thread.downvotes,
        viewCount: thread.viewCount,
        commentCount: thread.commentCount,
        edited: thread.edited,
        pinned: thread.pinned,
        timestamp: new Date(thread.timestamp).toLocaleDateString(),
        _id: thread._id,
      }));
      console.log(response.data)
      setThreads(threadData);
    } catch (error) {
      console.log(error);
      navigate('/admin/login', { state: { from: location }, replace: true });
    }
  };

  useEffect(() => {
    fetchThreads(); // Trigger fetching of threads
  }, [axiosPrivate, forumId, navigate, location]);



  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
    >
      <ForumDisplay />
      {threads.length ? (
        <Grid container spacing={2} direction={'column'} width={'55dvw'}>
          {threads.map((thread) => (
            <Grid item key={thread._id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', height: '200px', }}>
                <Stack height={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <CardContent sx={{
                    width: '45dvw'
                  }} onClick={() => handleThreadClick(thread._id)} style={{ cursor: 'pointer' }}>
                    <Stack direction={'row'} spacing={2}>
                      <Typography onClick={(e) => e.stopPropagation()}>{thread.username}</Typography> {/* Prevent navigation */}
                      <Typography>{thread.timestamp}</Typography>
                      <Typography>{thread.edited === true ? 'edited' : ''}</Typography>
                    </Stack>
                    <Typography variant="h6" sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                    }}>{thread.title}</Typography>
                    <Typography sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical',
                    }}>{thread.content}</Typography>
                    <Stack direction={'row'} spacing={2}>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        handleVote(thread._id, 'upvote');
                      }} startIcon={<ThumbUpOffAltIcon />} sx={{
                        color: '#000000',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#1976d2'
                        }
                      }}><Typography>{thread.upvotes}</Typography></Button>
                      <Button onClick={(e) => {
                        e.stopPropagation();
                        handleVote(thread._id, 'downvote');
                      }} startIcon={<ThumbDownIcon />}><Typography>{thread.downvotes}</Typography></Button> {/* Prevent navigation */}
                      <Button startIcon={<CommentIcon />}><Typography>{thread.commentCount}</Typography></Button>
                      <Button startIcon={<VisibilityIcon />}><Typography>{thread.viewCount}</Typography></Button>
                    </Stack>
                  </CardContent>
                  <CardMedia
                    component="img"
                    style={{ borderRadius: '30px', height: '150px', width: '120px', objectFit: 'none', marginRight: '20px' }}
                    image={thread.image && thread.image[0] ? `http://localhost:3000/images/${thread.image[0]}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
                  />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No threads found</Typography>
      )}
    </Box>
  )
}

export default InstructorThreads
