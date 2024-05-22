import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Group from '../../Components/Group/GroupSelection';  
import AcceptOrNot from '../../Components/Group/AcceptOrNot';  

const ShareModal = ({ showModal, handleClose, innerGroup, innerCircleDetails, decision, id }) => {
    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Decision</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {innerGroup === null && innerCircleDetails === null && decision === null && id === null ? (
                    <Group />
                ) : (
                    <AcceptOrNot innerCircleDetails={innerCircleDetails} decision={decision} id={id}/>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareModal;