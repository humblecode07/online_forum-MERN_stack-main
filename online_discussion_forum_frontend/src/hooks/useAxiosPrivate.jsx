import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";
import axiosPrivate from "../api/axios"; // Import axios instance directly

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (auth?.accessToken) {
                    config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async error => {
                console.log("Error object:", error);
                console.log("Error response:", error?.response);
        
                const prevRequest = error?.config;
        
                console.log("Previous request:", prevRequest);
                if (error?.response && error.response.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    try {
                        const newAccessToken = await refresh();
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        console.error("Error refreshing access token:", refreshError);
                        // Handle token refresh error
                        // For example, redirect to login page or show an error message
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    
    }, [auth, refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;
