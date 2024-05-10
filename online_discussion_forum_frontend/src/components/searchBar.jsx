import { Box, InputAdornment, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useParams } from 'react-router-dom/dist/umd/react-router-dom.development';


const SearchBar = ({ searchDisabled, searchType, setResults, setClicked }) => {
  const [input, setInput] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const { forumId } = useParams();


  const fetchData = async (value) => {
    if (searchType === 'F') {
      console.log('forum');
      const forumResponse = await axiosPrivate.get('/forums');

      const forumData = forumResponse.data.forums;

      const filteredForums = forumData.filter(forum => {
        return value && forum.name.toLowerCase().includes(value.toLowerCase());
      });

      setResults(filteredForums)
    }

    else if (searchType === 'T') {
      console.log('thread')
      const threadResponse = axiosPrivate.get(`/forums/${forumId}/threads`);
    }
    else if (searchType === 'U') {
      const studentResponse = axiosPrivate.get(`/users/`);
      const instructorResponse = axiosPrivate.get(`/instructors/`);
    }
  }

  const handleChange = async (value) => {
    setInput(value)
    fetchData(value)
  }

  const handleBlur = () => {
    setClicked(true);
  }

  const handleFocus = () => {
    setClicked(false);
  }


  return (
    <Box width={'520px'} sx={{
      position: 'relative',
      zIndex: 2
    }}>
      <TextField id="search-bar" label="Search" variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ), sx: { borderRadius: '25px', height: '50px', backgroundColor: '#E2E3E3' }
        }}
        sx={{
          '& .MuiFormLabel-root': {
            fontSize: '0.9rem',
          },
          width: '100%',
          marginRight: '25dvw'
        }}
        disabled={searchDisabled}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus} 
      />
    </Box>
  )
}

export default SearchBar
