import React, { useState } from 'react';
import './Header.css';
import 'bootstrap/dist/js/bootstrap.esm';
import { Link } from 'react-router-dom';
import tech from './assets/tech.png';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    return (
        <div>
            <nav class="navbar navbar-expand-lg f-5">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#home">TechCoach_lite</a>
                    <img src={tech} alt='' className='image' />
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarScroll">
                        <ul class="navbar-nav ms-auto " >
                            <li class="nav-item">
                                <Link to='/' class="nav-link active" aria-current="page" href="#home">Home</Link>
                            </li>
                            {isLoggedIn && (
                                <li class="nav-item">
                                    <Link to='/dashboard' class="nav-link" href="#dashboard">Dashboard</Link>
                                </li>
                            )}
                            {!isLoggedIn && (
                                <li class="nav-item">
                                    <Link to='/login' class="nav-link" href="#login">Login</Link>
                                </li>
                            )}
                            {isLoggedIn && (
                                <li class="nav-item">
                                    <button onClick={handleLogout} class="btn btn-link nav-link">Logout</button>
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
