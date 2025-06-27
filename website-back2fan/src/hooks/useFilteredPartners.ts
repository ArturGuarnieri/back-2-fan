
import { useState, useEffect, useMemo } from 'react';
import { usePartners } from '@/hooks/usePartners';
import { Partner } from '@/types/partner';
import { safeJsonParse } from '@/utils/jsonParser';

export type SortOption = 'name-asc' | 'name-desc' | 'rate-asc' | 'rate-desc';

export function useFilteredPartners() {
  const { data: partnersListRaw = [], isLoading } = usePartners();
  const [country, setCountry] = useState(() => localStorage.getItem('selectedCountry') || 'BR');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  useEffect(() => {
    const listener = () => setCountry(localStorage.getItem('selectedCountry') || 'BR');
    window.addEventListener('countryChanged', listener);
    return () => window.removeEventListener('countryChanged', listener);
  }, []);

  // Transform partnersListRaw for missing/incorrect types (esp. cashback_by_category)
  const partnersList: Partner[] = useMemo(() => 
    partnersListRaw.map((p: any) => ({
      ...p,
      cashback_by_category:
        typeof p.cashback_by_category === 'string'
          ? (safeJsonParse(p.cashback_by_category) || null)
          : (p.cashback_by_category ?? null),
    }))
  , [partnersListRaw]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(
      partnersList
        .filter(p => p.category)
        .map(p => p.category!)
    )];
    return uniqueCategories.sort();
  }, [partnersList]);

  // Filter and sort partners
  const filteredPartners = useMemo(() => {
    let filtered = partnersList.filter((p: Partner) =>
      Array.isArray(p.country) ? p.country.includes(country) : false
    );

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'rate-asc':
          return a.base_rate - b.base_rate;
        case 'rate-desc':
          return b.base_rate - a.base_rate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [partnersList, country, searchTerm, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('name-asc');
  };

  return {
    filteredPartners,
    isLoading,
    country,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    clearFilters
  };
}
