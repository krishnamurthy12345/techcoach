import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import withAuth from '../withAuth';

const GroupSelection = () => {
    const navigate = useNavigate();

    const navigateToInnerCircle = () => {
        navigate('/innerCircle?type_of_group=inner_circle');
    };

    const navigateToGroup = () => {
        navigate('/group?type_of_group=multiple_share_group');
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem" }}>
            <Button style={{ margin: '1rem', color: "black", border: "0.1rem solid #27374D", backgroundColor: "#27374D", color: "White", padding: "0.5rem" }}
                onClick={navigateToInnerCircle}>Inner Circle</Button>
            {/* <Button onClick={navigateToGroup}
                style={{ margin: '1rem', color: "black", border: "0.1rem solid #27374D", backgroundColor: "#27374D", color: "White", padding: "0.5rem" }}>Group</Button> */}
        </div>
    );
};

export default withAuth(GroupSelection);