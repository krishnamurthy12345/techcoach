import React from 'react';
import { Modal, Button } from 'react-bootstrap'; 
import Group from '../Group/GroupSelection';  
import withAuth from '../withAuth';
import AcceptMessage from './AcceptMessage';

const ShareModal = ({ showModal, handleClose, decisionGroup, decisionCircleDetails, decision, id }) => {
    console.log("shareeModal props", { decisionGroup, decisionCircleDetails, decision, id });

    return (
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Share Decision</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {(decisionGroup === false || decisionGroup === null) && (decisionCircleDetails === null || decisionCircleDetails.error === "No groups found for this user") ? (
                    <Group />
                ) : (
                    <AcceptMessage decisionCircleDetails={decisionCircleDetails} decision={decision} id={id}/>
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

export default withAuth(ShareModal);
