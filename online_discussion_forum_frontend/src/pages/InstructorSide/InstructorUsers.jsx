import { Typography, Box, Tabs, Tab, Stack, Button } from '@mui/material/';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import React, { useState, useEffect } from 'react';
import CreateStudent from '../../modals/CreateStudent';
import StudentList from '../../components/studentList';
import InstructorsList from '../../components/instructorsList';
import useAuth from '../../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';

const InstructorUsers = () => {
  const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const { auth } = useAuth();
    const decoded = auth?.accessToken ? jwtDecode(auth.accessToken) : undefined;

  return (
    <Box sx={{ width: '55dvw', typography: 'body1' }}>
            <Stack direction={'row'} justifyContent={'space-between'} sx={{
                marginBottom: '20px',
            }}>
                <Typography variant="h5" sx={{
                    fontWeight: '700',
                    fontSize: '30px',
                }}>User List</Typography>
                {
                    value === '1' ? 
                    decoded.roles.includes("Instructor") ? <CreateStudent /> : null : 
                    null
                }
            </Stack>

            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange}>
                        <Tab label="Students" value="1" />
                        <Tab label="Instructors" value="2" />
                    </TabList>
                </Box>
                <TabPanel value="1"><StudentList /></TabPanel>
                <TabPanel value="2"><InstructorsList /></TabPanel>
            </TabContext>
        </Box>
  )
}

export default InstructorUsers
