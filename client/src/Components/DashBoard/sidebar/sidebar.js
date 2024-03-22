import React, { children, useState } from 'react';
import './sidebar.css';
import {
    FaBars,
    FaCommentAlt,
    FaRegChartBar,
    FaShoppingBag,
    FaTh, FaUserAlt,
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ children }) => {
    const [isopen, setisopen] = useState(false);
    const toggle = () => setisopen(!isopen);
    const menuItem = [
        {
            path: "/",
            name: "DashBoard",
            icon: <FaTh />,
        },
        {
            path: "/about",
            name: "About",
            icon: <FaUserAlt />,
        },
        {
            path: "/analystics",
            name: "Analystics",
            icon: <FaRegChartBar />
        },
        {
            path: "/comment",
            name: "Comment",
            icon: <FaCommentAlt />
        },
        {
            path: "/product",
            name: "Product",
            icon: <FaShoppingBag />
        }
    ]
    return (
        <div className='container-fluid'>
            <div style={{ width: isopen ? '300px' : '50px' }} className='sidebar'>
                <div className='top_section'>
                    <h1 style={{ display: isopen ? 'block' : 'none' }} className='logo'>Logo</h1>
                    <div style={{ marginLeft: isopen ? '50px' : '0px' }} className='bars'>
                        <FaBars onClick={toggle} />
                    </div>
                </div>
                {
                    menuItem.map((item, index) => (
                        <NavLink to={item.path} key={index} className='link' activeclassName='active'>
                            <div className='icon'>{item.icon}</div>
                            <div style={{ display: isopen ? 'block' : 'none' }} className='link_text'>{item.name}</div>
                        </NavLink>
                    ))
                }
            </div>
            <main>{children}</main>
        </div>
    )
};

export default Sidebar;