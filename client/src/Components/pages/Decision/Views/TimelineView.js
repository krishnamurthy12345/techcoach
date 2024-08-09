import React from 'react'

const TimelineView = () => {
    const filteredDecisions = data.filter(decision => {
      if (selectedTag === 'Advanced Tags') {
        return decision.tags.some(tag => tag.tag_type === 'Advanced Tags');
      } 
      if(selectedTag === 'Sharpen the Saw') {
        return decision.tags.some(tag => tag.tag_type === 'Sharpen the Saw') 
      }
      if (selectedTag === 'Outcome') {
        return decision.tags.some(tag => tag.tag_type === 'Outcome')
      }
      if (selectedTag === 'Time Span') {
        return decision.tags.some(tag => tag.tag_type === 'Time Span')
      }
      if (selectedTag === 'Urgency') {
        return decision.tags.some(tag => tag.tag_type === 'Urgency')
      }
      if (selectedTag === 'Financial Outcome') {
        return decision.tags.some(tag => tag.tag_type === 'Financial Outcome')
      }
      if (selectedTag === 'Decision Maturity') {
        return decision.tags.some(tag => tag.tag_type === 'Decision Maturity')
      }
      if (selectedTag !== '' && selectedTag !== 'All Tags') {
        return decision.tags.some(tag => tag.tag_name === selectedTag);
      }
      return true;
    });
  
    // Group decisions by month
    const decisionsByMonth = filteredDecisions.reduce((acc, decision) => {
      const month = new Date(decision.decision_taken_date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) acc[month] = [];
      acc[month].push(decision);
      return acc;
    }, {});
  
    // Render the timeline view
    return (
      <Box sx={{ position: 'relative', marginTop: 2 }}>
        <Box sx={{ position: 'absolute', left: '50%', top: '0%', bottom: '0%', width: '4px', backgroundColor: '#526D82', transform: 'translateX(-50%)', borderRadius: '0.1rem', zIndex: 1 }} />
  
        {Object.entries(decisionsByMonth).map(([month, decisions]) => (
          <Box key={month} sx={{ marginBottom: 4 }}>
            <Typography variant="h6" sx={{ color: '#526D82', textAlign: 'center', marginBottom: 2, backgroundColor: '#DDE6ED', borderRadius: '4px', padding: '4px', zIndex: 2, position: 'relative' }}>
              {month}
            </Typography>
  
            {decisions.map((decision, index) => (
              <Box
                key={decision.decision_id}
                sx={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  position: 'relative',
                  marginBottom: 2
                }}
              >
                <Box
                  sx={{
                    width: '45%',
                    backgroundColor: expandedDecision === decision.decision_id ? '#526D82' : 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #526D82',
                    position: 'relative',
                    cursor: 'pointer',
                    boxShadow: expandedDecision === decision.decision_id ? '0px 0px 10px 2px rgba(82, 109, 130, 0.7)' : 'none'
                  }}
                  onClick={() => setExpandedDecision(expandedDecision === decision.decision_id ? null : decision.decision_id)}
                >
                  <Typography variant="body2" sx={{ marginLeft: 2 }}>
                    {decision.decision_name}
                  </Typography>
                </Box>
                {expandedDecision === decision.decision_id && (
                  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', zIndex: 3 }}>
                    <Typography variant="h6" sx={{ color: '#526D82', marginBottom: '0.5rem' }}>Decision Details</Typography>
                    <Typography variant="body2">Decision Due Date: {new Date(decision.decision_due_date).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Decision Taken Date: {decision.decision_taken_date ? new Date(decision.decision_taken_date).toLocaleDateString() : '--'}</Typography>
                    <Typography variant="body2">Decision Details: {decision.user_statement}</Typography>
                    <Typography variant="body2">Tags: {decision.tags.map(tag => (
                      <Chip key={tag.id} label={tag.tag_name} />
                    ))}</Typography>
                    <Typography variant="body2">Decision Reasons:</Typography>
                    {decision.decision_reason && decision.decision_reason.map(reason => (
                      <Typography variant="body2" key={reason.id}>
                        {reason.decision_reason_text}
                      </Typography>
                    ))}
                    <Typography variant="body2">Comments: {comments[decision.decision_id] ? comments[decision.decision_id].length : 0}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };

export default TimelineView