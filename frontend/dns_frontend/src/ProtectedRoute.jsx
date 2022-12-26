import React from 'react';
import { Navigate } from 'react-router-dom';



const ProtectedRoute = ({isLoggedIn, element}) => {
    if (isLoggedIn) {
        return element;
    } else {
        return <Navigate replace to="/manage"/>;
    }
};

export default ProtectedRoute;