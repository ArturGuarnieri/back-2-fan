
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SortOption = 'name-asc' | 'name-desc' | 'rate-asc' | 'rate-desc';

interface PartnersFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categories: string[];
  onClearFilters: () => void;
}

const PartnersFilters: React.FC<PartnersFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  categories,
  onClearFilters
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('search_partners')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('all_categories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_categories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="w-full md:w-48">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              {sortBy.includes('asc') ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t('sort_name_asc')}</SelectItem>
              <SelectItem value="name-desc">{t('sort_name_desc')}</SelectItem>
              <SelectItem value="rate-asc">{t('sort_rate_asc')}</SelectItem>
              <SelectItem value="rate-desc">{t('sort_rate_desc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full md:w-auto"
        >
          {t('clear_filters')}
        </Button>
      </div>
    </div>
  );
};

export default PartnersFilters;
