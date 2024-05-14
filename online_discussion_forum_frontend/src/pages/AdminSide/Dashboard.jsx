import { Box, Button, Card, CardContent, CardMedia, Divider, Grid, Paper, Stack, Typography } from '@mui/material'
import PostAddIcon from '@mui/icons-material/PostAdd';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const Dashboard = () => {
  const [forums, setForums] = useState();
  const [students, setStudents] = useState();
  const [instructors, setInstructors] = useState()
  const [threads, setThreads] = useState();
  const [topThreads, setTopThreads] = useState([]);
  const [comments, setComments] = useState()
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const handleThreadClick = (forumId, threadId) => {
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

    console.log(`/admin/${forumId}/${threadId}`)
    navigate(`/admin/${forumId}/${threadId}/`);
  }

  const handleVote = async (forumId, threadId, vote) => {
    try {
      await axiosPrivate.patch(`/forums/${forumId}/threads/${threadId}/vote`, { vote: vote }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getForum = async () => {
      try {
        const response = await axiosPrivate.get(`/forums/`, {
          signal: controller.signal
        });
        const forumCount = response.data.forumCount
        isMounted && setForums(forumCount);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    const getStudents = async () => {
      try {
        const response = await axiosPrivate.get(`/users/`, {
          signal: controller.signal
        });
        const studentCount = response.data.userCount
        isMounted && setStudents(studentCount);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    const getInstructors = async () => {
      try {
        const response = await axiosPrivate.get(`/instructors/`, {
          signal: controller.signal
        });
        const instructorCount = response.data.instructorCount
        isMounted && setInstructors(instructorCount);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    const getThreads = async () => {
      try {
        const response = await axiosPrivate.get(`/threads/all`, {
          signal: controller.signal
        });
        console.log(response)
        const threadCount = response.data.threadCount;
        isMounted && setThreads(threadCount);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    const getComments = async () => {
      try {
        const response = await axiosPrivate.get(`/comments/all`, {
          signal: controller.signal
        });
        const commentCount = response.data.commentCount
        isMounted && setComments(commentCount);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    const getTopTenThreads = async () => {
      try {
        const response = await axiosPrivate.get(`/threads/topten`, {
          signal: controller.signal
        });
        const topTenThreads = response.data;
        isMounted && setTopThreads(topTenThreads);
      }
      catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    getForum();
    getStudents();
    getInstructors();
    getThreads();
    getTopTenThreads();
    getComments();

    return () => {
      isMounted = false;
    };
  }, [])

  return (
    <Box width={'55dvw'}>
      <Stack direction={'row'} justifyContent={'flex-start'} sx={{
        marginRight: '50px',
        marginBottom: '20px'
      }}>
        <Typography variant="h5" sx={{
          fontWeight: '700',
          fontSize: '30px',
        }}>Overview</Typography>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Number of Users:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon />
              <Typography>
                {students + instructors}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Number of Students:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon />
              <Typography>
                {students}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Number of Instructors:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon />
              <Typography>
                {instructors}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Total Threads Posted:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PostAddIcon />
              <Typography>
                {threads}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Total Comments Posted:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CommentIcon />
              <Typography>
                {comments}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
            <Typography variant="subtitle1" sx={{ marginBottom: '10px' }}>
              Total Forums Created:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ForumIcon />
              <Typography>
                {forums}
              </Typography>
            </Stack>
          </Paper>
        </Grid>


      </Grid>
      <Divider style={{ marginTop: '20px' }} />
      <Stack direction={'row'} justifyContent={'flex-start'} sx={{
        marginRight: '50px',
        marginBottom: '20px'
      }}>
        <Typography variant="h5" sx={{
          fontWeight: '700',
          fontSize: '20px',
          marginTop: '20px'
        }}>Top Ten Highest Post!</Typography>
      </Stack>
      {topThreads?.topThreads?.length ? (
        <Grid container spacing={2} direction={'column'}>
          {topThreads.topThreads.map((topThread) => {
            return (
              <Grid item key={topThread._id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', height: '200px', }}>
                  <Stack height={'100%'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <CardContent sx={{ width: '45dvw' }} onClick={() => handleThreadClick(topThread.forumPost, topThread._id)} style={{ cursor: 'pointer' }}>
                      <Stack direction={'row'} spacing={2}>
                        <Typography onClick={(e) => e.stopPropagation()}>{topThread.username}</Typography>
                        <Typography>{topThread.timestamp}</Typography>
                        <Typography>{topThread.edited === true ? 'edited' : ''}</Typography>
                      </Stack>
                      <Typography fontSize={'17px'} variant="h6" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical' }}>{topThread.title}</Typography>
                      <Typography
                        fontSize={'14px'}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: '2',
                          WebkitBoxOrient: 'vertical',
                          fontFamily: 'Roboto',
                          whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
                          margin: 0, // Ensure no extra margin
                          marginBottom: '10px'
                        }}
                      >
                        {topThread.content}
                      </Typography>
                      <Stack direction={'row'} spacing={2}>
                        <Button onClick={(e) => { e.stopPropagation(); handleVote(topThread.forumPost, topThread._id, 'upvote'); }} startIcon={<ThumbUpOffAltIcon />} sx={{ color: '#000000', '&:hover': { bgcolor: 'transparent', color: '#1976d2' } }}><Typography>{topThread.upvotes}</Typography></Button>
                        <Button onClick={(e) => { e.stopPropagation(); handleVote(topThread.forumPost, topThread._id, 'downvote'); }} startIcon={<ThumbDownOffAltIcon />} sx={{
                          color: '#b01527',
                          '&:hover': {
                              bgcolor: 'b01527',
                              color: '#b01527'
                          }
                        }}><Typography>{topThread.downvotes}</Typography></Button>
                        <Button startIcon={<CommentIcon />}><Typography>{topThread.commentCount}</Typography></Button>
                        <Button startIcon={<VisibilityIcon />}><Typography>{topThread.viewCount}</Typography></Button>
                      </Stack>
                    </CardContent>
                    <CardMedia
                      component="img"
                      style={{ borderRadius: '30px', height: '150px', width: '150px', objectFit: 'none', marginRight: '20px' }}
                      image={topThread.image && topThread.image[0] ? `http://localhost:3000/images/${topThread.image[0]}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
                    />
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : null}
    </Box>
  )
}

export default Dashboard
