import React, { useEffect, useState } from 'react'
import { Box, Button, Grid, InputLabel, Stack, Typography, Divider } from '@mui/material'
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const SideNav = () => {
  const [forums, setForums] = useState([])
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedForum, setSelectedForum] = useState(null); // State to track selected forum ID

  const handleForumClick = (forumId) => {
    setSelectedForum(forumId);
    navigate(`/client/${forumId}/`)
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getForums = async () => {
      try {
        const response = await axiosPrivate.get('/forums', {
          signal: controller.signal
        });
        const forumData = response.data.forums.map(forum => ({
          _id: forum._id,
          forumName: forum.name,
          creator: forum.creator,
          image: forum.image,
          creatorId: forum.user,
          description: forum.description,
          creationTime: new Date(forum.creationTime).toLocaleDateString(),
          threads: forum.threads,
          type: forum.type
        }));
        console.log(forumData)
        isMounted && setForums(forumData);
      } catch (err) {
        console.log(err)
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    }

    getForums();

    return () => {
      isMounted = false;
      controller.abort();
    }
  }, [])

  console.log(forums.length)

  return (
    <Box
      position={'fixed'}
      display={'flex'}
      flex={1}
      bgcolor={"#f2f2f2"}
      flexDirection={"column"}
      paddingLeft={'1dvw'}
    >

      <Box>
        <Stack spacing={9} direction={'row'} justifyContent={'center'} alignItems={'flex-start'} sx={{
          paddingTop: '15px',
          paddingBottom: '10px',
        }}>
          <Typography variant="h5" sx={{
            paddingTop: '10px',
            paddingBottom: '10px',
            fontFamily: 'Roboto',
            fontSize: '20px',
            fontWeight: 300,
          }}>DYCI HUB</Typography>
          <IconButton aria-label="minimize side-nav"><MenuIcon /></IconButton>
        </Stack>
        <Divider sx={{ marginBottom: '20px' }} />
        <Box display={'flex'} flexDirection={'column'} marginBottom={'20px'}>
          <InputLabel id="bulletin-board-label">Bulletin Board</InputLabel>
          {forums?.length ? (
            <Grid container spacing={1} direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'}>
              {forums.map((forum) => (
                <Grid item key={forum._id}>
                  {forum.type === "Bulletin" ? (
                    <Button
                      variant='contained'
                      onClick={() => handleForumClick(forum._id)}
                      sx={{
                        width: '200px',
                        justifyContent: 'flex-start',
                        marginBottom: '5px',
                        backgroundColor: selectedForum === forum._id ? '#1976d2' : 'transparent', // Apply color based on selection
                        color: selectedForum === forum._id ? 'white' : 'black', // Text color based on selection
                      }}
                    >
                      {forum.forumName}
                    </Button>
                  ) : null}
                </Grid>
              ))}
            </Grid>
          ) : null}
        </Box>
        <Box>
          <InputLabel id="bulletin-board-label">Discussion Forum</InputLabel>
          {forums?.length ? (
            <Grid container spacing={1} direction={'column'} justifyContent={'flex-start'} alignItems={'flex-start'}>
              {forums.map((forum) => (
                <Grid item key={forum._id}>
                  {forum.type === "Forums" ? (
                    <Button
                      variant='contained'
                      onClick={() => handleForumClick(forum._id)}
                      sx={{
                        width: '200px',
                        justifyContent: 'flex-start',
                        marginBottom: '5px',
                        backgroundColor: selectedForum === forum._id ? '#1976d2' : 'transparent', // Apply color based on selection
                        color: selectedForum === forum._id ? 'white' : 'black', // Text color based on selection
                      }}
                    >
                      {forum.forumName}
                    </Button>
                  ) : null}
                </Grid>
              ))}
            </Grid>
          ) : null}
        </Box>
      </Box>
      <Box>

      </Box>
    </Box>
  )
}

export default SideNav
