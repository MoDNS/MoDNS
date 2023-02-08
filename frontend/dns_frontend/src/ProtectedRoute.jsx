import React from 'react';
import { Navigate } from 'react-router-dom';
import { PropTypes } from 'prop-types';

const ProtectedRoute = ({isLoggedIn, element}) => {
    if (isLoggedIn) {
        return element;
    } else {
        return <Navigate replace to="/manage"/>;
    }
};

export default ProtectedRoute;

ProtectedRoute.propTypes = {
    isLoggedIn: PropTypes.bool.isRequired,      // whether the user is logged in or not
    element: PropTypes.object.isRequired,       // page to display if logged in
};