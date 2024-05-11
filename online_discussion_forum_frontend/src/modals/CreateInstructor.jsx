import { Box, Button, Checkbox, FormControlLabel, FormGroup, InputLabel, MenuItem, Modal, Select, Stack, TextField, Typography } from "@mui/material";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from 'dayjs';

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

const CreateInstructor = () => {
  const [open, setOpen] = React.useState(false);
  const axiosPrivate = useAxiosPrivate();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [birthday, setBirthday] = useState(null);

  const handleDateChange = (date) => {
    setBirthday(date);
  };

  const [schoolId, setSchoolId] = useState();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const role = 'Instructor';

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      setSubjects([...subjects, value]);
    }
    else {
      setSubjects(subjects.filter(subject => subject !== value));
    }
  };

  const addInstructor = async () => {
    const formData = new FormData();

    formData.append('school_id', schoolId);
    formData.append('first_name', firstName);
    formData.append('family_name', lastName);
    formData.append('email', email);
    formData.append('user_name', userName);
    formData.append('pass', password);
    formData.append('date_of_birth', birthday ? dayjs(birthday.$d).format('YYYY-MM-DD') : '');
    formData.append('sex', gender);
    subjects.forEach(subject => {
      formData.append('subjects', subject);
    });

    formData.append('role', role);
    selectedFiles.forEach((file) => {
      formData.append('profile', file);
    });

    try {
      const response = await axiosPrivate.post('/instructors', formData, {
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

  return (
    <>
      <Box>
        <Button variant='contained' onClick={handleOpen}>Add Instructor</Button>
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
              Add Instructor
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
            <Box>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="Principles of Programming Languages" />}
                  label="Principles of Programming Languages"
                />
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="Physics" />}
                  label="Physics"
                />
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="Advance Database Management Systems" />}
                  label="Advance Database Management Systems"
                />
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="Sports" />}
                  label="Sports"
                />
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="System Analysis and Design" />}
                  label="System Analysis and Design"
                />
                <FormControlLabel
                  control={<Checkbox onChange={handleCheckboxChange} value="Design and Analysis of Algorithm" />}
                  label="Design and Analysis of Algorithm"
                />
              </FormGroup>
            </Box>
            <Button onClick={addInstructor} fullWidth variant="contained" sx={{ marginTop: '40px', marginBottom: '60px' }}>Submit</Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}

export default CreateInstructor
