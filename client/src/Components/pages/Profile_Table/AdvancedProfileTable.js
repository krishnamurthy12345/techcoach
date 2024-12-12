import React from 'react';
import './AdvancedProfileTable.css';
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoIosRemoveCircleOutline } from "react-icons/io";


const AdvancedProfileTable = () => {

    return (
        <div className='main-table'>
            <h3>Advanced - Profile</h3>
            <div className='advanced-table'>
                <form className='main-form'>
                    <div>
                        <div className='table-input'>
                            <label htmlFor=''>Goals:</label>
                            <input type='text' placeholder='Enter your Active Goals' />
                        </div>
                        <div className='advanced-add'>
                            <IoIosAddCircleOutline className='icons' />
                            <IoIosRemoveCircleOutline className='icons' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor=''>Values:</label>
                        <input type='text' placeholder='Add your Personal or Professional consider values ' />
                        <div className='advanced-add'>
                            <IoIosAddCircleOutline className='icons' />
                            <IoIosRemoveCircleOutline className='icons' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor=''>Resolutions:</label>
                        <input type='text' placeholder='Add your resolutions in your Experience.' />
                        <div className='advanced-add'>
                            <IoIosAddCircleOutline className='icons' />
                            <IoIosRemoveCircleOutline className='icons' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor=''>Constraints:</label>
                        <input type='text' placeholder='Add your Lack of resource due to which you may take a decision' />
                        <div className='advanced-add'>
                            <IoIosAddCircleOutline className='icons' />
                            <IoIosRemoveCircleOutline className='icons' />
                        </div>
                    </div>
                    <div>
                        <label htmlFor=''>Other Factors:</label>
                        <input type='text' placeholder='Add Your General Section to add things' />
                        <div className='advanced-add'>
                            <IoIosAddCircleOutline className='icons' />
                            <IoIosRemoveCircleOutline className='icons' />
                        </div>
                    </div>
                    <button>Save</button>
                </form>
            </div>
        </div>
    )
}

export default AdvancedProfileTable;