import { Box, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Image from 'mui-image';
import CreateThreads from '../modals/CreateThreads'
import useAuth from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const ForumDisplay = () => {
  const [forum, setForum] = useState({});
  const { forumId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getForum = async () => {
      try {
        const response = await axiosPrivate.get(`/forums/${forumId}`, {
          signal: controller.signal
        });
    
        console.log(response.data); // Log the response data to inspect its structure
    
        const forumData = response.data.forum ? { // Check if response.data.forum exists
          _id: response.data.forum[0]._id,
          forumName: response.data.forum[0].name,
          creator: response.data.forum[0].creator,
          image: response.data.forum[0].image,
          creatorId: response.data.forum[0].user,
          description: response.data.forum[0].description,
          creationTime: new Date(response.data.forum[0].creationTime).toLocaleDateString(),
          threads: response.data.forum[0].threads
        } : null;
    
        isMounted && setForum(forumData); 
      } catch (err) {
        console.log(err);
        navigate('/login', { state: { from: location }, replace: true });
      }
    };

    getForum();

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, forumId, navigate, location]);

  console.log(forum)

  return (
    <Box width={'54dvw'} marginBottom={'50px'}>
      <Image
        height={'35dvh'}
        style={{ borderRadius: '20px', marginBottom: '25px' }}
        src={forum.image ? `http://localhost:3000/images/${forum.image}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
      />
      <Stack alignItems={'center'} justifyContent={'center'}>
        <Typography fontWeight={100} fontSize={'28px'}>{forum.forumName}</Typography>
        <Typography fontSize={'18px'} marginBottom={'30px'}>{forum.description}</Typography>
        
        {forum?.forumName?.startsWith('Announcements') ? decoded.roles.includes('Admin') || decoded.roles.includes('Instructor') ? <CreateThreads /> : null : <CreateThreads /> } 
      </Stack>
    </Box>
  );
};

export default ForumDisplay;
