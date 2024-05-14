import { Outlet } from "react-router-dom";
import { useState, useEffect } from 'react';
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth"; 
import useLocalStorage from "../hooks/useLocalStorage";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    const [persist] = useLocalStorage('persist', true);

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                localStorage.setItem('jwt', await refresh());
            } catch (err) {
                console.error(err);
            } finally {
                isMounted && setIsLoading(false);
            }
        };

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            {!persist ? (
                <Outlet />
            ) : isLoading ? (
                <p>Loading...</p>
            ) : (
                <Outlet />
            )}
        </>
    );
};

export default PersistLogin;
