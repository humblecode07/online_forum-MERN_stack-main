import { Box, CardMedia, TextField, Typography, Stack, Button, IconButton, Modal } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useState } from 'react'
import useAuth from '../../hooks/useAuth';
import { usePost } from '../../context/PostContext';
import { useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import { jwtDecode } from 'jwt-decode';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import CommentForm from '../../components/commentForm';
import { CommentList } from '../../components/commentList';

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

const InstructorComments = () => {
  const { auth } = useAuth()
  const { post, rootComments } = usePost()
  const thread = post.thread;
  const { forumId } = useParams();
  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false)
  const [openEdit, setOpenEdit] = useState(false); // For Editing Modal
  const [threadTitle, setThreadTitle] = useState(thread.title);
  const [threadContent, setThreadContent] = useState(thread.content);
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
  };

  const timeOfPost = formatRelativeTime(thread.timestamp);

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

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const editThread = async () => {
    const formData = new FormData();

    formData.append('title', threadTitle);
    formData.append('content', threadContent);

    selectedFiles.forEach((file) => {
      formData.append('image', file);
    });

    try {
      const response = await axiosPrivate.patch(`/forums/${forumId}/threads/${thread._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data); // log the response if needed
      handleCloseModalEdit();
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
  };

  const deleteThread = async () => {
    try {
      const response = await axiosPrivate.delete(`/forums/${forumId}/threads/${thread._id}`);
      console.log(response.data);
      handleCloseModalDelete();
      navigate(`/admin/${forumId}/threads`)
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
  };


  return (
    <Box>
      {thread ? (
        <Box width={'55dvw'}>
          <Box display={'flex'} flexDirection={'row'}>
            <Box width={'55dvw'}>
              <Stack direction={'row'} sx={{
                color: 'hsl(235, 50%, 67%)',
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '1%',
                alignItems: 'center',
                fontSize: '.75em'
              }}>
                <Typography fontSize={'14px'}>f/{thread.forumPost.name}  {console.log(post.thread.user)}</Typography>
                <Typography fontSize={'14px'}>{thread.edited ? 'edited' : null}</Typography>
                <Typography fontSize={'14px'}>• {timeOfPost}</Typography>
              </Stack>
              <Stack direction={'row'} sx={{
                color: 'hsl(235, 50%, 67%)',
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '1%',
                alignItems: 'center',
                marginBottom: '.75rem',
                fontSize: '.75em'
              }}>
                <Typography fontSize={'14px'}>{thread.username} </Typography>
              </Stack>
            </Box>
            <Box>
              <IconButton aria-label="more" color="primary" onClick={handleClick}>
                <MoreHorizIcon />
              </IconButton>
              <Menu
                id="options-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {decoded.userId === post.thread.user && (
                  <>
                    
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        setIsEditing(true);
                        handleOpenModalEdit();
                      }}
                      selected={isEditing}
                    >
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        setIsDelete(true);
                        handleOpenModalDelete();
                      }}
                    >
                      Delete
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={handleClose}>Report</MenuItem>
              </Menu>
            </Box>
          </Box>
          <Box marginBottom={'20px'}>
            <Typography fontSize={'22px'} fontWeight={'700'} marginBottom={'20px'}>{thread.title}</Typography>
            <Typography fontSize={'14px'}>{thread.content}</Typography>
          </Box>
          <Box marginBottom={'10px'}>
            {thread.image.length > 1 ? <Carousel navButtonsAlwaysVisible={true}
              navButtonsAlwaysInvisible={false} cycleNavigation={true}
              fullHeightHover={false} autoPlay={false} animation="slide" sx={{
                maxWidth: "600px",
              }}>
              {thread.image && thread.image.map((imageUrl, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  style={{ borderRadius: '30px', height: 'auto', width: '75%', objectFit: 'cover', marginRight: '20px' }}
                  image={`http://localhost:3000/images/${imageUrl}`}
                  alt={`Image ${index + 1}`}
                />
              ))}
            </Carousel> :
              <Box>
                {thread.image.length === 1 ? <CardMedia
                  component="img"
                  style={{ borderRadius: '30px', height: 'auto', width: '75%', objectFit: 'cover', marginRight: '20px' }}
                  image={`http://localhost:3000/images/${thread.image[0]}`}
                  alt={`Image`}
                /> : ''}
              </Box>
            }
          </Box>
          <Stack direction={'row'} spacing={2}>
            <Button onClick={(e) => {
              e.stopPropagation();
              handleVote(thread._id, 'upvote');
            }} startIcon={<ThumbUpOffAltIcon />} sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'transparent',
                color: '#1976d2'
              }
            }}><Typography>{thread.upvotes}</Typography></Button> {/* Prevent navigation */}
            <Button onClick={(e) => {
              e.stopPropagation();
              handleVote(thread._id, 'downvote');
            }} startIcon={<ThumbDownOffAltIcon />} sx={{
              color: '#b01527',
              '&:hover': {
                bgcolor: 'b01527',
                color: '#b01527'
              }
            }}><Typography>{thread.downvotes}</Typography></Button> {/* Prevent navigation */}
            <Button startIcon={<CommentIcon />}><Typography>{thread.commentCount}</Typography></Button>
            <Button startIcon={<VisibilityIcon />}><Typography>{thread.viewCount}</Typography></Button>
          </Stack>
        </Box>
      ) : (
        <Box>Loading...</Box>
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
                Update Thread
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
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
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
                value={threadContent}
                onChange={(e) => setThreadContent(e.target.value)}
                InputProps={{
                  sx: { borderRadius: '25px' }
                }}
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
                }}
              >{thread.content}</ TextField>
            </Box>
            <div style={{
              marginBottom: '20px'
            }}>
              <input type="file" multiple accept=".png,.jpeg,.jpg" onChange={handleFileChange} />
            </div>
            <Button variant='contained' sx={{
              width: '100%'
            }} onClick={editThread}>Submit</Button>
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
                <Button onClick={deleteThread} variant='contained' sx={{
                  borderRadius: '20px'
                }}>
                  Yes, Delete
                </Button>
              </Box>

            </Box>
          </Modal>
        </>
      )}
      <CommentForm />
      {(
        <div className="mt-4">
          <CommentList comments={rootComments} />
        </div>
      )}
    </Box>
  )
}

export default InstructorComments
