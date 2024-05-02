import React, { useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";
import { Stack, Box, IconButton } from "@mui/material";
import { useAsyncFn } from "../hooks/useAsync";
import FileUploadIcon from "@mui/icons-material/FileUpload";

const CommentForm = ({
    autoFocus = false,
    initialValue = "",
    reply,
    edit,
    parentId
}) => {
    const [message, setMessage] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { forumId, threadId } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const [postCommentState, setPostCommentState] = useState({ loading: false, error: null });

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);
    const handleFileChange = (event) => setSelectedFiles([...selectedFiles, ...event.target.files]);

    const isSubmitDisabled = () => {
        return !message.trim() && selectedFiles.length === 0;
    };


    const postComment = async () => {
        try {
            setPostCommentState({ loading: true, error: null });

            const formData = new FormData();
            formData.append("content", message);
            if (selectedFiles.length > 0) {
                const file = selectedFiles[0];
                formData.append("image", file);
            }

            if (edit) {
                await axiosPrivate.patch(
                    `/forums/${forumId}/threads/${threadId}/comments/${parentId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }
            else {
                await axiosPrivate.post(
                    `/forums/${forumId}/threads/${threadId}/comments/${reply === true ? parentId : ''}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            }
            setPostCommentState({ loading: false, error: null });
            window.location.reload()
        } catch (error) {
            console.error("Error posting comment:", error);
            setPostCommentState({ loading: false, error: error.message });
        }
    };

    return (
        <form>
            <Box>
                <Stack direction={"column"}>
                    <div className={`textarea-container ${isFocused ? 'focused' : ''}`}>
                        <textarea
                            value={message}
                            autoFocus={autoFocus}
                            onChange={(e) => setMessage(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className="message-input"
                            placeholder="Type your comment here..."
                        />
                    </div>
                    <div className={`files-input ${isFocused ? 'focused' : ''}`}>
                        <IconButton
                            component="label"
                            variant="contained"
                            tabIndex={-1}
                        >
                            <FileUploadIcon />
                            <input
                                type="file"
                                hidden
                                accept=".png,.jpeg,.jpg"
                                onChange={handleFileChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </IconButton>
                    </div>
                </Stack>
                <button className="btn submit" onClick={postComment} type="submit" disabled={isSubmitDisabled() || postCommentState.loading}>
                    {postCommentState.loading ? "Loading" : "Post"}
                </button>
                <div className="error-msg">{postCommentState.error}</div>
            </Box>
        </form>
    );
};

export default CommentForm;