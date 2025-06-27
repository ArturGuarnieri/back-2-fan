import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertCircle, Plus, Minus, Wallet, UserCircle, Coins, ArrowUpDown, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useStaking } from '@/hooks/useStaking';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useFanTokens } from '@/hooks/useFanTokens';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAccount } from "wagmi";
import { useSociosStaking } from '@/hooks/useSociosStaking';

const StakeForm = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedStakeToken, setSelectedStakeToken] = useState('');
  const [selectedUnstakeToken, setSelectedUnstakeToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAllTokens, setShowAllTokens] = useState(false);
  const { totalStaked, stakingLevel, cashbackBonus, reloadUser } = useStaking();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { address } = useAccount();

  // Get wallet balances and fan tokens
  const { data: walletData, isLoading: isBalLoading } = useWalletBalances();
  const { data: fanTokens = [], isLoading: isTokLoading } = useFanTokens();
  const { data: sociosStaking = {}, isLoading: isSociosLoading } = useSociosStaking();

  // Check if all data is loaded for proper sorting
  const isDataLoading = isBalLoading || isTokLoading || isSociosLoading;

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0 || !selectedStakeToken) {
      toast({
        title: t("invalid_value_title"),
        description: t("invalid_stake_value_desc"),
        variant: "destructive",
      });
      return;
    }

    const tokenBalance = walletData?.tokens?.[selectedStakeToken] || 0;
    if (parseFloat(stakeAmount) > tokenBalance) {
      toast({
        title: t("insufficient_balance"),
        description: t("insufficient_token_balance"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate staking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: t("stake_success_title"),
        description: t("stake_success_desc", { amount: stakeAmount, token: selectedStakeToken }),
        variant: "default",
      });
      setStakeAmount('');
      setSelectedStakeToken('');
      reloadUser();
    } catch (error) {
      toast({
        title: t("stake_error_title"),
        description: t("stake_error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0 || !selectedUnstakeToken) {
      toast({
        title: t("invalid_value_title"),
        description: t("invalid_unstake_value_desc"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate unstaking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: t("unstake_success_title"),
        description: t("unstake_success_desc", { amount: unstakeAmount, token: selectedUnstakeToken }),
        variant: "default",
      });
      setUnstakeAmount('');
      setSelectedUnstakeToken('');
      reloadUser();
    } catch (error) {
      toast({
        title: t("unstake_error_title"),
        description: t("unstake_error_desc"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNextLevel = () => {
    if (totalStaked < 100) return { name: 'Bronze', threshold: 100 };
    if (totalStaked < 500) return { name: 'Silver', threshold: 500 };
    if (totalStaked < 1000) return { name: 'Gold', threshold: 1000 };
    return null;
  };
  const nextLevel = getNextLevel();

  const stakingColors = {
    Bronze: "bg-red-100 text-red-800 border-red-200",
    Silver: "bg-gray-100 text-gray-700 border-gray-200",
    Gold: "bg-red-200 text-red-900 border-red-300"
  };

  const chzBalance = walletData?.native ?? 0;
  const availableTokens = fanTokens.filter(token => 
    walletData?.tokens?.[token.symbol] && walletData.tokens[token.symbol] > 0
  );

  // Sort tokens: first with balance/staking, then by staked amount, then alphabetically
  const sortedTokens = fanTokens.sort((a, b) => {
    const aHasBalance = (walletData?.tokens?.[a.symbol] || 0) > 0;
    const bHasBalance = (walletData?.tokens?.[b.symbol] || 0) > 0;
    const aStakedAmount = sociosStaking[a.symbol]?.staked || 0;
    const bStakedAmount = sociosStaking[b.symbol]?.staked || 0;
    
    const aHasAny = aHasBalance || aStakedAmount > 0;
    const bHasAny = bHasBalance || bStakedAmount > 0;
    
    // First priority: tokens with balance or staking
    if (aHasAny && !bHasAny) return -1;
    if (!aHasAny && bHasAny) return 1;
    
    // Second priority: if both have balance/staking, sort by staked amount (descending)
    if (aHasAny && bHasAny) {
      if (aStakedAmount !== bStakedAmount) {
        return bStakedAmount - aStakedAmount;
      }
    }
    
    // Third priority: alphabetical order
    return a.name.localeCompare(b.name);
  });

  const displayedTokens = showAllTokens ? sortedTokens : sortedTokens.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-fade-in">
      {/* Header with Wallet Info + CHZ Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Wallet Info */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
              <UserCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{t("wallet_address_label")}</h3>
              <div className="font-mono text-base text-gray-600 break-all">
                {address ? (
                  <>
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </>
                ) : t('not_connected')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHZ Balance */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <Coins className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{t("balance")} CHZ</h3>
                <p className="text-sm text-gray-500">Chiliz Native Token</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <span className="text-2xl font-bold text-gray-800">
                {isBalLoading
                  ? <span className="animate-pulse text-gray-400">...</span>
                  : chzBalance.toLocaleString('en-US', { maximumFractionDigits: 6 })}
              </span>
              <span className="ml-2 text-lg font-semibold text-gray-700">CHZ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Staking Interface + Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Staking Interface */}
        <div className="xl:col-span-2">
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="bg-red-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ArrowUpDown className="w-6 h-6" />
                {t("stake_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Stake Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{t("stake_amount")}</h3>
                  </div>
                  <form onSubmit={handleStake} className="space-y-4">
                    <Select value={selectedStakeToken} onValueChange={setSelectedStakeToken}>
                      <SelectTrigger className="text-lg py-3 px-4 border-2 border-gray-200 focus:border-red-500 rounded-xl">
                        <SelectValue placeholder={t("select_token_to_stake")} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens.map(token => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{token.logo}</span>
                              <span>{token.symbol}</span>
                              <span className="text-sm text-gray-500">
                                ({walletData?.tokens?.[token.symbol]?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || '0'})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        step="0.000001"
                        value={stakeAmount}
                        onChange={e => setStakeAmount(e.target.value)}
                        placeholder={t("stake_amount_placeholder")}
                        className="text-lg py-3 px-4 border-2 border-gray-200 focus:border-red-500 rounded-xl transition-all"
                        disabled={!selectedStakeToken}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {selectedStakeToken || 'TOKEN'}
                      </div>
                    </div>
                    {selectedStakeToken && (
                      <p className="text-sm text-gray-600">
                        {t("available_balance")}: {walletData?.tokens?.[selectedStakeToken]?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || '0'} {selectedStakeToken}
                      </p>
                    )}
                    <Button 
                      type="submit" 
                      disabled={isLoading || !stakeAmount || !selectedStakeToken} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          {t("processing")}
                        </span>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          {t("stake_btn")}
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Unstake Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Minus className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-800">{t("unstake_amount")}</h3>
                  </div>
                  <form onSubmit={handleUnstake} className="space-y-4">
                    <Select value={selectedUnstakeToken} onValueChange={setSelectedUnstakeToken}>
                      <SelectTrigger className="text-lg py-3 px-4 border-2 border-gray-200 focus:border-red-500 rounded-xl">
                        <SelectValue placeholder={t("select_token_to_unstake")} />
                      </SelectTrigger>
                      <SelectContent>
                        {fanTokens.map(token => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{token.logo}</span>
                              <span>{token.symbol}</span>
                              <span className="text-sm text-gray-500">
                                ({t("staked")}: 0) {/* Placeholder - will be replaced with real staking data */}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        step="0.000001"
                        value={unstakeAmount}
                        onChange={e => setUnstakeAmount(e.target.value)}
                        placeholder={t("unstake_amount_placeholder")}
                        className="text-lg py-3 px-4 border-2 border-gray-200 focus:border-red-500 rounded-xl transition-all"
                        disabled={!selectedUnstakeToken}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        {selectedUnstakeToken || 'TOKEN'}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !unstakeAmount || !selectedUnstakeToken}
                      variant="destructive"
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          {t("processing")}
                        </span>
                      ) : (
                        <>
                          <Minus className="w-5 h-5 mr-2" />
                          {t("unstake_btn")}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Cards */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-800">{t("current_status")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white bg-opacity-70 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t("total_staked")}:</span>
                  <span className="font-bold text-lg text-gray-800">{totalStaked?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t("current_level")}:</span>
                  <Badge className={stakingColors[stakingLevel as keyof typeof stakingColors] || "bg-gray-100 text-gray-500"}>
                    {stakingLevel ? t(`tier_${stakingLevel.toLowerCase()}`) : t("none")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t("cashback")}:</span>
                  <span className="font-bold text-lg text-red-600">{5 + (cashbackBonus || 0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Level */}
          {nextLevel && (
            <Card className="border-gray-200 bg-gray-50 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2 text-gray-800">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t("next_level")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Badge className={stakingColors[nextLevel.name as keyof typeof stakingColors]}>
                    {t(`tier_${nextLevel.name.toLowerCase()}`)}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {t("missing_to_level", { 
                      missing: (nextLevel.threshold - (totalStaked || 0)).toLocaleString(), 
                      level: t(`tier_${nextLevel.name.toLowerCase()}`) 
                    })}
                  </p>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-red-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(((totalStaked || 0) / nextLevel.threshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.round(((totalStaked || 0) / nextLevel.threshold) * 100)}% {t("complete")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning */}
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-2">{t("important_label")}:</p>
                  <p className="leading-relaxed">{t("unstake_warning")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fan Tokens Section with Staking Info */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t("my_tokens")}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isDataLoading ? (
            <>
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="bg-white border border-gray-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : fanTokens.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t("no_tokens_found")}</p>
            </div>
          ) : (
            <>
              {displayedTokens.map(token => {
                const stakedInfo = sociosStaking[token.symbol] || { staked: 0, rewards: 0 };
                return (
                  <Card key={token.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl border border-gray-200">
                          {token.logo}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-base leading-tight">{token.name}</h3>
                          <p className="text-xs text-gray-500 font-medium">{token.symbol}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">{t("wallet_balance")}</p>
                        <p className="font-mono text-lg font-bold text-gray-800">
                          {walletData?.tokens?.[token.symbol]?.toLocaleString("en-US", { maximumFractionDigits: 4 }) || "0"}
                        </p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="w-3 h-3 text-red-600" />
                          <p className="text-xs text-red-600 font-medium">{t("staked")} Socios.com</p>
                        </div>
                        <p className="font-mono text-lg font-bold text-red-800">
                          {stakedInfo.staked.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {sortedTokens.length > 4 && (
                <div className="col-span-full flex justify-center mt-6">
                  <Button
                    onClick={() => setShowAllTokens(!showAllTokens)}
                    variant="outline"
                    className="flex items-center gap-2 px-6 py-3 text-lg border-gray-300 hover:bg-gray-50"
                  >
                    {showAllTokens ? (
                      <>
                        <ChevronUp className="w-5 h-5" />
                        {t("see_less")}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5" />
                        {t("see_more")}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StakeForm;
