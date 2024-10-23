import React from 'react';

const TabularView = () => {
    const tagCounts = {};
    const tagTypes = {};

    data.forEach((decision) => {
      if (decision.tags) {
        decision.tags.forEach((tag) => {
          if (tagCounts[tag.tag_name]) {
            tagCounts[tag.tag_name]++;
          } else {
            tagCounts[tag.tag_name] = 1;
            tagTypes[tag.tag_name] = tag.tag_type || 'Unknown';
          }
        });
      }
    });

    const totalTags = Object.values(tagCounts).reduce((sum, count) => sum + count, 0);

    const sortedTags = Object.keys(tagCounts).sort((a, b) => {
      if (sortCriteria === 'name') {
        return a.localeCompare(b);
      } else {
        return tagCounts[b] - tagCounts[a];
      }
    });

    const rows = sortedTags.map((tag, index) => ({
      id: index,
      tag: tag,
      count: tagCounts[tag],
      tagType: tagTypes[tag],
      percentage: ((tagCounts[tag] / totalTags) * 100).toFixed(2),
    }));

    const columns = [
      {
        field: 'tag',
        headerName: 'Tag Name',
        width: 200,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'count',
        headerName: 'Decisions Count',
        width: 150,
        headerClassName: 'super-app-theme--header',
      },
      {
        field: 'tagType',
        headerName: 'Tag Type',
        width: 200,
        headerClassName: 'super-app-theme--header',
        sortable: false,
      },
    ];


    const pieData = rows.map(row => ({
      name: row.tag,
      value: row.count,
      tagType: row.tagType,
      percentage: row.percentage,
    }));

    const advancedTagsData = pieData.filter(data => data.tagType === 'Advanced Tags');
    const decisionMaturityTagsData = pieData.filter(data => data.tagType === 'Decision Maturity');
    const sharpenthesawData = pieData.filter(data => data.tagType === 'Sharpen the Saw');
    const OutcomeData = pieData.filter(data => data.tagType === 'Outcome');
    const TimeSpanData = pieData.filter(data => data.tagType === 'Time Span');
    const UrgencyData = pieData.filter(data => data.tagType === 'Urgency');
    const FinancialData = pieData.filter(data => data.tagType === 'Financial Outcome');
    // const otherTagsData = pieData.filter(data => data.tagType !== 'Advanced Tags' && data.tagType !== 'Decision Maturity');

    const COLORS = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF5370', '#7E57C2', '#78909C', '#8D6E63', '#D4E157'
    ];

    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12 col-lg-6 d-flex justify-content-center'>
            <TableContainer component={Paper} sx={{ padding: 2, maxWidth: '585px', borderRadius: '10px', marginBottom: '20px' }}>
              <DataGrid
                rows={rows.slice(0, 50)}
                columns={columns}
                autoHeight
                pageSize={50}
                rowsPerPageOptions={[50]}
                hideFooter
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: '#526D82',
                    '&:hover': {
                      backgroundColor: 'rgb(197, 200, 202)',
                    },
                  },
                  '& .MuiDataGrid-cell': {
                    textAlign: 'baseline',
                  },
                }}
              />
            </TableContainer>
          </div>

          <div className='col-12 col-lg-6'>
            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Advanced Tags:</h3>
                  <PieChart width={350} height={450}>
                    <Pie
                      data={advancedTagsData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {advancedTagsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Time Span Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={TimeSpanData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {TimeSpanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend layout="horizontal" align="right" />
                  </PieChart>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Sharpen The Saw Tags:</h3>
                  <PieChart width={300} height={350}>
                    <Pie
                      data={sharpenthesawData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {sharpenthesawData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend layout="horizontal" align="right" />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Outcome Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={OutcomeData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {OutcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Urgency Tags:</h3>
                  <PieChart width={300} height={300}>
                    <Pie
                      data={UrgencyData}
                      cx={150}
                      cy={150}
                      outerRadius={100}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {UrgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='col-12 col-md-6 d-flex justify-content-center'>
                <div className='d-flex flex-column align-items-center'>
                  <h3>Decision Driver Tags:</h3>
                  <PieChart width={300} height={350}>
                    <Pie
                      data={decisionMaturityTagsData}
                      cx={150}
                      cy={150}
                      outerRadius={110}
                      paddingAngle={1}
                      dataKey="value"
                    >
                      {decisionMaturityTagsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                    <Legend />
                  </PieChart>
                </div>
              </div>

              <div className='row'>
                <div className='col-12 col-md-6 d-flex justify-content-center'>
                  <div className='d-flex flex-column align-items-center'>
                    <h3>Financial Tags:</h3>
                    <PieChart width={300} height={300}>
                      <Pie
                        data={FinancialData}
                        cx={150}
                        cy={150}
                        outerRadius={100}
                        paddingAngle={1}
                        dataKey="value"
                      >
                        {FinancialData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={({ payload }) => payload[0] ? `${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)` : null} />
                      <Legend />
                    </PieChart>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );


  };

export default TabularView