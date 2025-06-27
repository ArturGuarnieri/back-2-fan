
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Wallet, ShoppingBag, TrendingUp, Gift, LayoutDashboard, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useTranslation, Trans } from 'react-i18next';
import { useAccount } from 'wagmi';
import PublicHeader from '@/components/PublicHeader';
import WalletConnector from '@/components/WalletConnector';
import { usePartners } from '@/hooks/usePartners';
import { useFanTokens } from '@/hooks/useFanTokens';
import { useTokenPrices } from '@/hooks/useTokenPrices';

type FanToken = {
  id: string;
  name: string;
  symbol: string;
  category: string;
  logo: string | null;
  coingecko_id: string | null;
};

const Index = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [country, setCountry] = useState(() => localStorage.getItem('selectedCountry') || 'BR');
  
  useEffect(() => {
    const handleCountryChange = () => {
      setCountry(localStorage.getItem('selectedCountry') || 'BR');
    };
    window.addEventListener('countryChanged', handleCountryChange);
    // Initial sync
    handleCountryChange();
    return () => window.removeEventListener('countryChanged', handleCountryChange);
  }, []);

  // Safe access to staking data - only use when wallet is connected
  let defaultCurrency = "usd";
  try {
    if (isConnected) {
      // Only import and use useStaking when wallet is connected
      const { useStaking } = require('@/hooks/useStaking');
      const stakingData = useStaking();
      defaultCurrency = stakingData.defaultCurrency || "usd";
    }
  } catch (error) {
    console.log('Staking data not available on public page');
    defaultCurrency = "usd";
  }

  const { data: partnersList = [] } = usePartners();
  const { data: tokens = [] } = useFanTokens();
  const { data: prices = {} } = useTokenPrices();

  const featuredPartners = partnersList
    .filter((p: any) => (p.country || []).includes(country))
    .slice(0, 3);
    
  const featuredTokens = tokens.slice(0, 3);

  const currencySymbols: Record<string, string> = { usd: "$", eur: "€", brl: "R$", gbp: "£", jpy: "¥", cad: "C$", aud: "A$", chf: "Fr", inr: "₹", cny: "¥", ars: "$", mxn: "$", rub: "₽", krw: "₩" };
  const cur = defaultCurrency || "usd";
  const currencySymbol = currencySymbols[cur] || cur.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <PublicHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Hero Section */}
          <div className="text-center py-8 md:py-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight px-4">
              {t('hero_title')}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-2 max-w-3xl mx-auto px-4">
              {t('hero_subtitle')}
            </p>
            <p className="text-lg sm:text-xl font-semibold text-red-600 mb-8 px-4">
              {t('hero_simple_message')}
            </p>
            <div className="mt-6 text-center px-4">
              {isConnected ? (
                <Button variant="default" size="lg" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  {t('go_to_dashboard')}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                  <div className="flex justify-center w-full sm:w-auto">
                    <WalletConnector />
                  </div>
                  <p className="text-sm text-gray-500 text-center">{t('connect_wallet_to_start')}</p>
                </div>
              )}
            </div>
          </div>

          {/* How it works */}
          <section className="py-8 md:py-16">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12 px-4">{t('how_it_works_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="flex flex-col items-center px-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <Wallet className="w-8 h-8 text-red-600"/>
                      </div>
                      <h4 className="text-lg md:text-xl font-semibold mb-2">{t('step1_title')}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{t('step1_desc')}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8 text-red-600"/>
                      </div>
                      <h4 className="text-lg md:text-xl font-semibold mb-2">{t('step2_title')}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{t('step2_desc')}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <TrendingUp className="w-8 h-8 text-red-600"/>
                      </div>
                      <h4 className="text-lg md:text-xl font-semibold mb-2">{t('step3_title')}</h4>
                      <p className="text-gray-600 text-sm md:text-base">{t('step3_desc')}</p>
                  </div>
              </div>
          </section>

          {/* Featured Partners */}
          <section className="py-8 md:py-16 bg-white rounded-xl shadow-sm border border-red-100 mx-2 sm:mx-0">
            <div className="px-4 sm:px-6">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">{t('featured_partners_title')}</h3>
              <p className="text-center text-gray-600 mb-8 md:mb-12 text-sm md:text-base">{t('featured_partners_subtitle')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {featuredPartners.map((partner: any) => (
                      <Card key={partner.id} className="flex flex-col items-center justify-center p-4 md:p-6 hover:shadow-lg transition-shadow">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4">
                              {partner.logo}
                          </div>
                          <CardTitle className="text-lg md:text-xl text-center">{partner.name}</CardTitle>
                          <CardDescription className="text-center text-sm md:text-base">{t('partner_cashback_up_to', { rate: partner.base_rate + 3 })}</CardDescription>
                      </Card>
                  ))}
              </div>
              <div className="text-center mt-8 md:mt-12">
                  <Button variant="outline" onClick={() => navigate('/public/partners')} className="w-full sm:w-auto">
                      {t('view_all_partners')}
                  </Button>
              </div>
            </div>
          </section>

          {/* Featured Fan Tokens */}
          <section className="py-8 md:py-16">
            <div className="text-center px-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t('featured_tokens_title')}</h3>
              <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
                {t('featured_tokens_subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
              {featuredTokens.map((token: FanToken) => {
                const priceObj = prices[token.symbol];
                const price = priceObj?.[cur];
                let priceDisplay;
                if (typeof price === "number" && !isNaN(price)) {
                  priceDisplay = `${currencySymbol}${price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}`;
                } else {
                  priceDisplay = t('not_available');
                }
                const canView = !!token.coingecko_id && token.coingecko_id.trim() !== "";

                return (
                  <Card key={token.id} className="hover:shadow-lg transition-shadow duration-200 border-gray-200 flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-lg md:text-2xl">
                          {token.logo}
                        </div>
                        <div>
                          <CardTitle className="text-base md:text-lg">{token.symbol}</CardTitle>
                          <CardDescription className="text-xs md:text-sm">{token.name}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 flex flex-col flex-grow justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">{t('price')}</p>
                        <p className="text-base md:text-lg font-semibold">{priceDisplay}</p>
                      </div>
                      <Button
                        onClick={() => canView && window.open(`https://www.coingecko.com/pt/moedas/${token.coingecko_id}`, "_blank", "noopener")}
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm"
                        disabled={!canView}
                        variant="default"
                      >
                        {t('view_fan_token')}
                        <ExternalLink className="inline w-3 h-3 md:w-4 md:h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="text-center mt-8 md:mt-12 px-4">
              <Button variant="outline" onClick={() => navigate('/public/tokens')} className="w-full sm:w-auto">
                {t('view_all_tokens')}
              </Button>
            </div>
          </section>

          {/* Staking Tiers */}
          <section className="py-8 md:py-16">
            <div className="text-center px-4">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{t('staking_boost_title')}</h3>
                <div className="text-base md:text-lg text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto">
                    <Trans 
                      i18nKey="staking_boost_subtitle"
                      components={{
                        span: <span className="font-semibold" />
                      }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
                <CardHeader className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <CardTitle className="text-amber-800 text-lg md:text-xl">{t('tier_bronze')}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{t('tier_stake_100')}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-amber-800">{t('bonus_cashback', { bonus: 1 })}</p>
                  <p className="text-xs md:text-sm text-amber-600">{t('on_all_cashback')}</p>
                </CardContent>
              </Card>

              <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-700 text-lg md:text-xl">{t('tier_silver')}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{t('tier_stake_500')}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-gray-700">{t('bonus_cashback', { bonus: 2 })}</p>
                  <p className="text-xs md:text-sm text-gray-600">{t('on_all_cashback')}</p>
                </CardContent>
              </Card>

              <Card className="border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardHeader className="text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <CardTitle className="text-yellow-800 text-lg md:text-xl">{t('tier_gold')}</CardTitle>
                  <CardDescription className="text-sm md:text-base">{t('tier_stake_1000')}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xl md:text-2xl font-bold text-yellow-800">{t('bonus_cashback', { bonus: 3 })}</p>
                  <p className="text-xs md:text-sm text-yellow-600">{t('on_all_cashback')}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-8 md:py-16">
              <div className="max-w-3xl mx-auto px-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8 md:mb-12">{t('faq_title')}</h3>
                  <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                          <AccordionTrigger className="text-left">{t('faq1_q')}</AccordionTrigger>
                          <AccordionContent>
                              {t('faq1_a')}
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                          <AccordionTrigger className="text-left">{t('faq2_q')}</AccordionTrigger>
                          <AccordionContent>
                              {t('faq2_a')}
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                          <AccordionTrigger className="text-left">{t('faq3_q')}</AccordionTrigger>
                          <AccordionContent>
                              {t('faq3_a')}
                          </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                          <AccordionTrigger className="text-left">{t('faq4_q')}</AccordionTrigger>
                          <AccordionContent>
                              {t('faq4_a')}
                          </AccordionContent>
                      </AccordionItem>
                  </Accordion>
              </div>
          </section>
      </main>
    </div>
  );
};

export default Index;
