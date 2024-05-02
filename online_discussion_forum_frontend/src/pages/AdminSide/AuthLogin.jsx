import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import useInput from '../../hooks/useInput';
import useToggle from '../../hooks/useToggle';
import yangaLogo from '../image/yangaLogo.png';
// import useRefreshToken from '../../hooks/useRefreshToken';

const LOGIN_URL = '/login';

const AuthLogin = () => {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [email, resetEmail, resetAttribute] = useInput('user', '');
  const [pwd, setPwd] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [check, toggleCheck] = useToggle('persist', false)

  const showLabel = false

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
      }
      );
      console.log(response.data)

      const accessToken = response.data.token;

      // window.localStorage.setItem("isLoggedIn", true)

      setAuth({ email, accessToken });
      resetEmail()
      setPwd('')
      navigate('/admin/dashboard');
    }
    catch (err) {
      if (!err.response) {
        setErrMsg('No Server Response')
      }
      else if (err.response?.status === 400) {
        setErrMsg('Missing Username or Password');
      }
      else if (err.response?.status === 401) {
        setErrMsg('Unauthorized')
      }
      else {
        setErrMsg('Auth Failed');
      }
      errRef.current.focus();
    }
  }

  // useEffect(() => {
  //   console.log("a")
  // }, [])

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-20 w-auto" src={yangaLogo} alt="Your Logo" />
        <h2 className="mt-10 text-center text-2xl font-roboto leading-9 tracking-tight text-blue-500">Welcome, Admin</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action="#" method="POST">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-balance">Admin Email</label>
            <div className="mt-2">
              <input id="email" name="email" type="email" autoComplete="off" {...resetAttribute} required ref={userRef} className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black-600 shadow-sm ring-1 ring-inset ring-blue-500 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-black">Password</label>
            </div>
            <div className="mt-2">
              <input id="password" name="password" type="password" autoComplete="off" required onChange={(e) => setPwd(e.target.value)} value={pwd} className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-black shadow-sm ring-1 ring-inset ring-blue-500 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6" />
            </div>
          </div>

          {showLabel && (
            <div className="mt-6 flex items-center">
              <input
                type="checkbox"
                id="persist"
                onChange={toggleCheck}
                checked={check}
              />

              <label htmlFor="persist" className="ml-2 block text-sm text-gray-900">
                Trust this device
              </label>

            </div>
          )}
          <div>
            <button type="submit" onClick={handleSubmit} className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black focus:ring-offset-2 focus:ring-offset-red-500">Sign in</button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          <a href="#" className="font-semibold leading-6 text-cyan-500 hover:text-cyan-400">Redirect to Client Website</a>
        </p>
      </div>
    </div>

  )
}

export default AuthLogin
