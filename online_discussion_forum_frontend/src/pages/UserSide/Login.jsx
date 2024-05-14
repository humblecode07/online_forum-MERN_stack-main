import React from 'react'
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from '../../api/axios';
import { Typography, Box, Button, TextField } from '@mui/material/';
import useAuth from '../../hooks/useAuth';
import Image from 'mui-image';
import Carousel from 'react-material-ui-carousel';
import yangalogo from '../image/yangaLogo.png'
import photoOne from '../image/1.jpg'
import photoTwo from '../image/2.jpg'
import photoThree from '../image/3.jpg'
import photoFour from '../image/4.jpg'
import { jwtDecode } from 'jwt-decode';


const LOGIN_URL = '/login';

const Login = () => {
  const { setAuth } = useAuth();

  const userRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [email, pwd])

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(LOGIN_URL,
        JSON.stringify({ email: email, password: pwd }), {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      const accessToken = response.data.token;
      const decodedToken = jwtDecode(accessToken);
      const { roles } = decodedToken;

      // token saved into localstorage
      localStorage.setItem("jwt", response.data.refreshToken)

      const jwtToken = localStorage.getItem('jwt');

      document.cookie = `jwt=${jwtToken}; path=/; SameSite=None; Secure`;

      setAuth({ email, accessToken });
      if (roles.includes("Admin")) {
        navigate('/admin/dashboard')
      }
      else if (roles.includes("Instructor")) {
        navigate('/instructor/bulletin$board');
      } else if (roles.includes("Student")) {
        navigate('/client');
      } else {
        setErrMsg('Unknown role.');
      }
    } catch (err) {
      console.error(err);
      setErrMsg('Error occurred while logging in.');
    }
  }

  return (
    <Box position={'relative'} display={'flex'} flexDirection={'row'} width={'100dvw'} height={'100dvh'}  overflow={'hidden'}>
      <Box display={'flex'} flexDirection={'column'} width={'45dvw'} height={'100dvh'} justifyContent={'center'} alignItems={'center'} position={'absolute'} zIndex={2} bgcolor={'#f2f2f2'}>
       <Image width={'100px'} height={'100px'} src={yangalogo} style={{
        marginBottom: '50px'
       }}/>
      <Typography fontWeight={100} fontSize={'20px'} marginBottom={'20px'}>More than a School, a Family.</Typography>
        <TextField
          id="email"
          label="Email"
          variant="outlined"
          sx={{
            maxHeight: '60vh',
            width: '25dvw',
            margin: 0,
            marginBottom: '20px',
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          ref={userRef}
        />
        <TextField
          id="password"
          label="Password"
          variant="outlined"
          type="password"
          sx={{
            maxHeight: '60vh',
            width: '25dvw',
            margin: 0,
            marginBottom: '30px',
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
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />

        <Button variant='outlined' onClick={handleSubmit} sx={{
          width: '10dvw',
          borderRadius: '20px'
        }}>
          Log in
        </Button>
      </Box>
      <Box
        position={'absolute'}
        width={'100dvw'}
        zIndex={1}
      >
        <Carousel navButtonsAlwaysInvisible={true} cycleNavigation={true} autoPlay={true} animation="slide" sx={{
          width: '100%',
        }}>
          <Box
            component="img"
            sx={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              height: '100dvh',
              width: '100dvw'
            }}
            alt="The house from the offer."
            src={photoOne}
          />
          <Box
            component="img"
            sx={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              height: '100dvh',
              width: '100dvw'
            }}
            alt="The house from the offer."
            src={photoTwo}
          />
          <Box
            component="img"
            sx={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              height: '100dvh',
              width: '100dvw'
            }}
            alt="The house from the offer."
            src={photoThree}
          />
          <Box
            component="img"
            sx={{
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              height: '100dvh',
              width: '100dvw'
            }}
            alt="The house from the offer."
            src={photoFour}
          />
        </Carousel>
      </Box>
    </Box>
  )
}

export default Login
