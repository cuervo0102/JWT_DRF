import React, { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { jwtDecode } from "jwt-decode"
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {



    let [authTokens, setAuthTokens] = useState( () => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')): null);
    let [user, setUser] = useState( () => localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')): null);
    let [loading, setLoading] = useState(true)



    const navigate = useNavigate();

    let loginUser = async (e) => {
        e.preventDefault();
        try {
            let response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': e.target.username.value,
                    'password': e.target.password.value
                })
            });
            let data = await response.json();
            if (response.status === 200) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/');
            } else {
                alert('Something went wrong!');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };


    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login')

    }

    let updateToken = async () => {
        console.log('Update token called');
        try {
            let response = await fetch('http://localhost:8000/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    'refresh': authTokens?.refresh
                })
            });
    
            if (response.status === 200) {
                let data = await response.json();
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                console.log('Token refreshed successfully');
            } else if (response.status === 401) {
                console.log('Refresh token is invalid or expired');
                logoutUser();
            } else {
                console.error('Failed to refresh token. Status:', response.status);
                
            }
        } catch (error) {
            console.error('Error in updateToken:', error);
            
        }
    }



    let contextData = {
        user: user,
        authTokens: authTokens,
        setAuthTokens: setAuthTokens,
        setUser: setUser,
        loginUser: loginUser, 
        logoutUser:logoutUser,
    };

    useEffect(() => {
        let fourMinutes = 1000 * 60 * 4
        let interval = setInterval(() => {
            if (authTokens) {
                updateToken()
            }
        }, 2000) 
        return () => clearInterval(interval)
    }, [authTokens, loading])

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
