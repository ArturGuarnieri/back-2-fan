
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useFanTokens } from '@/hooks/useFanTokens'

const STAKING_CONTRACT = '0x5ff7f9724fD477D9A07dCdB894d0cA7F8fAE1501'
const CHILIZ_SCAN_API = 'https://scan.chiliz.com/api'

type StakingInfo = {
  staked: number;
  rewards: number;
}

type TokenTransaction = {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

type ChilizScanResponse = {
  status: string;
  message: string;
  result: TokenTransaction[];
}

// Função para buscar transações de tokens
async function fetchTokenTransactions(walletAddress: string, contractAddress: string): Promise<TokenTransaction[]> {
  const url = `${CHILIZ_SCAN_API}?module=account&action=tokentx&address=${walletAddress}&contractaddress=${contractAddress}&sort=desc`
  
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  const data: ChilizScanResponse = await response.json()
  
  if (data.status !== '1') {
    console.log(`[ChilizScan] No transactions found for ${contractAddress}:`, data.message)
    return []
  }
  
  return data.result || []
}

// Função para calcular saldo de staking baseado nos eventos
function calculateStakeFromEvents(transactions: TokenTransaction[], walletAddress: string, stakingContract: string): number {
  let deposits = 0
  let withdrawals = 0
  
  transactions.forEach(tx => {
    const value = Number(tx.value) / Math.pow(10, Number(tx.tokenDecimal))
    
    // Depósito: transferência da carteira para o contrato de staking
    if (tx.from.toLowerCase() === walletAddress.toLowerCase() && 
        tx.to.toLowerCase() === stakingContract.toLowerCase()) {
      deposits += value
    }
    
    // Saque: transferência do contrato de staking para a carteira
    if (tx.from.toLowerCase() === stakingContract.toLowerCase() && 
        tx.to.toLowerCase() === walletAddress.toLowerCase()) {
      withdrawals += value
    }
  })
  
  return Math.max(0, deposits - withdrawals)
}

/**
 * Consulta o saldo REAL de staking do usuário usando eventos de Transfer da ChilizScan API.
 * Calcula depósitos - saques para cada Fan Token.
 * Retorna { [symbol]: { staked, rewards } } apenas para tokens com saldo > 0.
 */
export function useSociosStaking() {
  const { address, isConnected } = useAccount()
  const { data: tokens = [] } = useFanTokens()

  return useQuery({
    queryKey: ['socios_staking_events', address, tokens.map(t => t.chiliz_contract).join(',')],
    enabled: !!address && isConnected && tokens.length > 0,
    refetchInterval: 60_000,

    queryFn: async (): Promise<Record<string, StakingInfo>> => {
      console.log('[useSociosStaking] Iniciando consulta via ChilizScan Events para:', address)
      console.log('[useSociosStaking] Tokens disponíveis:', tokens.length)
      
      const validTokens = tokens.filter(t => !!t.chiliz_contract)
      console.log('[useSociosStaking] Tokens válidos com contrato:', validTokens.length)

      if (!validTokens.length) {
        console.log('[useSociosStaking] Nenhum token válido encontrado')
        return {}
      }

      const stakingInfo: Record<string, StakingInfo> = {}
      
      // Processa tokens sequencialmente para evitar rate limiting
      for (const token of validTokens) {
        try {
          console.log(`[useSociosStaking] Consultando eventos para ${token.symbol}...`)
          
          const transactions = await fetchTokenTransactions(
            address as string,
            token.chiliz_contract as string
          )
          
          const stakedAmount = calculateStakeFromEvents(
            transactions,
            address as string,
            STAKING_CONTRACT
          )
          
          console.log(`[useSociosStaking] ${token.symbol} - Transações: ${transactions.length}, Staked: ${stakedAmount}`)
          
          if (stakedAmount > 0) {
            stakingInfo[token.symbol] = {
              staked: stakedAmount,
              rewards: 0 // Placeholder - seria necessário outra consulta específica
            }
          }
          
          // Pequeno delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`[useSociosStaking] Erro ao consultar ${token.symbol}:`, error)
          // Continue com os próximos tokens mesmo se um falhar
        }
      }

      console.log('[useSociosStaking] Resultado final:', stakingInfo)
      return stakingInfo
    },
  })
}
