import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const BubbleChart = () => {
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [chartSeries, setChartSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartOptions = {
    chart: {
      type: 'bubble',
      height: '100%',
      width: '100%',
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 0.8,
    },
    title: {
      text: 'Bubble Chart of Profiles and Skills',
      align: 'center',
    },
    xaxis: {
      type: 'category',
      tickPlacement: 'on',
      title: {
        text: 'Categories (Profiles and Skills)',
      },
      labels: {
        rotate: -45, // Rotate labels for better spacing
      },
    },
    yaxis: {
      max: 100, // Increase if bubbles are cut off vertically
      min: 0, // Ensure y-axis starts from 0
      tickAmount: 10, // Increase number of ticks for better spacing
      title: {
        text: 'Category Count',
      },
    },
    grid: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10, // Add padding to prevent bubbles from being clipped
      },
    },
    plotOptions: {
      bubble: {
        maxBubbleRadius: 40, // Adjust for consistent sizing
        minBubbleRadius: 5, // Avoid very small bubbles
      },
    },
  };
  
  // Fetch data for Profiles and Skills
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const [profileResponse, skillResponse] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/links`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/api/link`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (profileResponse.data?.profiles) {
        setProfiles(profileResponse.data.profiles);
      } else {
        throw new Error('No profiles data found');
      }

      if (skillResponse.data?.skills) {
        setSkills(skillResponse.data.skills);
      } else {
        throw new Error('No skills data found');
      }

      generateSeries();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data for profiles and skills
  const generateSeries = () => {
    const maxZ = Math.max(
      ...profiles.map((p) => p.v_id || 70),
      ...skills.map((s) => (s.skill_id ? s.skill_id * 10 : 100))
    );
  
    const profileSeries = {
      name: 'Profiles',
      data: profiles.map((profile, index) => ({
        x: `${profile.header_name} - ${profile.header_value}`,
        y: index * 10 + 10,
        z: Math.min(profile.v_id || 70, maxZ), // Scale within bounds
      })),
    };
  
    const skillSeries = {
      name: 'Skills',
      data: skills.map((skill, index) => ({
        x: skill.skill_name,
        y: index * 10 + 10,
        z: Math.min(skill.skill_id ? skill.skill_id * 10 : 100, maxZ),
      })),
    };
  
    setChartSeries([profileSeries, skillSeries]);
  };
  


  useEffect(() => {
    fetchData();
  }, []);

  chartOptions.plotOptions.bubble = {
    maxBubbleRadius: window.innerWidth < 768 ? 20 : 40, // Smaller bubbles on small screens
    minBubbleRadius: window.innerWidth < 768 ? 3 : 5,
  };

  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="chart-container" style={{ maxWidth: '60%', height: '500px',margin:'auto' }}>
      <Chart options={chartOptions} series={chartSeries} type="bubble" height="100%" width="100%" />
    </div>
  );
};

export default BubbleChart;
