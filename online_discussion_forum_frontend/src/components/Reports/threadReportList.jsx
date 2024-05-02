import { Box } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const ThreadReportList = () => {
  const [threads, setThreads] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchThreads = async () => {
      try {
        const threadsResponse = await axiosPrivate.get(`/threads/all`, {
          signal: controller.signal
        });

        console.log(threadsResponse.data)

        const threadData = await Promise.all(threadsResponse.data.threads.map(async thread => {
          try {
            const forumResponse = await axiosPrivate.get(`/forums/${thread.forumPost}`, {
              signal: controller.signal
            });

            const forumName = forumResponse.data.forum[0].name;
            
            return {
              id: thread._id,
              username: thread.username,
              title: thread.title,
              content: thread.content,
              upvotes: thread.upvotes,
              downvotes: thread.downvotes,
              viewCount: thread.viewCount,
              commentCount: thread.commentCount,
              edited: thread.edited,
              pinned: thread.pinned,
              timestamp: new Date(thread.timestamp).toLocaleDateString(),
              forumName: forumName,
            };
          } catch (error) {
            console.error("Error fetching forum details:", error);
            return {
              id: thread._id,
              username: thread.username,
              title: thread.title,
              content: thread.content,
              upvotes: thread.upvotes,
              downvotes: thread.downvotes,
              viewCount: thread.viewCount,
              commentCount: thread.commentCount,
              edited: thread.edited,
              pinned: thread.pinned,
              timestamp: new Date(thread.timestamp).toLocaleDateString(),
              forumName: "Unknown",
            };
          }
        }));

        isMounted && setThreads(threadData);
      } catch (error) {
        console.log(error);
        navigate('/admin/login', { state: { from: location }, replace: true });
      }
    };

    fetchThreads();

    return () => {
      isMounted = false;
      controller.abort();
    }
  }, [axiosPrivate, navigate, location]);

  console.log(threads)

  const columns = [
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'forumName', headerName: 'Forum', width: 150 },
    { field: 'title', headerName: 'Thread Title', width: 150 },
    { field: 'content', headerName: 'Content', width: 150 },
    { field: 'upvotes', headerName: 'Upvotes', width: 150 },
    { field: 'downvotes', headerName: 'Downvotes', width: 150 },
    { field: 'commentCount', headerName: 'Comment Count', width: 150 },
    { field: 'viewCount', headerName: 'View Count', width: 150 },
    { field: 'edited', headerName: 'Edited', width: 150 },
    { field: 'timestamp', headerName: 'Date', width: 150 },
  ];

  return (
    <Box sx={{
      width: '60dvw'
    }}>
      <DataGrid rows={threads} columns={columns} slots={{ toolbar: GridToolbar }} />
    </Box>
  )
}

export default ThreadReportList
