import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    maxHeight: 700,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
    overflowX: 'hidden'
};

const CreateThreads = ({ threadTitle, threadContent, edit }) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const axiosPrivate = useAxiosPrivate();
    const [threadName, setThreadName] = useState("");
    const [content, setContent] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (event) => {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    };

    const { forumId } = useParams();

    console.log("this is the forum id: " + forumId);

    const postThread = async () => {
        const formData = new FormData();

        formData.append('title', threadName);
        formData.append('content', content);

        selectedFiles.forEach((file) => {
            formData.append('image', file);
        });

        try {
            const response = await axiosPrivate.post(`/forums/${forumId}/threads`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data); // log the response if needed
            window.location.reload()
            handleClose(); // close the modal after successful submission
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

    useEffect(() => {
        console.log("Fetching thread content...");
        const fetchThreadContent = async () => {
          try {
            const response = await axiosPrivate.get(`/forums/${forumId}/threads/`);
            console.log("Response:", response.data);
            const { content: fetchedContent } = response.data;
            console.log("Fetched content:", fetchedContent);
            setContent(fetchedContent);
          } catch (error) {
            console.error('Error fetching thread content:', error);
          }
        };
    
        fetchThreadContent();
    }, [forumId, axiosPrivate])
    
    console.log(content);

    return (
        <>
            <Box>
                <Button variant='contained' onClick={handleOpen}>Create Thread</Button>
            </Box>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            Create Thread
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
                            sx={{
                                '& .MuiFormLabel-root': {
                                    fontSize: '0.9rem',
                                },
                                marginRight: '25dvw',
                                marginBottom: '20px',
                                maxHeight: '60vh',
                            }}
                            InputProps={{
                                sx: {
                                    '& input': {
                                        maxHeight: '100%',
                                        borderRadius: '25px',
                                    },
                                    borderRadius: '25px',

                                }
                            }}
                            value={threadName}
                            onChange={(e) => setThreadName(e.target.value)}
                        />
                    </Box>
                    <Box sx={{
                        maxHeight: '60vh',
                        marginBottom: '20px'
                    }}>
                        <TextField
                            id="outlined-basic"
                            label="Content"
                            variant="outlined"
                            fullWidth
                            multiline
                            maxRows={10}
                            sx={{
                                '& .MuiFormLabel-root': {
                                    fontSize: '0.9rem',
                                },
                                marginRight: '25dvw',
                                marginBottom: '20px',
                                maxHeight: '60vh',
                            }}
                            InputProps={{
                                sx: {
                                    '& input': {
                                        maxHeight: '100%',
                                        borderRadius: '25px',
                                    },
                                    borderRadius: '25px',

                                }
                            }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </Box>

                    <div style={{
                        marginBottom: '20px'
                    }}>
                        <input type="file" multiple accept=".jpg, .png" onChange={handleFileChange} />
                    </div>
                    <Button onClick={postThread} variant='contained' sx={{
                        width: '100%'
                    }}>Post</Button>
                </Box>
            </Modal>
        </>
    );
};

export default CreateThreads;
