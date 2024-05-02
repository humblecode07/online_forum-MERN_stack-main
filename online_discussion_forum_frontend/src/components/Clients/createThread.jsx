import React, { useState } from 'react';
import { Box, IconButton, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import FileUploadIcon from "@mui/icons-material/FileUpload";

const CreateThread = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { forumId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [postThreadState, setPostThreadState] = useState({ loading: false, error: null });

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const handleFileChange = (event) => setSelectedFiles([...selectedFiles, ...event.target.files]);

  const isSubmitDisabled = () => {
    return !message.trim() && selectedFiles.length === 0;
  };

  return (
    <form>
      <Box>
        <Stack direction={"column"}>
          <div className={`textarea-container ${isFocused ? 'focused' : ''}`}>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="title-input"
              placeholder="Title"
            />
          </div>
          <div className={`textarea-container ${isFocused ? 'focused' : ''}`}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="thread-input"
              placeholder="Enter a message..."
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
        <button className="btn submit"  type="submit" disabled={isSubmitDisabled() || postThreadState.loading}>
          {postThreadState.loading ? "Loading" : "Post"}
        </button>
        <div className="error-msg">{postThreadState.error}</div>
      </Box>
    </form>
  );
};

export default CreateThread;
