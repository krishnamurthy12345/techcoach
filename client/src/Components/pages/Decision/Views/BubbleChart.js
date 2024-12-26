// import React, { useState, useEffect } from 'react';
// import Chart from 'react-apexcharts';
// import axios from 'axios';
// import './BubbleChart.css';

// const BubbleChart = ({ onBubbleClick }) => {
//   const [profiles, setProfiles] = useState([]);
//   const [skills, setSkills] = useState([]);
//   const [chartSeries, setChartSeries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [isChartReady, setIsChartReady] = useState(false);

//   const chartOptions = {
//     chart: {
//       type: 'bubble',
//       height: '100%',
//       width: '100%',
//       events: {
//         dataPointSelection: (event, chartContext, config) => {
//           const { seriesIndex, dataPointIndex } = config;
//           const selectedData = chartSeries[seriesIndex]?.data[dataPointIndex];
//           if (onBubbleClick && selectedData) {
//             onBubbleClick(selectedData); 
//           }
//         },
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     fill: {
//       opacity: 0.8,
//     },
//     title: {
//       text: 'Bubble Chart of Profiles and Skills',
//       align: 'center',
//     },
//     xaxis: {
//       type: 'category',
//       tickPlacement: 'on',
//       title: {
//         text: 'Categories (Profiles and Skills)',
//       },
//       labels: {
//         rotate: -45,
//       },
//     },
//     yaxis: {
//       max: 100,
//       min: 0,
//       tickAmount: 10,
//       title: {
//         text: 'Category Count',
//       },
//     },
//     grid: {
//       padding: {
//         left: 20,
//         right: 20,
//         top: 20,
//         bottom: 20,
//       },
//     },
//     plotOptions: {
//       bubble: {
//         maxBubbleRadius: 30,
//         minBubbleRadius: 10,
//       },
//     },
//     tooltip: {
//       enabled: true,
//       shared: false,
//     },
//   };

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Authentication token missing');
//       }

//       const [profileResponse, skillResponse] = await Promise.all([
//         axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       setProfiles(profileResponse.data.profiles || []);
//       setSkills(skillResponse.data.skills || []);
//       console.log('nanan',[profileResponse.data,skillResponse.data])
//     } catch (err) {
//       setError(err.message || 'Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateSeries = () => {
//     const scaleFactor = 10;
//     const profileSeries = {
//       name: 'Profiles',
//       data: profiles.map((profile, index) => ({
//         x: `${profile.header_name} - ${profile.header_value}`,
//         y: index * 10 + 10,
//         z: Math.min(profile.v_id || 20, 50) * scaleFactor,
//         metadata: profile, // Add metadata for filtering
//       })),
//     };

//     const skillSeries = {
//       name: 'Skills',
//       data: skills.map((skill, index) => ({
//         x: skill.skill_name,
//         y: index * 10 + 10,
//         z: Math.min(skill.skill_id || 10, 50) * scaleFactor,
//         metadata: skill, // Add metadata for filtering
//       })),
//     };

//     setChartSeries([profileSeries, skillSeries]);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (profiles.length > 0 && skills.length > 0) {
//       generateSeries();
//     }
//   }, [profiles, skills]);

//   useEffect(() => {
//     setTimeout(() => {
//       setIsChartReady(true);
//     }, 200);
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div className="Bubble-chart-container" style={{ maxWidth: '70%', height: '500px', margin: 'auto' }}>
//       {isChartReady && chartSeries.length > 0 ? (
//         <Chart options={chartOptions} series={chartSeries} type="bubble" height="500px" />
//       ) : (
//         <p>Loading chart...</p>
//       )}
//     </div>
//   );
// };

// export default BubbleChart;



import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import './BubbleChart.css';

const BubbleChart = ({ onBubbleClick }) => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'profiles', or 'skills'
  const [isChartReady, setIsChartReady] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const [profileResponse, skillResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfiles(profileResponse.data.profiles || []);
      setSkills(skillResponse.data.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const assignColor = (type) => {
    const colors = {
      Goals: '#FF5733',
      Values: '#33FF57',
      Constraints: '#3357FF',
      Resolutions: '#FF33C4',
      OtherFactors: '#FFD700',
      Skills: '#FF9933',
    };
    return colors[type] || '#CCCCCC'; // Default color
  };

  const generateSeries = () => {
    const scaleFactor = 10; // Scale factor for bubble size
  
    // Function to count unique decision names for each category
    const countUniqueDecisions = (items) => {
      return items.reduce((acc, item) => {
        // Group by header_name or skill_name
        const category = item.header_name || item.skill_name;
        const decisionName = item.decision_name;
  
        if (!acc[category]) {
          acc[category] = new Set(); // Use Set to count unique decision names
        }
        acc[category].add(decisionName); // Add decision name to Set (duplicates are ignored)
  
        return acc;
      }, {});
    };
  
    // Filter profiles and skills based on the selected filter
    const filteredProfiles = filter === 'all' || filter === 'profiles' ? profiles : [];
    const filteredSkills = filter === 'all' || filter === 'skills' ? skills : [];
  
    // Count unique decisions for profiles and skills
    const profileDecisionCounts = countUniqueDecisions(filteredProfiles);
    const skillDecisionCounts = countUniqueDecisions(filteredSkills);
  
    // Create series for profiles
    const profileSeries = Object.entries(profileDecisionCounts).map(([category, decisionNames], index) => ({
      name: category,
      color: assignColor(category),
      data: [
        {
          x: category,
          y: index * 10 + 10,
          z: decisionNames.size * scaleFactor, // Use the size of the Set for bubble size
          metadata: { header_name: category, decision_count: decisionNames.size, decision_names: [...decisionNames] },
        },
      ],
    }));
  
    // Create series for skills
    const skillSeries = Object.entries(skillDecisionCounts).map(([category, decisionNames], index) => ({
      name: category,
      color: '#FF9933',
      data: [
        {
          x: category,
          y: index * 10 + 20,
          z: decisionNames.size * scaleFactor, // Use the size of the Set for bubble size
          metadata: { skill_name: category, decision_count: decisionNames.size, decision_names: [...decisionNames] },
        },
      ],
    }));
  
    // Update chart series
    setChartSeries([...profileSeries, ...skillSeries]);
  };
  
  const chartOptions = {
    chart: {
      type: 'bubble',
      height: '100%',
      width: '100%',
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: '400px',
            },
            legend: {
              position: 'top',
              fontSize: '10px',
              markers: {
                size: 5,
              },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              height: '300px',
            },
            legend: {
              position: 'bottom',
              fontSize: '10px',
              markers: {
                size: 6,
              },
            },
          },
        },
      ],
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const { seriesIndex, dataPointIndex } = config;
          const selectedData = chartSeries[seriesIndex]?.data[dataPointIndex];
          if (onBubbleClick && selectedData) {
            onBubbleClick(selectedData);
          }
        },
      },
    },
    dataLabels: { enabled: false },
    fill: { opacity: 0.8 },
    title: {
      text: 'Bubble Chart of Profiles and Skills',
      align: 'center',
    },
    xaxis: {
      title: { text: 'Categories (Profiles and Skills)' },
      labels: { rotate: -45 },
    },
    yaxis: {
      max: 100,
      min: 0,
      tickAmount: 10,
      title: { text: 'Category Count' },
    },
    grid: {
      padding: { left: 20, right: 20, top: 20, bottom: 20 },
    },
    plotOptions: {
      bubble: { maxBubbleRadius: 30, minBubbleRadius: 15 },
    },
    legend: {
      position: 'bottom',
      markers: {
        size: 10,
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        return `
          <div class="tooltip-custom">
            <strong>Value: ${data.metadata.header_value || data.x}</strong><br />
            Size: ${data.z}<br />
            Decision Count: ${data.metadata.decision_count || 0}<br />
          </div>`;
      },
    },
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 || skills.length > 0) {
      generateSeries();
    }
  }, [profiles, skills, filter]);

  useEffect(() => {
    setTimeout(() => {
      setIsChartReady(true);
    }, 200);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="Bubble-chart-container" style={{ maxWidth: '70%', height: '500px', margin: 'auto' }}>
      <div className="filter-container">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('profiles')}>Profiles</button>
        <button onClick={() => setFilter('skills')}>Skills</button>
      </div>
      {isChartReady && chartSeries.length > 0 ? (
        <Chart options={chartOptions} series={chartSeries} type="bubble" height="500px" />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default BubbleChart;
