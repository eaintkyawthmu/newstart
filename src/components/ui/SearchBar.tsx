import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'course' | 'article' | 'resource';
  url: string;
  category?: string;
}

interface SearchBarProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onResultClick,
  placeholder,
  className = '',
  autoFocus = false
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useKeyboardNavigation({
    onEscape: () => {
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    onArrowUp: () => {
      if (isOpen && results.length > 0) {
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
      }
    },
    onArrowDown: () => {
      if (isOpen && results.length > 0) {
        setSelectedIndex(prev => prev >= results.length - 1 ? 0 : prev + 1);
      }
    },
    onEnter: () => {
      if (isOpen && selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    },
    enabled: isOpen
  });

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setSelectedIndex(-1);

    try {
      // Mock search results - in a real app, this would call your search API
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Building Credit from Scratch',
          description: 'Learn how to establish credit history in the U.S.',
          type: 'lesson',
          url: '/courses/build-credit/lessons/building-credit-basics',
          category: 'Credit Building'
        },
        {
          id: '2',
          title: 'Opening Your First Bank Account',
          description: 'Step-by-step guide to banking in America',
          type: 'lesson',
          url: '/courses/banking/lessons/first-bank-account',
          category: 'Banking'
        },
        {
          id: '3',
          title: 'Understanding U.S. Taxes',
          description: 'Tax basics for new immigrants',
          type: 'course',
          url: '/courses/us-taxes',
          category: 'Taxes'
        },
        {
          id: '4',
          title: 'Health Insurance Guide',
          description: 'Navigate the U.S. healthcare system',
          type: 'article',
          url: '/library/health-insurance-guide',
          category: 'Healthcare'
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
      setIsOpen(mockResults.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onResultClick) {
      onResultClick(result);
    } else {
      window.location.href = result.url;
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return '📚';
      case 'course':
        return '🎓';
      case 'article':
        return '📄';
      case 'resource':
        return '🔗';
      default:
        return '📋';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder || (language === 'en' ? 'Search lessons, courses, and resources...' : 'သင်ခန်းစာများ၊ သင်တန်းများနှင့် အရင်းအမြစ်များကို ရှာဖွေပါ...')}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          aria-label={language === 'en' ? 'Search' : 'ရှာဖွေရန်'}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {isLoading && (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin mr-2" />
          )}
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={language === 'en' ? 'Clear search' : 'ရှာဖွေမှု ရှင်းလင်းရန်'}
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {isOpen && (
        <div
          ref={resultsRef}
          id="search-results"
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          role="listbox"
          aria-label={language === 'en' ? 'Search results' : 'ရှာဖွေရလဒ်များ'}
        >
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                {language === 'en' ? 'No results found' : 'ရလဒ်များ မတွေ့ရှိပါ'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:bg-blue-50 ${
                    selectedIndex === index ? 'bg-blue-50' : ''
                  }`}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <div className="flex items-start">
                    <span className="text-lg mr-3 mt-0.5">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                      {result.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {result.category}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;