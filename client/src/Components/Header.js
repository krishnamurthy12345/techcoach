import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import tech from './assets/tech.png';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('2', token);
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            console.log('1', token);

            if (token) {
                localStorage.setItem('token', token);
                setIsLoggedIn(true); // Set isLoggedIn to true after saving token
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
                    <a href="/dashboard" class="image-link">
                        <img src={tech} alt='' class='image' />
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
                                    {/* <li className="nav-item">
                                        <Link to='/profile' className="nav-link">Profile</Link>
                                    </li> */}
                                    <li className="nav-item">
                                        <Link to='/readd' className="nav-link">Decision</Link>
                                    </li>
                                    <li className="nav-item">
                                        <a href=" https://techcoach4u.wordpress.com/make-decisions-with-confidence/" target="_blank" rel="noopener noreferrer" className="nav-link">Resources</a>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={handleLogout} className="btn btn-link nav-link">Logout</button>
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
