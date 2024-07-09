import React, { useState } from 'react';
import AuthContext from './AuthContext';
import { jwtDecode } from "jwt-decode"
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {



    let [authTokens, setAuthTokens] = useState(localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')): null);
    let [user, setUser] = useState(localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')): null);

    const navigate = useNavigate();

    let loginUser = async (e) => {
        e.preventDefault();
        console.log('Form Submitted');
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

    let contextData = {
        user: user,
        authTokens: authTokens,
        setAuthTokens: setAuthTokens,
        setUser: setUser,
        loginUser: loginUser
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
