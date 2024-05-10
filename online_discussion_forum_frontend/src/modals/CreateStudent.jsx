import { Box, Select, MenuItem, InputLabel, Button, Modal, TextField, Typography, Stack } from "@mui/material";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import React, { useEffect, useState } from "react";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 650,
  maxHeight: 700,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  overflowX: 'hidden'
};


const CreateStudent = () => {
  const [instructors, setInstructors] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [birthday, setBirthday] = useState(null);

  const handleDateChange = (date) => {
    setBirthday(date);
  };

  const [schoolId, setSchoolId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [instructor, setInstructor] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const role = 'Student';

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleEducationLevelChange = (event) => {
    setEducationLevel(event.target.value);
  };

  const handleYearLevelChange = (event) => {
    setYearLevel(event.target.value);
  };

  const handleInstructorChange = (event) => {
    setInstructor(event.target.value);
  };

  useEffect(() => {
    const controller = new AbortController();
  
    const fetchStudentData = async () => {
      try {
        const response = await axiosPrivate.get(`/instructors/`, {
          signal: controller.signal
        });

        console.log(response.data)
  
        if (Array.isArray(response.data.instructors)) {
          setInstructors(response.data.instructors);
        } else {
          console.error("Response data is not an array:", response.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchStudentData();
  
    return () => {
      controller.abort();
    };
  }, [axiosPrivate]);
  

  const addStudent = async () => {
    const formData = new FormData();

    formData.append('school_id', schoolId);
    formData.append('first_name', firstName);
    formData.append('family_name', lastName);
    formData.append('email', email);
    formData.append('user_name', userName);
    formData.append('pass', password);
    formData.append('date_of_birth', birthday ? dayjs(birthday.$d).format('YYYY-MM-DD') : '');
    formData.append('sex', gender);
    formData.append('department', educationLevel);
    formData.append('year_level', yearLevel);
    formData.append('officer', instructor);
    formData.append('role', role);
    selectedFiles.forEach((file) => {
      formData.append('profile', file);
    });

    try {
      const response = await axiosPrivate.post('/users', formData, {
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

  }

  function getOrdinalSuffix(num) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;

    return suffixes[lastDigit] || suffixes[lastTwoDigits] || suffixes[0];
  }


  return (
    <>
      <Box>
        <Button variant='contained' onClick={handleOpen}>Add Student</Button>
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
              Add Student
            </Typography>
          </Box>
          <Box sx={{
            maxHeight: '60vh',
          }}>
            <Stack marginBottom={'20px'} direction={'row'} justifyContent={'flex-start'} sx={{
              '& .MuiTextField-root': { m: 1, width: '30ch' },
            }}>
              <TextField
                id="school_id"
                label="School ID"
                variant="outlined"
                required
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
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
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              />
            </Stack>
            <Stack marginBottom={'20px'} direction={'row'} justifyContent={'space-evenly'} sx={{
              '& .MuiTextField-root': { m: 1, width: '30ch' },
            }}>
              <TextField
                id="first_name"
                label="First Name"
                variant="outlined"
                required
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                id="family_name"
                label="Last Name"
                variant="outlined"
                required
                sx={{
                  '& .MuiFormLabel-root': {
                    fontSize: '0.9rem',
                  },
                  marginRight: '25dvw',
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
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Stack>
            <TextField
              id="email"
              label="student@dyci.edu.ph"
              variant="outlined"
              required
              fullWidth={true}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Stack marginBottom={'20px'} direction={'row'} justifyContent={'space-evenly'} sx={{
              '& .MuiTextField-root': { m: 1, width: '30ch' },
            }}>
              <TextField
                id="user_name"
                label="@username"
                variant="outlined"
                required
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
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <TextField
                id="password"
                label="Password"
                type="password"
                variant="outlined"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Stack>
            <Box sx={{ marginBottom: '20px' }}>
              <InputLabel>Birthday</InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker value={birthday} onChange={handleDateChange} />
                </DemoContainer>
              </LocalizationProvider>
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <InputLabel sx={{ marginBottom: '10px' }}>Profile Image</InputLabel>
              <input type="file" accept=".jpg, .png" onChange={handleFileChange} />
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <InputLabel id="gender-option-label">Gender</InputLabel>
              <Select
                labelId="gender-option-label"
                value={gender}
                onChange={handleGenderChange}
                variant="outlined"
                fullWidth={true}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <InputLabel id="education-level-option-label">Education Level</InputLabel>
              <Select
                labelId="education-level-option-label"
                value={educationLevel}
                onChange={handleEducationLevelChange}
                variant="outlined"
                fullWidth={true}
                required
              >
                <MenuItem value="Elementary Level">Elementary Level</MenuItem>
                <MenuItem value="Junior High Level">Junior High Level</MenuItem>
                <MenuItem value="Senior High Level">Senior High Level</MenuItem>
                <MenuItem value="College Level">College Level</MenuItem>
              </Select>
            </Box>
            <Box sx={{ marginBottom: '20px' }}>
              <InputLabel id="year-level-option-label">Year Level</InputLabel>
              <Select
                labelId="year-level-option-label"
                value={yearLevel}
                onChange={handleYearLevelChange}
                variant="outlined"
                fullWidth={true}
                required
              >
                {[...Array(12)].map((_, index) => (
                  <MenuItem key={index + 1} value={`${index + 1}${getOrdinalSuffix(index + 1)}`}>
                    {index + 1}{getOrdinalSuffix(index + 1)}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ paddingBottom: '20px' }}>
              <InputLabel id="instructor-option-label">Instructor</InputLabel>
              <Select
                labelId="instructor-option-label"
                value={instructor}
                onChange={handleInstructorChange} // Ensure onChange handler is provided
                variant="outlined"
                fullWidth={true}
                required
              >
                {instructors.map((instructor) => (
                  <MenuItem key={instructor._id} value={instructor._id}>
                    {instructor.first_name} {instructor.family_name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Button onClick={addStudent} fullWidth variant="contained" sx={{ marginTop: '40px', marginBottom: '60px' }}>Submit</Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default CreateStudent
