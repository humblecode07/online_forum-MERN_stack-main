import useAuth from "./useAuth";
import axios from '../api/axios';

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const jwtToken = localStorage.getItem('jwt');


  const refresh = async () => {
    const response = await axios.get('/refresh', {
      withCredentials: true
    });

    setAuth(prev => {
      return {
        ...prev,
        roles: response.data.roles,
        accessToken: response.data.accessToken
      }
    });

    return response.data.accessToken;
  }

  return refresh;
}

export default useRefreshToken;
