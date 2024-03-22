import React from 'react';
import './Nav.css';
import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle, BsJustify } from 'react-icons/bs';
import {Link} from 'react-router-dom';

function Nav() {
 
  return (
    <header className='header '>
      <div className='menu-icon'>
        <BsJustify className='icon' />
      </div>
      <div className='header-right '>
        <ul className="list-unstyled">
          <Link to='/notification'>
          <li>
            <div>
              <BsFillBellFill className='icon' />
              <p>Notification</p>
            </div>
          </li>
          </Link>
          <Link to='/decision'>
          <li>
            <div>
              <BsFillEnvelopeFill className='icon' />
              <p>Decision</p>
            </div>
          </li>
          </Link>
          <Link><li>
            <div>
              <BsPersonCircle className='icon' />
              <p>Profile</p>
              <ul>
                <li>
                  Basic Profile
                </li>
                <li>
                  Personal Info
                </li>
              </ul>
            </div>
          </li>
          </Link>
        </ul>
      </div>
    </header>
  )
}

export default Nav;
