import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateSEO, addBreadcrumbStructuredData } from '../utils/seo';

interface UseSEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export const useSEO = ({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  breadcrumbs
}: UseSEOProps) => {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = `${title} | My New Start`;
    const currentUrl = `${window.location.origin}${location.pathname}`;
    
    updateSEO({
      title: fullTitle,
      description,
      keywords: [...keywords, 'immigration', 'financial literacy', 'U.S. immigrants'],
      image: image || `${window.location.origin}/icons/icon-512x512.png`,
      url: currentUrl,
      type,
      author: 'My New Start'
    });

    if (breadcrumbs) {
      addBreadcrumbStructuredData(breadcrumbs);
    }
  }, [title, description, keywords, image, type, breadcrumbs, location.pathname]);
};

export default useSEO;