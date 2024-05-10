import { Route, NavLink, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';

import RootLayout from './layouts/RootLayout';

import Layout from './pages/Layout';
import RequireAuth from './pages/RequireAuth';
import PersistLogin from './pages/PersistLogin';

import Home from './pages/UserSide/Home';
import Login from './pages/UserSide/Login';
import StudentPage from './pages/UserSide/StudentPage';
import StudentSettings from './pages/AdminSide/StudentSettings';
import StudentThreads from './pages/UserSide/StudentThreads';
import StudentComments from './pages/UserSide/StudentComments';

import InstructorPage from './pages/InstructorSide/InstructorPage'
import InstructorBulletin from './pages/InstructorSide/InstructorBulletin';
import InstructorForums from './pages/InstructorSide/Forums';
import InstructorThreads from './pages/InstructorSide/InstructorThreads';
import InstructorComments from './pages/InstructorSide/InstructorComments';
import InstructorReports from './pages/InstructorSide/InstructorReports';
import InstructorUsers from './pages/InstructorSide/InstructorUsers';

import AdminPage from './pages/AdminSide/AdminPage';
import Dashboard from './pages/AdminSide/Dashboard';
import BulletinBoard from './pages/AdminSide/BulletinBoard'
import AdminForums from './pages/AdminSide/Forums';
import AdminThreads from './pages/AdminSide/Threads';
import AdminComments from './pages/AdminSide/Comments';
import AdminUsers from './pages/AdminSide/Users'
import AdminReports from './pages/AdminSide/Reports';
import Students from './pages/AdminSide/Students';
import Instructors from './pages/AdminSide/Instructors';

import Missing from './pages/Missing';
import Unauthorized from './pages/Unauthorized';
import { PostProvider } from './context/PostContext';


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />

      <Route element={<PersistLogin />}>
        <Route element={<RequireAuth allowedRoles={["Admin"]} />}>
          <Route path='/admin/' element={<AdminPage />}>
            <Route path='/admin/dashboard' element={<Dashboard />} />
            <Route path='/admin/bulletin$board' element={<BulletinBoard />} />
            <Route path='/admin/forums' element={<AdminForums />} />
            <Route path='/admin/:forumId/threads/' element={<AdminThreads />} />
            <Route path='/admin/:forumId/:threadId/' element={<PostProvider>
              <AdminComments />
            </PostProvider>} />
            <Route path='/admin/users' element={<AdminUsers />} />
            <Route path='/admin/student/:studentId' element={<Students />} />
            <Route path='/admin/student/:studentId/settings' element={<StudentSettings />} />
            <Route path='/admin/instructor/:instructorId' element={<Instructors />} />
            <Route path='/admin/instructor/:instructorId/settings' element={<StudentSettings />} />
            <Route path='/admin/reports' element={<AdminReports />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["Instructor"]} />}>
          <Route path='/instructor/' element={<InstructorPage />} >
            <Route path='/instructor/bulletin$board' element={<InstructorBulletin />} />
            <Route path='/instructor/forums' element={<InstructorForums />} />
            <Route path='/instructor/:forumId' element={<InstructorThreads />} />
            <Route path='/instructor/:forumId/:threadId' element={<PostProvider>
              < InstructorComments />
            </PostProvider>} />
            <Route path='/instructor/users' element={<InstructorUsers />} />
            <Route path='/instructor/profile/:instructorId' element={<Instructors />} />
            <Route path='/instructor/profile/:instructorId/settings' element={<StudentSettings />} />
            <Route path='/instructor/student/:studentId' element={<Students />} />
            <Route path='/instructor/student/:studentId/settings' element={<StudentSettings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["Student"]} />}>
          <Route path='/client/' element={<StudentPage />}>
            <Route path='/client/bulletin$board' element={<InstructorBulletin />} />
            <Route path='/client/forums' element={<InstructorForums />} />
            <Route path='/client/:forumId' element={<StudentThreads />} />
            <Route path='/client/student/:forumId/:threadId/' element={<PostProvider>
              <StudentComments />
            </PostProvider>} />
            <Route path='/client/users' element={<InstructorUsers />} />
            <Route path='/client/student/:studentId' element={<Students />} />
            <Route path='/client/student/:studentId/settings' element={<StudentSettings />} />
            <Route path='/client/instructor/:instructorId/' element={<Instructors />} />
          </Route>
        </Route>
      </Route>

      {/* Missing  and Unauthorized*/}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Missing />} />
    </Route>
  )
)


const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App
