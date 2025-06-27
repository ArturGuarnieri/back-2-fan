
import React from 'react';
import { useStaking } from '@/hooks/useStaking';
import { useTranslation } from 'react-i18next';
import { useFilteredPartners } from '@/hooks/useFilteredPartners';
import { useStoreRedirect } from '@/hooks/useStoreRedirect';
import PartnerCard from './PartnerCard';
import GoToStoreModal from './GoToStoreModal';
import PartnersFilters from './PartnersFilters';

const EcommerceLinks = () => {
  const { cashbackBonus } = useStaking();
  const { t } = useTranslation();
  const {
    filteredPartners,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    categories,
    clearFilters
  } = useFilteredPartners();
  const {
    selectedStore,
    modalOpen,
    modalLoading,
    handleClickPartner,
    handleConfirmGoToStore,
    setModalOpen
  } = useStoreRedirect();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('partner_stores')}</h2>
        
        <PartnersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={categories}
          onClearFilters={clearFilters}
        />

        {filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('no_stores_found')}</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              {t('clear_filters_btn')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                cashbackBonus={cashbackBonus}
                onClickPartner={handleClickPartner}
              />
            ))}
          </div>
        )}
      </div>
      <GoToStoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeName={selectedStore?.name || ""}
        onConfirm={handleConfirmGoToStore}
        loading={modalLoading}
      />
    </div>
  );
};

export default EcommerceLinks;
