import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import React, { useState } from "react";

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

const CreateBoard = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const axiosPrivate = useAxiosPrivate();
    const [forumName, setForumName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const type = 'Bulletin'

    const handleFileChange = (event) => {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    };

    const postForum = async () => {
        const formData = new FormData();

        formData.append('name', forumName);
        formData.append('description', description);
        formData.append('type', type)

        selectedFiles.forEach((file) => {
            formData.append('image', file);
        });

        try {
            const response = await axiosPrivate.post('/forums', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);
            handleClose();
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
            <Box>
                <Button variant='contained' onClick={handleOpen}>Create Bulletin</Button>
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
                            Create a Bulletin
                        </Typography>
                    </Box>
                    <Box sx={{
                        maxHeight: '60vh',
                    }}>
                        <TextField
                            id="outlined-basic"
                            label="Bulletin Name"
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
                            value={forumName}
                            onChange={(e) => setForumName(e.target.value)}
                        />
                        <TextField
                            id="outlined-basic"
                            label="Description"
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
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Box>
                    <div style={{
                        marginBottom: '20px'
                    }}>
                        <input type="file" multiple onChange={handleFileChange}/>
                    </div>
                    <Button onClick={postForum} variant='contained' sx={{
                        width: '100%'
                    }}>Create Forum</Button>
                </Box>
            </Modal>
        </>
    )
}

export default CreateBoard
