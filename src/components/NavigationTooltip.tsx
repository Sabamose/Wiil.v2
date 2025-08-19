import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigationTooltipProps {
  children: ReactNode;
  content: string;
  show: boolean;
}

export const NavigationTooltip = ({ children, content, show }: NavigationTooltipProps) => {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        sideOffset={8}
        className="text-sm font-medium"
        aria-label={content}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
};