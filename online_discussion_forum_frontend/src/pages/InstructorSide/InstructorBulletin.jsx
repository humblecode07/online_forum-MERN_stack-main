import { Box, Button, Card, CardContent, CardMedia, Grid, IconButton, Menu, MenuItem, Modal, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CreateBoard from '../../modals/CreateBoard'
import { NavLink } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: 700,
  bgcolor: '#f2f2f2',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  overflowX: 'hidden'
};

const InstructorBulletin = () => {
  const [forums, setForums] = useState();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  const handleForumClick = (forumId) => {
    if (window.location.pathname.startsWith('/instructor')) {
      navigate(`/instructor/${forumId}/`)
    }
    else if (window.location.pathname.startsWith('/client')) {
      navigate(`/client/${forumId}/`)
    }
  }

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

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
  }, []);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event, forumId) => {
    setAnchorEl(event.currentTarget);
    getForumId(forumId);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [forumTitle, setForumTitle] = useState();
  const [forumDesc, setForumDesc] = useState();
  const [isEditing, setIsEditing] = useState(false) // For Updating Modal
  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenModalEdit = () => setOpenEdit(true);
  const handleCloseModalEdit = () => setOpenEdit(false);
  const [openDelete, setOpenDelete] = useState(false); // For Deleting Modal
  const [isDelete, setIsDelete] = useState(false)
  const handleOpenModalDelete = () => setOpenDelete(true);
  const handleCloseModalDelete = () => setOpenDelete(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  const [forumId, setForumId] = useState();

  const getForumId = (id) => {
    setForumId(id);
  }

  const editForum = async () => {
    const formData = new FormData();

    formData.append('name', forumTitle);
    formData.append('description', forumDesc);

    selectedFiles.forEach((file) => {
      formData.append('image', file);
    });

    try {
      const response = await axiosPrivate.patch(`/forums/${forumId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data); // log the response if needed
      handleCloseModalEdit();
      window.location.reload()
    }
    catch (error) {
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
  }

  const deleteForum = async () => {
    try {
      const response = await axiosPrivate.delete(`/forums/${forumId}`);
      console.log(response.data);
      handleCloseModalDelete();
      navigate(`/instructor/forums/`)
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
  }

  console.log(forums)

  return (
    <Box display={'flex'} flexDirection={'column'} width={'70dvw'}>
      <Stack direction={'row'} justifyContent={'space-between'} sx={{ marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ fontWeight: '700', fontSize: '30px', paddingRight: '50%' }}>Bulletin Board List</Typography>
        {decoded.roles.includes('Instructor') ? (
          <>
            <CreateBoard />
          </>
        ) : null}
      </Stack>

      {forums?.length ? (
        <Grid container spacing={2} direction={'column'} width={'70vw'}>
          {forums.map((forum) => (
            forum.type === "Bulletin" ? (
              <Grid item key={forum._id}>
                <Card sx={{ border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'row' }}>
                  <CardContent onClick={() => handleForumClick(forum._id)} style={{ cursor: 'pointer', width: '55vw' }}>
                    <Box display={'flex'} flexDirection={'row'}>
                      <Box width={'100%'}>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                          <Typography variant="h5" fontWeight={800}>{forum.forumName}</Typography>
                          <Box>
                            <IconButton aria-label="more" color="primary" onClick={(e) => {
                              e.stopPropagation();
                              handleClick(e, forum._id);
                            }}>
                              <MoreHorizIcon />
                            </IconButton>
                            <Menu
                              key={forum._id}
                              id="options-menu"
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl && forum._id === forumId)}
                              onClose={(e) => {
                                e.stopPropagation();
                                handleClose();
                              }}
                              autoFocus={true}
                            >
                              {decoded.userId === forum.user && (
                                <>
                                  <MenuItem onClick={() => setIsEditing(true)}>Edit</MenuItem>
                                  <MenuItem onClick={() => setIsDelete(true)}>Delete</MenuItem>
                                </>
                              )}
                              <MenuItem>Report</MenuItem>
                            </Menu>
                          </Box>
                        </Stack>
                        <Box style={{ maxHeight: '50px', overflowY: 'auto' }}>
                          <Typography marginBottom={'5px'}>{forum.description}</Typography>
                        </Box>
                        <div onClick={(e) => e.stopPropagation()} style={{ marginBottom: '5px', display: 'flex', flexDirection: 'row', gap: 5 }}>
                          <Typography>Creator: </Typography>
                          <NavLink style={{ textDecoration: 'underline' }} to={`/admin/${forum.creatorId}`}>{forum.creator}</NavLink>
                        </div>
                        <Typography marginBottom={'5px'}>{forum.creationTime}</Typography>
                        <Typography marginBottom={'5px'}>Total Threads: {forum.threads.length}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <Box>
                    <CardMedia
                      component="img"
                      onClick={() => handleForumClick(forum._id)}
                      style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px', height: '100%', width: '32vw', objectFit: 'cover', maxHeight: '2500px', marginRight: '20px', cursor: 'pointer' }}
                      image={forum.image !== '' ? `http://localhost:3000/images/${forum.image}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'}
                      alt={`Image`}
                    />
                  </Box>
                </Card>
              </Grid>
            ) : null
          ))}
        </Grid>
      ) : (
        <Typography>No Bulletins found</Typography>
      )}

      {isEditing && (
        <Modal
          open={openEdit}
          onClose={handleCloseModalEdit}
        >
          <Box sx={style} >
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Update Forum
              </Typography>
            </Box>
            <Box sx={{
              maxHeight: '60vh', // Adjusted to use vh unit instead of dvh
            }}>
              <TextField
                id="outlined-basic"
                label="Thread Title"
                variant="outlined"
                fullWidth
                multiline
                maxRows={4}
                value={forumTitle}
                onChange={(e) => setForumTitle(e.target.value)}
                InputProps={{
                  sx: {
                    '& input': {
                      maxHeight: '100%',
                      borderRadius: '25px',
                    },
                    borderRadius: '25px',

                  }
                }}
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
                  marginBottom: '20px',
                  maxHeight: '60vh',
                }}
              />
            </Box>
            <Box sx={{
              maxHeight: '60vh', // Adjusted to use vh unit instead of dvh
              marginBottom: '20px'
            }}>
              <TextField
                id="outlined-basic"
                label="Content"
                variant="outlined"
                fullWidth
                multiline
                maxRows={10}
                value={forumDesc}
                onChange={(e) => setForumDesc(e.target.value)}
                InputProps={{
                  sx: { borderRadius: '25px' }
                }}
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
                }}
              />
            </Box>
            <div style={{
              marginBottom: '20px'
            }}>
              <input type="file" multiple accept=".png,.jpeg,.jpg" onChange={handleFileChange} />
            </div>
            <Button variant='contained' sx={{
              width: '100%'
            }} onClick={editForum}>Submit</Button>
          </Box>
        </Modal>
      )}
      {isDelete && (
        <>
          <Modal
            open={openDelete}
            onClose={handleCloseModalDelete}
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={'10px'}>
                Delete Thread?
              </Typography>
              <Typography id="modal-modal-title" marginBottom={'30px'}>
                Once you delete this post, it can’t be restored.
              </Typography>
              <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} gap={1}>
                <Button onClick={handleCloseModalDelete} variant='contained' sx={{
                  borderRadius: '20px'
                }}>
                  No {'>:('}
                </Button>
                <Button onClick={deleteForum} variant='contained' sx={{
                  borderRadius: '20px'
                }}>
                  Yes, Delete
                </Button>
              </Box>

            </Box>
          </Modal>
        </>
      )}
    </Box>
  )
}

export default InstructorBulletin
