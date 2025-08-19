import { useChatContext } from '@/contexts/ChatContext';
import { useResponsive } from '@/hooks/use-responsive';
import { useNavigationState } from '@/hooks/useNavigationState';

export const useChatLayout = () => {
  const { isOpen: isChatOpen } = useChatContext();
  const { isMobile } = useResponsive();
  const { isCollapsed, isHome } = useNavigationState();
  
  // Chat panel width
  const chatPanelWidth = 384; // w-96 = 24rem = 384px
  
  // Calculate main content margin-left
  const getMainContentMargin = () => {
    let marginLeft = 0;
    
    // Chat panel margin (only on desktop)
    if (isChatOpen && !isMobile) {
      marginLeft += chatPanelWidth;
    }
    
    // Navigation margin
    if (!isMobile) {
      if (isHome) {
        marginLeft += 240; // ml-60 = 15rem = 240px
      } else if (isCollapsed) {
        marginLeft += 80; // ml-20 = 5rem = 80px
      } else {
        marginLeft += 240; // ml-60 = 15rem = 240px
      }
    }
    
    return marginLeft;
  };
  
  return {
    isChatOpen,
    chatPanelWidth,
    marginLeft: getMainContentMargin(),
    isMobile,
  };
};