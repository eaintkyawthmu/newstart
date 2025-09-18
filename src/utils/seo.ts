interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export const updateSEO = ({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}: SEOData) => {
  // Update document title
  document.title = title;

  // Helper function to update or create meta tags
  const updateMetaTag = (property: string, content: string, isProperty = false) => {
    const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  // Update basic meta tags
  updateMetaTag('description', description);
  if (keywords.length > 0) {
    updateMetaTag('keywords', keywords.join(', '));
  }
  if (author) {
    updateMetaTag('author', author);
  }

  // Update Open Graph tags
  updateMetaTag('og:title', title, true);
  updateMetaTag('og:description', description, true);
  updateMetaTag('og:type', type, true);
  
  if (url) {
    updateMetaTag('og:url', url, true);
  }
  
  if (image) {
    updateMetaTag('og:image', image, true);
  }

  // Update Twitter Card tags
  updateMetaTag('twitter:title', title, true);
  updateMetaTag('twitter:description', description, true);
  updateMetaTag('twitter:card', 'summary_large_image', true);
  
  if (image) {
    updateMetaTag('twitter:image', image, true);
  }

  // Update article-specific tags
  if (type === 'article') {
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, true);
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, true);
    }
    if (author) {
      updateMetaTag('article:author', author, true);
    }
  }
};

export const generateStructuredData = (data: any) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(script);
};

export const addBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
  
  generateStructuredData(structuredData);
};