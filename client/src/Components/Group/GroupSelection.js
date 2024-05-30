import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

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
            <Button onClick={navigateToInnerCircle}>Inner Circle</Button>
            {/* <Button onClick={navigateToGroup}>Group</Button> */}
        </div>
    );
};

export default GroupSelection;