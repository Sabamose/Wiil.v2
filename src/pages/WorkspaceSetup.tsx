import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceSelection from '@/components/WorkspaceSelection';

const WorkspaceSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if workspace was already selected
    const savedWorkspace = localStorage.getItem('selected-workspace');
    if (savedWorkspace) {
      navigate('/');
    }
  }, [navigate]);

  const handleWorkspaceSelect = (workspaceId: string) => {
    // Save workspace selection to localStorage
    localStorage.setItem('selected-workspace', workspaceId);
    // Navigate to main app
    navigate('/');
  };

  return <WorkspaceSelection onWorkspaceSelect={handleWorkspaceSelect} />;
};

export default WorkspaceSetup;