import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface WorkspaceGuardProps {
  children: React.ReactNode;
}

const WorkspaceGuard = ({ children }: WorkspaceGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const savedWorkspace = localStorage.getItem('selected-workspace');
    
    // If no workspace is selected and not on setup page, redirect to setup
    if (!savedWorkspace && location.pathname !== '/workspace-setup' && location.pathname !== '/home') {
      navigate('/workspace-setup');
    }
    
    setIsChecking(false);
  }, [navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WorkspaceGuard;