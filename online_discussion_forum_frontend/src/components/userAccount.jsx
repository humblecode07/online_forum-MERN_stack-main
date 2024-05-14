import { Avatar, Box, Button, Divider, InputLabel, Modal, Stack, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom/dist/umd/react-router-dom.development';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import DeleteIcon from '@mui/icons-material/Delete';
import { jwtDecode } from 'jwt-decode';
import useAuth from '../hooks/useAuth';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: '#f2f2f2',
    borderRadius: '20px',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const UserAccount = () => {
    const [student, setStudent] = useState(null);
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [image, setImage] = useState(null);
    const [instructor, setInstructor] = useState()

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { studentId } = useParams();
    const { instructorId } = useParams();

    const { auth } = useAuth()
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        setAvatar(file);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setImage(file);
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchStudentData = async () => {
            try {
                let response;

                if (window.location.pathname.includes('/student')) {
                    response = await axiosPrivate.get(`/users/${studentId}`, {
                        signal: controller.signal
                    });

                    if (response.data && response.data.user && response.data.user.length > 0) {
                        const userData = response.data.user[0];
                        setStudent(userData);
                        setBio(userData.bio || '');

                        if (userData.officer) {
                            const instructorResponse = await axiosPrivate.get(`/instructors/${userData.officer}`, {
                                signal: controller.signal
                            });

                            if (instructorResponse.data) {
                                setInstructor(instructorResponse.data);
                            }
                        }
                    } else {
                        throw new Error('Response data is empty or missing user information');
                    }
                }
                else if (window.location.pathname.includes('/instructor/')) {
                    response = await axiosPrivate.get(`/instructors/${instructorId}`, {
                        signal: controller.signal
                    });

                    if (response.data && response.data.instructor && response.data.instructor.length > 0) {
                        const userData = response.data.instructor[0];
                        setStudent(userData);
                        setBio(userData.bio || '');
                    } else {
                        throw new Error('Response data is empty or missing user information');
                    }
                }
            } catch (err) {
                console.error(err);
                navigate('/login', { state: { from: location }, replace: true });
            }
        };

        fetchStudentData();

        return () => {
            controller.abort();
        };
    }, [axiosPrivate, studentId, navigate, location]);

    useEffect(() => {
        const postAvatar = async () => {
            if (avatar) {
                const formData = new FormData();
                formData.append('profile', avatar);

                if (window.location.pathname.includes('/student')) {
                    try {
                        await axiosPrivate.patch(`/users/${studentId}`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        window.location.reload();
                    } catch (error) {
                        console.error('Error uploading avatar:', error);
                        // Handle error if upload fails
                    }
                }
                else if (window.location.pathname.includes('/instructor/')) {
                    try {
                        await axiosPrivate.patch(`/instructors/${instructorId}`, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                        window.location.reload();
                    } catch (error) {
                        console.error('Error uploading avatar:', error);
                        // Handle error if upload fails
                    }
                }
            }
        };

        postAvatar();

    }, [avatar, axiosPrivate, studentId]);

    const [openEmail, setOpenEmail] = React.useState(false);
    const handleOpenEmail = () => setOpenEmail(true);
    const handleCloseEmail = () => setOpenEmail(false);

    const [email, setEmail] = useState('');

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const isValidEmail = (email) => {
        return email.endsWith('@dyci.edu.ph');
    };

    const patchUser = async () => {
        try {
            const response = await axiosPrivate.patch(`/users/${studentId}`, {
                email: email
            });
            console.log(response.data);
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

    const [openPassword, setOpenPassword] = React.useState(false);
    const handleOpenPassword = () => setOpenPassword(true);
    const handleClosePassword = () => setOpenPassword(false);

    const [password, setPassword] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const isValidPassword = (password) => {
        return password.length >= 8;
    };

    const changePassword = async () => {
        try {
            const response = await axiosPrivate.post(`/users/${studentId}`, {
                pass: password
            });
            console.log(response.data);
            handleClosePassword();
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

    const updateBio = async () => {
        try {
            const response = await axiosPrivate.patch(`/users/${studentId}`, {
                bio: bio
            });
            console.log(response.data);
            window.location.reload();
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
        <Box paddingBottom={'100px'}>
            <Box marginBottom={'20px'}>
                <Typography fontWeight={600} fontSize={'22px'}>
                    Account settings
                </Typography>
            </Box>
            <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>ACCOUNT PREFERENCES</InputLabel>
            <Divider style={{ marginBottom: '20px' }} />
            <Box>
                <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                    <Stack>
                        <Typography fontWeight={500}>Email address</Typography>
                        <Typography fontSize={'12px'}>{student?.email}</Typography>
                    </Stack>
                    <Button onClick={handleOpenEmail} variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                    <Modal
                        open={openEmail}
                        onClose={handleCloseEmail}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Change school email address
                            </Typography>
                            <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                                Email must end with @dyci.edu.ph
                            </InputLabel>
                            <TextField
                                id="school_email"
                                label="Email"
                                variant="outlined"
                                required
                                fullWidth
                                value={email}
                                onChange={handleEmailChange}
                                error={!isValidEmail(email)}
                                helperText={!isValidEmail(email) ? "Email must end with @dyci.edu.ph" : ""}
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
                            />
                            <Stack alignItems={'flex-end'}>
                                <Button disabled={!isValidEmail(email) ? true : false} onClick={patchUser} variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                            </Stack>
                        </Box>
                    </Modal>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                    <Stack>
                        <Typography fontWeight={500}>Change password</Typography>
                        <Typography fontSize={'12px'}>Password must be at least 8 characters long
                        </Typography>
                    </Stack>
                    <Button onClick={handleOpenPassword} variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                    <Modal
                        open={openPassword}
                        onClose={handleClosePassword}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                                Change password
                            </Typography>
                            <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
                                Password must be at least 8 characters long
                            </InputLabel>
                            <TextField
                                id="school_email"
                                label="Password"
                                variant="outlined"
                                type='password'
                                required
                                fullWidth
                                value={password}
                                onChange={handlePasswordChange}
                                error={!isValidPassword(password)}
                                helperText={!isValidPassword(password) ? "Password must be at least 8 characters long" : ""}
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
                            />
                            <Stack alignItems={'flex-end'}>
                                <Button disabled={!isValidPassword(password) ? true : false} onClick={changePassword} variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                            </Stack>
                        </Box>
                    </Modal>
                </Stack>
                <Typography fontWeight={600} fontSize={'22px'} marginBottom={'20px'}>
                    Customized Profile
                </Typography>
                <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>PROFILE INFORMATION</InputLabel>
                <Divider style={{ marginBottom: '20px' }} />
                <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                    <Stack>
                        <Typography fontWeight={500}>Username</Typography>
                        <Typography fontSize={'12px'}>{student?.user_name}</Typography>
                    </Stack>
                    <Button variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                </Stack>
                <Stack direction={'column'} justifyContent={'space-between'} marginBottom={'20px'}>
                    <Stack>
                        <Typography fontWeight={500} marginBottom={'3px'}>About</Typography>
                        <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>A brief description of yourself shown on your profile.</InputLabel>
                        <TextField
                            value={bio}
                            onChange={handleBioChange}
                            fontSize={'12px'}
                            multiline
                            maxRows={5}
                            maxLength={200}
                            sx={{
                                marginBottom: '10px'
                            }}
                        />
                    </Stack>
                    <Button onClick={updateBio} variant='outlined' sx={{ borderRadius: '20px', width: '15%' }}>Change</Button>
                </Stack>
                {student?.role.includes('Student') ? (
                    <>
                        <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                            <Stack>
                                <Typography fontWeight={500}>Education Level</Typography>
                                <Typography fontSize={'12px'}>{student?.department}</Typography>
                            </Stack>
                            <Button variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                        </Stack>
                        <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                            <Stack>
                                <Typography fontWeight={500}>Grade Level</Typography>
                                <Typography fontSize={'12px'}>{student?.year_level} {student?.department === 'College Level' ? 'Year' : 'Grade'}</Typography>
                            </Stack>
                            <Button variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                        </Stack>
                        <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                            <Stack>
                                <Typography fontWeight={500}>Instructor</Typography>
                                <Typography fontSize={'12px'}>{instructor?.instructor[0]?.first_name} {instructor?.instructor[0]?.family_name}</Typography>
                            </Stack>
                            <Button variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                        </Stack>
                    </>
                ) : (
                    <>
                        <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                            <Stack>
                                <Typography fontWeight={500}>Subjects</Typography>
                                <Typography fontSize={'12px'}>{student?.subjects}</Typography>
                            </Stack>
                            <Button variant='outlined' sx={{ borderRadius: '20px' }}>Change</Button>
                        </Stack>
                    </>
                )}

                <Stack direction={'row'} justifyContent={'space-between'} marginBottom={'20px'}>
                    <Stack>
                        <Typography fontWeight={500}>Birthday</Typography>
                        <Typography fontSize={'12px'}>{new Date(student?.date_of_birth).toLocaleDateString()}</Typography>
                    </Stack>
                </Stack>
                <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>IMAGES</InputLabel>
                <Divider style={{ marginBottom: '20px' }} />
                <Box marginBottom={'30px'}>
                    <Typography fontWeight={500} marginBottom={'3px'}>Profile and background image</Typography>
                    <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '19px' }}>Images must be .png or .jpg format</InputLabel>
                    <Stack direction={'row'} gap={3}>
                        {/* Avatar with file input */}
                        <label htmlFor="avatar-input">
                            <Avatar
                                sx={{ width: 120, height: 120, bgcolor: 'primary.main', cursor: 'pointer' }}
                            >
                                {student && (
                                    <img src={`http://localhost:3000/images/${student?.profile}`} alt="Firefly" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </Avatar>
                            <input
                                type="file"
                                id="avatar-input"
                                style={{ display: 'none' }}
                                onChange={handleAvatarChange}
                            />
                        </label>

                        {/* Image with file input */}
                        <label htmlFor="image-input">
                            <img
                                style={{ height: '120px', width: 'auto', cursor: 'pointer' }}
                                src='https://fakeimg.pl/200x100/?retina=1&text=こんにちは&font=noto'
                                alt='Image'
                            />
                            <input
                                type="file"
                                id="image-input"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </label>
                    </Stack>
                </Box>
                <Box>
                    <InputLabel style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>DELETE ACCOUNT</InputLabel>
                    <Divider style={{ marginBottom: '20px' }} />
                    <Stack justifyContent={'flex-end'} alignItems={'flex-end'}>
                        <Button style={{ width: 'auto', padding: 0, margin: 0 }} variant='text' startIcon={<DeleteIcon />} color='error'>DELETE ACCOUNT</Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    )
}

export default UserAccount
