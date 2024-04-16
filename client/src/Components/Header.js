// import React, { useState, useEffect } from 'react';
// import './Header.css';
// import { Link, useNavigate } from 'react-router-dom';
// import tech from './assets/tech.png';

// const Header = () => {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         const id = localStorage.getItem('user_id')
//         if (token && id) {
//             setIsLoggedIn(true);
//         } else {
//             setIsLoggedIn(false);
//         }
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user_id')
//         setIsLoggedIn(false);
//         navigate("/login");
//     };

//     return (
//         <div>
//             <nav className="navbar navbar-expand-lg f-5">
//                 <div className="container-fluid">
//                     <a className="navbar-brand" href="#home">TechCoach_lite</a>
//                     <img src={tech} alt='' className='image' />
//                     <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarScroll" aria-controls="navbarScroll" aria-expanded="false" aria-label="Toggle navigation">
//                         <span className="navbar-toggler-icon"></span>
//                     </button>
//                     <div className="collapse navbar-collapse" id="navbarScroll">
//                         <ul className="navbar-nav ms-auto">
//                             <li className="nav-item">
//                                 <Link to='/' className="nav-link active" aria-current="page">Home</Link>
//                             </li>
//                             {isLoggedIn && (
//                                 <li className="nav-item">
//                                     <Link to='/dashboard' className="nav-link">Dashboard</Link>
//                                 </li>
//                             )}
//                             <li className="nav-item">
//                                 {isLoggedIn ? (
//                                     <button onClick={handleLogout} className="btn btn-link nav-link">Logout</button>
//                                 ) : (
//                                     <Link to='/login' className="nav-link">Login</Link>
//                                 )}
//                             </li>
//                         </ul>
//                     </div>
//                 </div>
//             </nav>
//         </div>
//     );
// }

// export default Header;

import React, { useState, useEffect } from 'react';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import tech from './assets/tech.png';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
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
                    <img src={tech} alt='' href="#home" className='image' />
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
                                        <Link to='/profile' className="nav-link">Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link to='/readd' className="nav-link">Decision</Link>
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
