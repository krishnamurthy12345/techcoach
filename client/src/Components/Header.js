import React, { useState } from 'react';
import './Header.css';
import 'bootstrap/dist/js/bootstrap.esm';
import { Link } from 'react-router-dom';
import tech from './assets/tech.png';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);


    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg f-5">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#home">TechCoach_lite</a>
                    <img src={tech} alt='' className='image' />
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarScroll">
                        <ul className="navbar-nav ms-auto " >
                            <li className="nav-item">
                                <Link to='/' className="nav-link active" aria-current="page" href="#home">Home</Link>
                            </li>
                            {isLoggedIn && (
                                <li className="nav-item">
                                    <Link to='/dashboard' className="nav-link" href="#dashboard">Dashboard</Link>
                                </li>
                            )}
                            {!isLoggedIn && (
                                <li className="nav-item">
                                    <Link to='/login' className="nav-link" href="#login">Login</Link>
                                </li>
                            )}
                            {isLoggedIn && (
                                <li className="nav-item">
                                    <button onClick={handleLogout} className="btn btn-link nav-link">Logout</button>
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
