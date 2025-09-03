import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const HomeScreen = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '60vh'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: '#2c3e50', 
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        🎾 Piqle 2.0
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#7f8c8d',
        marginBottom: '30px'
      }}>
        Tournament Management App
      </p>
      <div style={{ 
        backgroundColor: '#27ae60', 
        color: 'white',
        padding: '15px 30px',
        borderRadius: '25px',
        display: 'inline-block',
        fontSize: '1.1rem'
      }}>
        ✅ Web version is working!
      </div>
    </div>
  );

  const TournamentsScreen = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#e3f2fd',
      minHeight: '60vh'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: '#1976d2', 
        marginBottom: '20px'
      }}>
        🏆 Tournaments
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#424242'
      }}>
        Manage your tournaments here
      </p>
      <div style={{ 
        backgroundColor: '#1976d2', 
        color: 'white',
        padding: '15px 30px',
        borderRadius: '25px',
        marginTop: '30px',
        display: 'inline-block'
      }}>
        🚧 Coming Soon
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#f3e5f5',
      minHeight: '60vh'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        color: '#7b1fa2', 
        marginBottom: '20px'
      }}>
        👤 Profile
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#424242'
      }}>
        Your personal settings
      </p>
      <div style={{ 
        backgroundColor: '#7b1fa2', 
        color: 'white',
        padding: '15px 30px',
        borderRadius: '25px',
        marginTop: '30px',
        display: 'inline-block'
      }}>
        🚧 Coming Soon
      </div>
    </div>
  );

  const Navigation = () => (
    <nav style={{ 
      display: 'flex',
      backgroundColor: '#2c3e50', 
      padding: '20px',
      justifyContent: 'space-around',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <button 
        onClick={() => setActiveTab('home')}
        style={{ 
          background: activeTab === 'home' ? '#3498db' : 'transparent',
          color: 'white', 
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        🏠 Home
      </button>
      
      <button 
        onClick={() => setActiveTab('tournaments')}
        style={{ 
          background: activeTab === 'tournaments' ? '#3498db' : 'transparent',
          color: 'white', 
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        🏆 Tournaments
      </button>
      
      <button 
        onClick={() => setActiveTab('profile')}
        style={{ 
          background: activeTab === 'profile' ? '#3498db' : 'transparent',
          color: 'white', 
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        👤 Profile
      </button>
    </nav>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'tournaments':
        return <TournamentsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh'
    }}>
      <Navigation />
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
