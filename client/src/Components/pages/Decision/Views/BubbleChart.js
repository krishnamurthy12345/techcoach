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
//   const [filter, setFilter] = useState('all'); 
//   const [isChartReady, setIsChartReady] = useState(false);

//   const fetchData = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('Authentication token missing');
//       }

//       const [profileResponse, skillResponse] = await Promise.all([
//         axios.get(`${process.env.REACT_APP_API_URL}/link/bubbleChartProfiles`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${process.env.REACT_APP_API_URL}/link/bubbleChartSkills`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);
//     console.log('Profile Response:', profileResponse.data);
//     console.log('Skill Response:', skillResponse.data);

//       setProfiles(profileResponse.data.profiles || []);
//       setSkills(skillResponse.data.decisions || []);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const assignColor = (type) => {
//     const colors = {
//       Goals: '#FF5733',        
//       Values: '#33FF57',       
//       Constraints: '#3357FF',  
//       Resolutions: '#FF33C4',  
//       OtherFactors: '#FFD700', 
//       Skills: '#FF9933',       
//       Opportunity: '#8A2BE2',  
//       Attitude: '#00BFFF',     
//       Strength: '#228B22',     
//       Weakness: '#DC143C',     
//       Threat: '#8B0000',     
//     };
//     return colors[type] || '#CCCCCC'; 
//   };
  

//   const generateSeries = () => {
//     const baseSize = 5;    
//     const scaleFactor = 10;
  
//     const profileMap = profiles.reduce((acc, profile) => {
//       const key = profile.header_name;
//       if (!acc[key]) {
//         acc[key] = { ...profile, decision_count: 0 };
//       }
//       acc[key].decision_count += parseInt(profile.decision_count, 10);
//       return acc;
//     }, {});
  
//     const profileData = (filter === 'all' || filter === 'profiles' ? Object.values(profileMap) : []).map((profile) => ({
//       x: profile.header_name,
//       y: profile.decision_count,
//       z: baseSize + profile.decision_count * scaleFactor, 
//       fillColor: assignColor(profile.header_name),
//       metadata: { header_name: profile.header_name, decision_name: profile.decision_name },
//     }));
  
//     const skillMap = skills.reduce((acc, skill) => {
//       const key = skill.skill_name;
//       if (!acc[key]) {
//         acc[key] = { ...skill, decision_count: 0 };
//       }
//       acc[key].decision_count += parseInt(skill.skill_count, 10);
//       return acc;
//     }, {});
  
//     const skillData = (filter === 'all' || filter === 'skills' ? Object.values(skillMap) : []).map((skill) => ({
//       x: skill.skill_name,
//       y: skill.decision_count,
//       z: baseSize + skill.decision_count * scaleFactor,
//       fillColor: assignColor('Skills'),
//       metadata: { skill_name: skill.skill_name, decision_name: skill.decision_name },
//     }));
  
//     setChartSeries([
//       {
//         name: 'Profiles & Skills',
//         data: [...profileData, ...skillData],
//       },
//     ]);
//   };
  
    
//   const chartOptions = {
//     chart: {
//       type: 'bubble',
//       height: '100%',
//       width: '100%',
//       responsive: [
//         {
//           breakpoint: 768,
//           options: {
//             chart: { height: '400px' },
//             legend: { position: 'top', fontSize: '10px', markers: { size: 5 } },
//           },
//         },
//         {
//           breakpoint: 480,
//           options: {
//             chart: { height: '300px' },
//             legend: { position: 'bottom', fontSize: '10px', markers: { size: 6 } },
//           },
//         },
//       ],
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
//     dataLabels: { enabled: false },
//     fill: { opacity: 0.8 },
//     title: { text: 'Bubble Chart of Profiles and Skills', align: 'center' },
//     xaxis: {
//       title: { text: 'Categories (Profiles ,Advanced Prfiles and Skills)' },
//       labels: { rotate: -45 },
//     },
//     yaxis: {
//       max: 80,  
//       min: -10,  
//       tickAmount: 12,
//       title: { text: 'Category Count' },
//     },
//     grid: { padding: { left: 30, right: 30, top: 30, bottom: 30 } },
//     plotOptions: { bubble: { maxBubbleRadius: 25, minBubbleRadius: 10 } },
//     legend: { position: 'bottom', markers: { size: 10 } },
//     tooltip: {
//       custom: function ({ series, seriesIndex, dataPointIndex, w }) {
//         const data = w.config.series[seriesIndex].data[dataPointIndex];
//         return `
//           <div class="tooltip-custom">
//             <strong>Value: ${data.metadata.header_name || data.metadata.skill_name}</strong><br />
//             Size: ${data.z}<br />
//             Decision Name: ${data.metadata.decision_name || 'N/A'}<br />
//           </div>`;
//       },
//     },
//   };
  

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (profiles.length > 0 && skills.length > 0) {
//       generateSeries();
//     }
//   }, [profiles, skills,filter]);

//   useEffect(() => {
//     setTimeout(() => {
//       setIsChartReady(true);
//     }, 200);
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="error-message">{error}</p>;

//   return (
//     <div className="Bubble-chart-container" style={{ maxWidth: '70%', height: '500px', margin: 'auto' }}>
//       <div className="filter-container">
//         <button onClick={() => setFilter('all')}>All</button>
//         <button onClick={() => setFilter('profiles')}>Profiles</button>
//         <button onClick={() => setFilter('skills')}>Skills</button>
//       </div>
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
  const [filter, setFilter] = useState('all'); 

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token missing');

      const [profileResponse, skillResponse] = await Promise.allSettled([
        axios.get(`${process.env.REACT_APP_API_URL}/link/bubbleChartProfiles`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/link/bubbleChartSkills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData =
        profileResponse.status === 'fulfilled' ? profileResponse.value.data.profiles || [] : [];
      const skillData =
        skillResponse.status === 'fulfilled' ? skillResponse.value.data.decisions || [] : [];

      setProfiles(profileData);
      setSkills(skillData);

      if (profileData.length === 0 && skillData.length === 0) {
        setError('No data available from APIs.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data.');
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
      Opportunity: '#8A2BE2',
      Attitude: '#00BFFF',
      Strength: '#228B22',
      Weakness: '#DC143C',
      Threat: '#8B0000',
    };
    return colors[type] || '#CCCCCC';
  };

  const generateSeries = () => {
    const baseSize = 5;    
    const scaleFactor = 10;
    const duplicateScaleFactor = 5; // Additional size factor for duplicates
  
    const profileMap = profiles.reduce((acc, profile) => {
      const key = `${profile.header_name}-${profile.metadata_value}`;
      if (!acc[key]) {
        acc[key] = { ...profile, decision_count: 0 };
      }
      acc[key].decision_count += parseInt(profile.decision_count, 10);
      return acc;
    }, {});
  
    const profileData = (filter === 'all' || filter === 'profiles' ? Object.values(profileMap) : []).map((profile) => {
      const duplicateFactor = Object.values(profileMap).filter(
        (item) => item.header_name === profile.header_name
      ).length;
  
      return {
        x: profile.header_name,
        y: profile.decision_count,
        z: baseSize + profile.decision_count * scaleFactor + duplicateFactor * duplicateScaleFactor,
        fillColor: assignColor(profile.header_name),
        metadata: { header_name: profile.header_name, decision_name: profile.decision_name },
      };
    });
  
    // Group and aggregate skills
    const skillMap = skills.reduce((acc, skill) => {
      const key = `${skill.skill_name}-${skill.metadata_value}`; 
      if (!acc[key]) {
        acc[key] = { ...skill, decision_count: 0 };
      }
      acc[key].decision_count += parseInt(skill.skill_count, 10);
      return acc;
    }, {});
  
    const skillData = (filter === 'all' || filter === 'skills' ? Object.values(skillMap) : []).map((skill) => {
      const duplicateFactor = Object.values(skillMap).filter(
        (item) => item.skill_name === skill.skill_name
      ).length;
  
      return {
        x: skill.skill_name,
        y: skill.decision_count,
        z: baseSize + skill.decision_count * scaleFactor + duplicateFactor * duplicateScaleFactor,
        fillColor: assignColor('Skills'),
        metadata: { skill_name: skill.skill_name, decision_name: skill.decision_name },
      };
    });
  
    setChartSeries([
      {
        name: 'Profiles & Skills',
        data: [...profileData, ...skillData],
      },
    ]);
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (profiles.length > 0 || skills.length > 0) {
      generateSeries();
    }
  }, [profiles, skills, filter]);

  if (loading) return <p>Loading chart data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  const chartOptions = {
        chart: {
          type: 'bubble',
          height: '100%',
          width: '100%',
          responsive: [
            {
              breakpoint: 768,
              options: {
                chart: { height: '400px' },
                legend: { position: 'top', fontSize: '10px', markers: { size: 5 } },
              },
            },
            {
              breakpoint: 480,
              options: {
                chart: { height: '300px' },
                legend: { position: 'bottom', fontSize: '10px', markers: { size: 6 } },
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
        title: { text: 'Bubble Chart of Profiles and Skills', align: 'center' },
        xaxis: {
          title: { text: 'Categories (Profiles ,Advanced Profiles and Skills)' },
          labels: { rotate: -45 },
        },
        yaxis: {
          max: 80,  
          min: -10,  
          tickAmount: 12,
          title: { text: 'Category Count' },
        },
        grid: { padding: { left: 30, right: 30, top: 30, bottom: 30 } },
        plotOptions: { bubble: { maxBubbleRadius: 25, minBubbleRadius: 10 } },
        legend: { position: 'bottom', markers: { size: 10 } },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const data = w.config.series[seriesIndex].data[dataPointIndex];
            return `
              <div class="tooltip-custom">
                <strong>Value: ${data.metadata.header_name || data.metadata.skill_name}</strong><br />
                Size: ${data.z}<br />
                Decision Name: ${data.metadata.decision_name || 'N/A'}<br />
              </div>`;
          },
        },
      };
      

  return (
    <div className="Bubble-chart-container" style={{ maxWidth: '80%', margin: 'auto' }}>
      <div className="filter-container">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('profiles')}>Profiles</button>
        <button onClick={() => setFilter('skills')}>Skills</button>
      </div>
      {chartSeries.length > 0 ? (
        <Chart options={chartOptions} series={chartSeries} type="bubble" height="500px" />
      ) : (
        <p>No data available for the selected filter.</p>
      )}
    </div>
  );
};

export default BubbleChart;