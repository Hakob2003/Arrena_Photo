import dynamic from 'next/dynamic';

export const PAGE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  '/': dynamic(() => import('../../app/page')),
  '/feed': dynamic(() => import('../../app/feed/page')),
  '/generate': dynamic(() => import('../../app/generate/page')),
  '/gallery': dynamic(() => import('../../app/gallery/page')),
  '/templates': dynamic(() => import('../../app/templates/page')),
  '/marketplace': dynamic(() => import('../../app/marketplace/page')),
  '/my-generations': dynamic(() => import('../../app/my-generations/page')),
  '/my-templates': dynamic(() => import('../../app/my-templates/page')),
};
