import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Stack, Tab, Typography } from '@mui/material'
import React from 'react'
import UserReportList from '../../components/Reports/userReportList';
import ForumReportList from '../../components/Reports/forumReportList';
import ThreadReportList from '../../components/Reports/threadReportList';
import InstructorReportList from '../../components/Reports/instructorReportList';

const Reports = () => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
      setValue(newValue);
  };

  return (
    <Box>
      <Stack direction={'row'} justifyContent={'flex-start'} sx={{ marginRight: '50px', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ fontWeight: '700', fontSize: '30px', paddingRight: '60%' }}>Reports</Typography>
      </Stack>

      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange}>
            <Tab label="Students" value="1" />
            <Tab label="Instructors" value="2" />
            <Tab label="Bulletins and Forums" value="3" />
            <Tab label="Threads" value="4" />
          </TabList>
        </Box>
        <TabPanel value="1"><UserReportList /></TabPanel>
        <TabPanel value="2"><InstructorReportList /></TabPanel>
        <TabPanel value="3"><ForumReportList /></TabPanel>
        <TabPanel value="4"><ThreadReportList /></TabPanel>
      </TabContext>
      
    </Box>
  )
}

export default Reports
