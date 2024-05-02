import { Box } from '@mui/material'
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import React from 'react'
import UserAccount from '../../components/userAccount';

const StudentSettings = () => {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <Box width={'55dvw'}>
      <UserAccount />
    </Box>
  )
}

export default StudentSettings
