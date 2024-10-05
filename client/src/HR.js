import React from 'react';
import { useLocation } from 'react-router-dom';

const HR = () => {
    const location = useLocation();
    const userId = location.state?.userId; // Access the userId from location state

    return <h1>Welcome to the HR Page! Your User ID is: {userId}</h1>;
};

export default HR;