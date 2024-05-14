import { usePost } from "../context/PostContext"
import { CommentList } from "./commentList";
import { Box, Button, Typography, IconButton, Modal, Avatar } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useEffect } from "react";
import CommentForm from "./commentForm";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from 'jwt-decode'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#f2f2f2',
  borderRadius: '20px',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function Comment({ _id, user, profile, content, upvotes, downvotes, image, editedAt, username, timestamp, replies, forumPost, threadPost, upvotedBy, downvotedBy }) {
  const { auth } = useAuth()
  const { getReplies } = usePost();
  const childComments = getReplies(_id);
  const axiosPrivate = useAxiosPrivate();
  const [currentUpvotes, setCurrentUpvotes] = useState(upvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const [currentUpvotedBy, setCurrentUpvotedBy] = useState(upvotedBy);
  const [currentDownvotedBy, setCurrentDownvotedBy] = useState(downvotedBy);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false)
  const [isDelete, setIsDelete] = useState(false)
  const [open, setOpen] = useState(false); // For Delete Modal
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const toggleReply = () => {
    setIsReplying(prev => !prev);
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setCurrentUpvotes(upvotes);
    setCurrentDownvotes(downvotes);
  }, [upvotes, downvotes]);

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

  const timeOfPost = formatRelativeTime(timestamp)

  const [areChildrenHidden, setAreChildrenHidden] = useState(false)

  const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

  console.log(decoded)

  const handleVote = async (id, vote) => {
    try {
      await axiosPrivate.patch(`/forums/${forumPost}/threads/${threadPost}/comments/${id}/vote`, { vote: vote }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });


      if (vote === 'upvote') {
        if (!currentUpvotedBy.includes(decoded.userId)) {
          if (currentDownvotedBy.includes(decoded.userId)) {
            setCurrentDownvotedBy(prevDownvotedBy => prevDownvotedBy.filter(userId => userId !== decoded.userId));
            setCurrentDownvotes(prevCount => prevCount - 1);
          }
          setCurrentUpvotedBy(prevUpvotedBy => [...prevUpvotedBy, decoded.userId]);
          setCurrentUpvotes(prevCount => prevCount + 1);
        } else {
          setCurrentUpvotedBy(prevUpvotedBy => prevUpvotedBy.filter(userId => userId !== decoded.userId));
          setCurrentUpvotes(prevCount => prevCount - 1);
        }
      } else if (vote === 'downvote') {
        if (!currentDownvotedBy.includes(decoded.userId)) {
          if (currentUpvotedBy.includes(decoded.userId)) {
            setCurrentUpvotedBy(prevUpvotedBy => prevUpvotedBy.filter(userId => userId !== decoded.userId));
            setCurrentUpvotes(prevCount => prevCount - 1);
          }
          setCurrentDownvotedBy(prevDownvotedBy => [...prevDownvotedBy, decoded.userId]);
          setCurrentDownvotes(prevCount => prevCount + 1);
        } else {
          setCurrentDownvotedBy(prevDownvotedBy => prevDownvotedBy.filter(userId => userId !== decoded.userId));
          setCurrentDownvotes(prevCount => prevCount - 1);
        }
      }



    } catch (err) {
      console.log(err);
    }
  }

  const deleteComment = async () => {
    try {
      const response = await axiosPrivate.delete(`/forums/${forumPost}/threads/${threadPost}/comments/${_id}`);
      console.log(response.data); // log the response if needed
      handleCloseModal(); // close the modal after successful submission
      window.location.reload()
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
    <>
      <Box display={'flex'} flexDirection={'row'} gap={1}>
        <Avatar src={`http://localhost:3000/images/${profile}`} />
        <div className="comment">
          <div className="header">

            <span className="name">{username}</span>
            <span className="date">
              {editedAt ? 'edited ' + formatRelativeTime(editedAt) : '• ' + timeOfPost}
            </span>
          </div>
          <div>
            {isEditing ? (
              <CommentForm
                autoFocus={true}
                initialValue={content}
                edit={true}
                parentId={_id}
              />
            ) : (
              <Typography sx={{
                marginBottom: '20px'
              }}>{content}</Typography>
            )}
            {image && (
              <div>
                <img
                  style={{ borderRadius: '8px', height: 'auto', width: '25%', objectFit: 'cover' }}
                  src={`${image ? `http://localhost:3000/images/${image}` : ''}`}
                />
              </div>
            )}
          </div>
          <div className="footer">
            <Button onClick={(e) => {
              e.stopPropagation();
              handleVote(_id, 'upvote');
            }} startIcon={<ThumbUpOffAltIcon />} sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'transparent',
                color: '#1976d2'
              }
            }}><Typography>{currentUpvotes}</Typography></Button>
            <Button onClick={(e) => {
              e.stopPropagation();
              handleVote(_id, 'downvote');
            }} startIcon={<ThumbDownOffAltIcon />} sx={{
              color: '#b01527',
              '&:hover': {
                bgcolor: 'b01527',
                color: '#b01527'
              }
            }}><Typography>{currentDownvotes}</Typography></Button>
            <IconButton
              aria-label="reply"
              color="primary"
              onClick={toggleReply}
            >
              <ReplyIcon />
            </IconButton>
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
                {decoded.userId === user && (
                  <Box>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        setIsEditing(prev => !prev);
                      }}
                      selected={isEditing}
                    >{isEditing ? "Cancel Edit" : "Edit"}</MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        setIsDelete(true); // Set isDelete to true to open the modal
                        handleOpenModal(); // Open the modal
                      }}

                    >Delete</MenuItem>
                  </Box>
                )}
                <MenuItem onClick={handleClose}>Report</MenuItem>
              </Menu>
            </Box>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </div>
      </Box>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus={false}
            reply={true}
            parentId={_id}
          />
        </div>
      )}
      {isDelete && (
        <>
          <Modal
            open={open}
            onClose={handleCloseModal}
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2" marginBottom={'10px'}>
                Delete Comment?
              </Typography>
              <Typography id="modal-modal-title" marginBottom={'30px'}>
                Once you delete this comment, it can’t be restored.
              </Typography>
              <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'} gap={1}>
                <Button onClick={handleCloseModal} variant='contained' sx={{
                  borderRadius: '20px'
                }}>
                  No {'>:('}
                </Button>
                <Button onClick={deleteComment} variant='contained' sx={{
                  borderRadius: '20px'
                }}>
                  Yes, Delete
                </Button>
              </Box>

            </Box>
          </Modal>
        </>
      )}
      {childComments?.length > 0 && (
        <>
          <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>

          </div>
        </>
      )}
    </>
  );
}
