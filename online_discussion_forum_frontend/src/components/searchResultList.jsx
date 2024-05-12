import { Box, CardContent, Stack, Divider, Typography } from '@mui/material'
import { Card, Image } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom/dist/umd/react-router-dom.development';

const SearchResultList = ({ results, isClicked }) => {
  const navigate = useNavigate();

  const handleSearchForum = (forumId) => {
    navigate(`/admin/${forumId}/threads`)
  }

  return results.length > 0 ? (
    <Box
      sx={{
        marginTop: '-40px',
        position: 'relative',
        zIndex: 1,
        border: 'solid #1976d2 2px',
        borderBottomLeftRadius: '25px',
        borderBottomRightRadius: '25px',
        borderTop: 'none',
        padding: '5px',
        backgroundColor: '#E2E3E3',
      }}
    >
      <Box marginTop={'25px'} />
      {results.map((result) => (
        <Box key={result._id} sx={{
          
        }}>
          <Card sx={{ display: 'flex', flexDirection: 'row' }} style={{
            borderColor: '#E2E3E3', 
            backgroundColor: '#E2E3E3',
           
          }}>
            <CardContent onClick={() => {
              handleSearchForum(result._id)
            }}>
              <Stack alignItems={'center'} justifyContent={'flex-start'} flexDirection={'row'} bgcolor={'#E2E3E3'}>
                <Image height={'70px'} width={'70px'} preview={false} src={result.image !== '' ? `http://localhost:3000/images/${result.image}` : 'https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'} style={{
                  objectFit: 'contain'
                }} />
                <Stack marginLeft={'15px'}>
                  <Typography>
                    f/{result.name}
                  </Typography>
                  <Typography>
                    {result.description}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <Divider sx={{
                backgroundColor: 'black',
                width: '90%',
                margin: '0 auto'
              }} />
        </Box>
      ))}
    </Box>
  ) : null;
}

export default SearchResultList
