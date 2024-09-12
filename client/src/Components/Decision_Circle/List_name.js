import React, { useEffect, useState } from 'react';
import { getAddMemberNameListFetch, getDecisionCircleDetails,addMemberInDecisionCircle,sendDecisionCircleInvitation,decisionCircleAddInvitation,removeMemberFromDecision } from './Networkk_Call';
import { Container, ListGroup, Button, Spinner, Card, Alert } from 'react-bootstrap';
import { ToastContainer,toast } from 'react-toastify';
import ShareModal from './ShareModal';

const List_name = () => {
  const [decisionCircleDetails, setDecisionCircleDetails] = useState(null);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loadingRemove, setLoadingRemove] = useState({});



useEffect(() => {
    const fetchDecisionCircleDetails = async () => {
        try {
            const details = await getDecisionCircleDetails();
            console.log("detailssss", details);
            setDecisionCircleDetails(details);
        } catch (error) {
            console.error('Failed to fetch Decision Circle Details', error);
            toast.error("Error fetching decision circle details.");
        } finally {
            setLoading(false);
        }
    };
    fetchDecisionCircleDetails();
 }, []);

 

useEffect(() => {
    const fetchPotentialMembers = async () => {
        if (!decisionCircleDetails || !decisionCircleDetails.group || !decisionCircleDetails.members) {
            return;
        }
 
        try {
            const existingMemberIds = decisionCircleDetails.members.map(member => member.user_id);
            const memberList = await getAddMemberNameListFetch(existingMemberIds);
            setPotentialMembers(memberList.result);
            console.log('sese',setPotentialMembers);
        } catch (error) {
            console.error('Failed to fetch potential members list', error);
        }
    };
 
    if (decisionCircleDetails) {
        fetchPotentialMembers();
    }
 }, [decisionCircleDetails]);
 


useEffect(() => {
  const handleResize = () => {
      setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', handleResize);
  return () => {
      window.removeEventListener('resize', handleResize);
  };
}, []);

console.log("potentialllll", potentialMembers);


const handleRemoveMember = async (userId) => {
        setLoadingRemove(prev => ({ ...prev, [userId]: true }));
        try {
            await removeMemberFromDecision(userId, decisionCircleDetails.group.id);
            toast("Removed Successfully");
            setDecisionCircleDetails(prevDetails => ({
                ...prevDetails,
                members: prevDetails.members.filter(member => member.user_id !== userId)
            }));
        } catch (error) {
            console.error("Failed to remove member", error);
        } finally {
            setLoadingRemove(prev => ({ ...prev, [userId]: false }));
        }
    };

useEffect(() => {
      if (decisionCircleDetails && decisionCircleDetails.error) {
          if (decisionCircleDetails.error === "No members found for this group") {
              setErrorMessage("No members in this Decision circle");
          } else if (decisionCircleDetails.error === "No groups found for this user") {
              setErrorMessage("Decision Circle is Not Created yet");
          }
      }
}, [decisionCircleDetails]); 

const handleShow = () => setShowModal(true);
const handleClose = () => setShowModal(false);

const getVariant = (status) => {
        switch (status) {
            case 'Accepted':
                return 'success';
            case '':
                return 'warning';
            default:
                return '';
        }
};

const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
 };


const isValidGmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleAddMember = async (userId) => {
  if (!decisionCircleDetails || !decisionCircleDetails.group) {
      toast.error("Decision circle data is not available");
      return;
  }

  setLoadingAdd(true);
  try {
      await addMemberInDecisionCircle(userId, decisionCircleDetails.group.id);
      await decisionCircleAddInvitation(searchQuery);
      toast("Added Successfully");

      // Refresh decision circle details
      const updatedDetails = await getDecisionCircleDetails();
      setDecisionCircleDetails(updatedDetails);
      setPotentialMembers(prev => prev.filter(member => member.user_id !== userId));
  } catch (error) {
      console.error("Failed to add member", error);
      toast.error("Failed to add member.");
  } finally {
      setLoadingAdd(false);
  }
};


console.log("decision", decisionCircleDetails);

const filteredMembers = potentialMembers.filter(member => 
  member.email.toLowerCase().includes(searchQuery.toLowerCase())
);
const existingMemberEmails = decisionCircleDetails?.members?.map(member => member.email) || [];

const inviteButtonStyle = {
  color: "black",
  border: "0.1rem solid #DC3545",
  backgroundColor: "#DC3545",
  padding: "0.5rem",
  width: windowWidth >= 768 ? '30%' : '100%'
};

const handleInvite = async (email) => {
  if (!isValidGmail(email)) {
      toast.error('Please enter a valid email address');
      return;
  }
  setLoadingInvite(true); 
  try {
      const response = await sendDecisionCircleInvitation(email);

      if (response.message === "Mail Sent Successfully") {
          toast('Invited successfully');
      } else {
          toast('Failed to Invite');
      }

      console.log("response", response);
  } catch (error) {
      console.error('Error in Inviting:', error);
      toast.error('An error occurred while inviting the user');
  } finally {
      setLoadingInvite(false); 
  }
};

  return (
    // <div className='row mt-4'>
    //   <div className='col-lg-6 col-md-12 mb-3 text-center'>
    //     <h4>Search the Email</h4>
    //     <input
    //       type='text'
    //       value={searchQuery}
    //       onChange={handleSearchQueryChange}
    //       placeholder='Enter email'
    //     />
    //     {
    //       isValidGmail(searchQuery) && (
    //         <ListGroup>
    //           {filteredMembers.map(member => (
    //             <ListGroup.Item key={member.user_id}>
    //               {member.displayname} ({member.email})
    //               <Button
    //                 variant='primary'
    //                 size='sm'
    //                 className='float-right'
    //                 onClick={() => handleAddMember(member.user_id)}
    //                 disabled={loading}
    //                 style={{ margin: '1rem', backgroundColor: '#28a745', borderColor: '#28a745', color: 'white' }}
    //               >
    //                 {loadingAdd ? (
    //                   <Spinner
    //                     as="span"
    //                     animation="border"
    //                     size="sm"
    //                     role="status"
    //                     aria-hidden="true"
    //                   />
    //                 ) : (
    //                   'Add'
    //                 )}
    //               </Button>
    //             </ListGroup.Item>
    //           ))}
    //           {!existingMemberEmails.includes(searchQuery) && filteredMembers.length === 0 && (
    //             <Button 
    //             onClick={() => handleInvite(searchQuery)}
    //               style={inviteButtonStyle}
    //               disabled={loadingInvite}
    //               >
    //               {loadingInvite ? (
    //                 <Spinner
    //                   as="span"
    //                   animation="border"
    //                   size="sm"
    //                   role="status"
    //                   aria-hidden="true"
    //                 />
    //               ) : (
    //                 'Invite the Member to Decision App'
    //               )}
    //             </Button>
    //           )}
    //           {existingMemberEmails.includes(searchQuery) && (
    //             <div className="alert alert-warning" role="alert" style={{ marginTop: '10px' }}>
    //               Already Added Member
    //             </div>
    //           )}
    //         </ListGroup>
    //       )
    //     }
    //   </div>

    //   <ShareModal
    //             showModal={showModal}
    //             handleClose={handleClose}
    //             decisionGroup={null}
    //             decisionCircleDetails={null}
    //             decision={null}
    //             id={null}
    //         />

    //         <ToastContainer />
    // </div>

    <div style={{ margin: "1rem" }}>
    <Card style={{
        maxWidth: "85rem",
        margin: "2rem auto",
        transform: isHovered ? 'scale(1)' : 'none'
    }}>
        <Card.Body>
            <Card.Title>Decision Circle Details</Card.Title>
            <br />
            {errorMessage && errorMessage !== "No members in this Decision circle" && (
                <Alert variant="danger">
                    {errorMessage}
                    <button
                        onClick={handleShow}
                        style={{ backgroundColor: '#526D82', color: '#ffffff', padding: "0.5rem", borderRadius: "0.5rem", border: "none", width: "100%", marginTop: "1rem" }}
                    >
                        Create Decision Circle
                    </button>
                </Alert>
            )}
            {loading ? (
                <Container className="text-center">
                    <Spinner animation="border" />
                    <p>Loading...</p>
                </Container>
            ) : (
                (!errorMessage || errorMessage === "No members in this inner circle" ) && decisionCircleDetails && (
                    <div>
                        <h5>Members:</h5>
                        <ListGroup>
                            {decisionCircleDetails.members && decisionCircleDetails.members.length > 0 ? (
                                decisionCircleDetails.members.map(member => (
                                    <ListGroup.Item
                                        key={member.user_id}
                                        variant={getVariant(member.status)}
                                    >
                                        {member.displayname} ({member.email}) - {member.status === "Accepted" ? "Accepted" : "Not Accepted"}
                                        <Button
                                            size="sm"
                                            className="float-right"
                                            onClick={() => handleRemoveMember(member.user_id)}
                                            disabled={loadingRemove[member.user_id]}
                                            style={{ margin: '1rem', border:"0.1rem solid #DC3545", backgroundColor:"#DC3545", color:"White", padding:"0.5rem" }}
                                        >
                                            {loadingRemove[member.user_id] ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                'Remove'
                                            )}
                                        </Button>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item>No members found</ListGroup.Item>
                            )}
                        </ListGroup>
                        <br />
                        <h5>Add Member:</h5>
                        <input
                            type="text"
                            placeholder="Search by email"
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            style={{ marginBottom: '1rem' }}
                        />
                        {isValidGmail(searchQuery) && (
                            <ListGroup>
                                {filteredMembers.map(member => (
                                    <ListGroup.Item key={member.user_id}>
                                        {member.displayname} ({member.email})
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="float-right"
                                            onClick={() => handleAddMember(member.user_id)}
                                            disabled={loadingAdd}
                                            style={{ margin: '1rem', border:"0.1rem solid #DC3545", backgroundColor:"#DC3545", color:"White", padding:"0.5rem" }}
                                        >
                                            {loadingAdd ? (
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                'Add'
                                            )}
                                        </Button>
                                    </ListGroup.Item>
                                ))}
                                {!existingMemberEmails.includes(searchQuery) && filteredMembers.length === 0 && (
                                    <Button
                                        onClick={() => handleInvite(searchQuery)}
                                        style={inviteButtonStyle}
                                        disabled={loadingInvite} 
                                    >
                                        {loadingInvite ? ( 
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            'Invite the Member for Decision App'
                                        )}
                                    </Button>
                                )}
                                {existingMemberEmails.includes(searchQuery) && (
                                    <div className="alert alert-warning" role="alert" style={{ marginTop: '10px' }}>
                                        Already Added Member
                                    </div>
                                )}
                            </ListGroup>
                        )}
                    </div>
                )
            )}
        </Card.Body>
    </Card>

    <ShareModal
        showModal={showModal}
        handleClose={handleClose}
        innerGroup={null}
        innerCircleDetails={null}
        decision={null}
        id={null}
    />

    <ToastContainer />
</div>
  );
};

export default List_name;
