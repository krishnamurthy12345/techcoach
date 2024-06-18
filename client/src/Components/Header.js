import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import tech from './assets/tech.png';
import { getInnerCircleAcceptNotification } from '../Components/Group/Network_Call';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [response, setResponse] = useState(null);
    const [notAcceptedMembersCount, setNotAcceptedMembersCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getInnerCircleAcceptNotification();
            console.log("response from notification", response);
            setResponse(response);
            if (response && response.notAcceptedMembers && response.groupDetails) {
                const count = response.notAcceptedMembers.filter(member => 
                    response.groupDetails[member.group_id] && response.groupDetails[member.group_id].userDetails !== null
                ).length;
                setNotAcceptedMembersCount(count);
            }
        };

        if (isLoggedIn) {
            fetchData();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        try {
            let token;
            if (token) {
                localStorage.getItem('token', token);
                setIsLoggedIn(true); 
            }
        } catch (error) {
            console.error('Error setting auth token:', error);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg f-5">
                <div className="container-fluid">
                    <a href="/dashboard" className="image-link">
                        <img src={tech} alt='' className='image' />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav ms-auto">
                            {isLoggedIn ? (
                                <>
                                    <li className="nav-item">
                                        <Link to='/dashboard' className="nav-link">Dashboard</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='/readd' className="nav-link">Decision</Link>
                                    </li>
                                    <li className="nav-item">
                                        <a href="http://decisioncoach.techcoach4u.com" target="_blank" rel="noopener noreferrer" className="nav-link">Guide</a>
                                    </li>

                                    <li className="nav-item">
                                        <Link to='/innerCircleDisplay' className="nav-link">Inner Circle</Link>
                                    </li>

                                    <li className="nav-item" style={{marginRight:"0.5rem"}}>
                                        <Link to='/notification' className="nav-link position-relative">
                                            Notifications
                                            {notAcceptedMembersCount > 0 && (
                                                <span className="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:"0.6rem"}}>
                                                    {notAcceptedMembersCount}
                                                    <span className="visually-hidden">New alerts</span>
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                    
                                    <li className="nav-item">
                                        <Link to='/profile' className="nav-link">Profile</Link>
                                    </li>
                                    
                                    <li className="nav-item">
                                        <Link to='/' onClick={handleLogout} className="nav-link">Logout</Link>
                                    </li>
                                </>
                            ) : (
                                <li className="nav-item">
                                    <Link to='/' className="nav-link">Home</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Header;
