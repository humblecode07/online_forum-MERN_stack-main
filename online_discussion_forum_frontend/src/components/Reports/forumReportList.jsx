import { Box } from '@mui/material'
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const ForumReportList = () => {
  const [forums, setForums] = useState([]);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getForums = async () => {
      try {
        const response = await axiosPrivate.get('/forums', {
          signal: controller.signal
        });
        console.log(response)

        const forumData = response.data.forums.map(forum => ({
          id: forum._id,
          forumName: forum.name,
          creator: forum.creator,
          creationTime: new Date(forum.creationTime).toLocaleDateString(),
          threads: forum.threads ? forum.threads.length : 0,
          type: forum.type,
        }));

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

  const columns = [
		{ field: 'forumName', headerName: 'Forum Name', width: 150 },
		{ field: 'creator', headerName: 'Creator', width: 150 },
		{ field: 'creationTime', headerName: 'Creation Time', width: 150 },
		{ field: 'threads', headerName: 'Number of Threads', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
	];

  console.log(forums)

  return (
    <Box sx={{
      width: '60dvw'
    }}>
      <DataGrid rows={forums} columns={columns} slots={{ toolbar: GridToolbar }} />
    </Box>
  )
}

export default ForumReportList
