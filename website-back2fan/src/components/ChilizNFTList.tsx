
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useChilizNFTs } from '@/hooks/useChilizNFTs';
import { useTranslation } from 'react-i18next';
import { Image, ExternalLink, AlertCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';

const ChilizNFTList = () => {
  const { t } = useTranslation();
  const { data: nfts = [], isLoading, error } = useChilizNFTs();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium">{t('loading_nfts')}</div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="w-20 h-20 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
        <p className="text-red-600">{t('error_loading_nfts')}</p>
        <p className="text-sm text-gray-500 mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">{t('no_nfts_found')}</p>
        <p className="text-sm text-gray-400 mt-2">
          {t('no_nfts_description')}
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('chiliz_nfts')}</h3>
        <Badge variant="secondary">{nfts.length} NFTs</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
            <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
              {nft.image ? (
                <>
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="fallback-icon absolute inset-0 bg-gray-200 items-center justify-center hidden">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg truncate">{nft.name}</h4>
                <Badge variant="outline" className="text-xs">#{nft.tokenId}</Badge>
              </div>
              
              {nft.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {nft.description}
                </p>
              )}

              {/* Partner Information */}
              {nft.partner && (
                <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium text-blue-800">{nft.partner.name}</span>
                    <span className="text-blue-600 ml-1">({nft.partner.baseRate}%)</span>
                  </div>
                </div>
              )}

              {/* Transaction Details */}
              {nft.transactionDetails && (
                <div className="space-y-2 p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(nft.transactionDetails.cashbackAmount, nft.transactionDetails.currency)}
                      </span>
                    </div>
                    <Badge className={getStatusColor(nft.transactionDetails.status)}>
                      {t(`status_${nft.transactionDetails.status}`)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{t('purchase_label')} {formatCurrency(nft.transactionDetails.saleAmount, nft.transactionDetails.currency)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(nft.transactionDetails.transactionDate)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Attributes */}
              {nft.attributes && nft.attributes.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    {t('properties')}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {nft.attributes.slice(0, 4).map((attr, index) => (
                      <div key={index} className="bg-gray-50 rounded p-2 flex justify-between">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {attr.trait_type}
                        </span>
                        <span className="text-xs font-medium text-gray-900">
                          {attr.value}
                        </span>
                      </div>
                    ))}
                    {nft.attributes.length > 4 && (
                      <div className="text-center">
                        <Badge variant="outline" className="text-xs">
                          +{nft.attributes.length - 4} {t('more')} {t('properties').toLowerCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <a
                  href={`https://thirdweb.com/spicy-chain/0xE7350d20845FDaa6Ec54a60bad677e27c22bc8B3/nfts/${nft.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('view_on_thirdweb')}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChilizNFTList;
