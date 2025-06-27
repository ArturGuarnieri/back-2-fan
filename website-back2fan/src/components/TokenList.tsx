
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, TrendingUp, TrendingDown, Minus, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFanTokens } from "@/hooks/useFanTokens";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useStaking } from "@/hooks/useStaking";

const TokenList = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: tokens = [], isLoading, error } = useFanTokens();
  const { data: prices = {}, isLoading: priceLoading, error: priceError } = useTokenPrices();
  const { defaultCurrency } = useStaking();

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCoingecko = (coingeckoId: string | null) => {
    if (coingeckoId && coingeckoId.trim() !== "") {
      const url = `https://www.coingecko.com/pt/moedas/${coingeckoId}`;
      window.open(url, "_blank", "noopener");
    }
  };

  const currencySymbols: Record<string, string> = {
    usd: "$", eur: "€", brl: "R$", gbp: "£", jpy: "¥", cad: "C$", aud: "A$", chf: "Fr", inr: "₹",
    cny: "¥", ars: "$", mxn: "$", rub: "₽", krw: "₩"
  };
  const cur = defaultCurrency || "usd";
  const currencySymbol = currencySymbols[cur] || cur.toUpperCase();

  if (isLoading) {
    return (
      <div className="py-24 text-center text-lg text-gray-700">Carregando Fan Tokens...</div>
    );
  }
  if (error) {
    return (
      <div className="py-24 text-center text-red-500">Erro ao carregar tokens.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('fan_tokens_page_title')}</h2>
          <p className="text-gray-600">{t('fan_tokens_page_subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t('search_tokens')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {priceError && priceError.message === 'API_ERROR' && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Erro na API do CoinGecko. Os preços podem não estar atualizados no momento.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTokens.map((token) => {
          const priceObj = prices[token.symbol];
          // Proteção contra priceObj undefined
          const price = priceObj?.[cur];
          const change24h = priceObj?.[`${cur}_24h_change`];
          const marketCap = priceObj?.[`${cur}_market_cap`];
          const volume = priceObj?.[`${cur}_24h_vol`];

          let priceDisplay;
          if (priceLoading) {
            priceDisplay = "...";
          } else if (typeof price === "number" && !isNaN(price)) {
            priceDisplay = `${currencySymbol}${price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}`;
          } else {
            priceDisplay = "N/A";
          }

          let change24hDisplay: React.ReactNode = <span className="font-medium text-gray-600">-</span>;
          let changeIcon = <Minus className="w-4 h-4 text-gray-500" />;

          if (!priceLoading && typeof change24h === "number" && !isNaN(change24h)) {
            const isPositive = change24h > 0;
            changeIcon = isPositive
              ? <TrendingUp className="w-4 h-4 text-green-600" />
              : <TrendingDown className="w-4 h-4 text-red-600" />;
            change24hDisplay = (
              <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {change24h.toFixed(2)}%
              </span>
            );
          }

          let marketCapDisplay;
          if (!priceLoading && typeof marketCap === "number" && !isNaN(marketCap)) {
            marketCapDisplay = `${currencySymbol}${marketCap.toLocaleString("en-US", { notation: "compact" })}`;
          } else {
            marketCapDisplay = "-";
          }

          let volumeDisplay;
          if (!priceLoading && typeof volume === "number" && !isNaN(volume)) {
            volumeDisplay = `${currencySymbol}${volume.toLocaleString("en-US", { notation: "compact" })}`;
          } else {
            volumeDisplay = "-";
          }

          const canView = !!token.coingecko_id && token.coingecko_id.trim() !== "";

          return (
            <Card key={token.id} className="hover:shadow-lg transition-shadow duration-200 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-2xl">
                      {token.logo}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{token.symbol}</CardTitle>
                      <CardDescription className="text-sm">{token.name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {token.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('price')}</p>
                    <p className="text-lg font-semibold">
                      {priceDisplay}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('change_24h')}</p>
                    <div className="flex items-center space-x-1">
                      {changeIcon}
                      {change24hDisplay}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">{t('market_cap')}</p>
                    <p className="font-medium">{marketCapDisplay}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('volume_24h')}</p>
                    <p className="font-medium">{volumeDisplay}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => canView && handleViewCoingecko(token.coingecko_id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center gap-2"
                    disabled={!canView}
                    variant="default"
                  >
                    {t('view_fan_token')}
                    <ExternalLink className="inline w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTokens.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_tokens_found')}</h3>
          <p className="text-gray-500">{t('try_different_search')}</p>
        </div>
      )}
    </div>
  );
};

export default TokenList;

// OBS: se chegar a 203+ linhas, considere refatorar em TokenCard.tsx!
