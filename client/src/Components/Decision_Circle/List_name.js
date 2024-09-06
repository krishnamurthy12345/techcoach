import React from 'react'

const List_name = () => {
  
  return (
    <div className='row mt-4'>
      <div className='col-lg-6 col-md-12 mb-3 text-center'>
        <h4>Search the Enter Valid Members email </h4>
        <input type='text' />
      </div>
      <div className='col-lg-6 col-md-12 mb-3 text-center'>
        <h4>
          Selected Names
        </h4>
        <input type='text' placeholder='No names Selected' />
      </div>
    </div>
  )
}

export default List_name