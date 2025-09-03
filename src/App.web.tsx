import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
        fontSize: '1.1rem',
        marginBottom: '30px'
      }}>
        ✅ Web version is working!
      </div>
      
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '400px',
        margin: '0 auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: '10px 0', color: '#333' }}>
          🚀 Successfully deployed on Vercel
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          ⚡ Fast CDN hosting
        </p>
        <p style={{ margin: '10px 0', color: '#333' }}>
          🔒 Automatic HTTPS
        </p>
      </div>
    </div>
  );
}

export default App;
