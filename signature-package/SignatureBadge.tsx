import React, { useState } from 'react';

// Use a unique namespace for styles to avoid conflicts
const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    zIndex: 9999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  badge: {
    backgroundColor: '#000', // Default dark
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'transform 0.2s ease',
    border: 'none',
    outline: 'none',
  },
  popup: {
    position: 'absolute' as const,
    bottom: '40px',
    right: '0',
    backgroundColor: '#fff',
    color: '#333',
    width: '280px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    opacity: 0,
    transform: 'translateY(10px) scale(0.95)',
    pointerEvents: 'none' as const,
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    maxHeight: '0', // Hide by default
  },
  popupVisible: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
    pointerEvents: 'auto' as const,
    maxHeight: '400px', // Allow expansion
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  projectList: {
    padding: '8px',
    overflowY: 'auto' as const,
    maxHeight: '300px',
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    textDecoration: 'none',
    color: 'inherit',
    borderRadius: '8px',
    transition: 'background-color 0.1s',
  },
  projectImage: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    backgroundColor: '#eee',
  },
  projectInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  projectTitle: {
    fontSize: '13px',
    fontWeight: 500,
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  projectDesc: {
    fontSize: '11px',
    color: '#666',
    margin: 0,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  footer: {
    padding: '8px 12px',
    borderTop: '1px solid #eee',
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#888',
    backgroundColor: '#fafafa',
  },
  link: {
    color: '#444', 
    textDecoration: 'none',
    fontWeight: 500,
  }
};

// Define types broadly
interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  liveUrl?: string;
}

interface SignatureBadgeProps {
  apiUrl?: string; // Allow override, default to production URL
  userId?: string;
}

export const SignatureBadge: React.FC<SignatureBadgeProps> = ({ 
  apiUrl = 'https://portfolio-paulowender.vercel.app/api/public/projects', // Replace with actual production URL later if known
  userId 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!hasFetched && !isOpen) {
      fetchProjects();
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const url = new URL(apiUrl as string); // Cast to string to fix TS if needed, logic is safe-ish
      if (userId) url.searchParams.append('userId', userId);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setProjects(data.projects || []);
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching signature projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {/* Popup content */}
      <div style={{...styles.popup, ...(isOpen ? styles.popupVisible : {})}}>
        <div style={styles.header}>
          <span>More by Paulo Wender</span>
        </div>
        
        <div style={styles.projectList}>
          {loading && <div style={{padding: '16px', textAlign: 'center', fontSize: '12px', color: '#666'}}>Loading...</div>}
          
          {!loading && projects.length === 0 && hasFetched && (
             <div style={{padding: '16px', textAlign: 'center', fontSize: '12px', color: '#666'}}>No projects found.</div>
          )}

          {projects.map(project => (
            <a 
              key={project.id} 
              href={project.liveUrl || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.projectItem}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {project.imageUrl ? (
                <img src={project.imageUrl} alt={project.title} style={styles.projectImage} />
              ) : (
                <div style={styles.projectImage} />
              )}
              <div style={styles.projectInfo}>
                <p style={styles.projectTitle}>{project.title}</p>
                <p style={styles.projectDesc}>{project.description}</p>
              </div>
            </a>
          ))}
        </div>

        <div style={styles.footer}>
          <a href="https://wendertech.com.br" target="_blank" rel="noopener noreferrer" style={styles.link}>
            Visit wendertech.com.br
          </a>
        </div>
      </div>

      {/* The visible badge */}
      <button style={styles.badge} onClick={toggleOpen}>
        <span>⚡</span>
        <span>Made by Paulo Wender</span>
      </button>
    </div>
  );
};

export default SignatureBadge;
