
import { supabase } from "@/integrations/supabase/client";

type TokenSeed = {
  name: string;
  symbol: string;
  logo: string; // Emoji ou placeholder
  category: string;
  description?: string;
  chiliz_contract?: string;
};

const seeds: TokenSeed[] = [
  {
    name: "Santos FC",
    symbol: "SANTOS",
    logo: "⚽️",
    category: "Football",
    description: "Fan Token oficial do Santos Futebol Clube",
    chiliz_contract: "0xd3684fF6cE30A39523f7FD2873817e0478384b61"
  },
  {
    name: "Paris Saint-Germain",
    symbol: "PSG",
    logo: "🇫🇷",
    category: "Football",
    description: "Fan Token oficial do Paris Saint-Germain",
    chiliz_contract: "0xBC7B8Ce8594989e6b7ddd435e4cfa46e48815a03"
  },
  {
    name: "AS Roma",
    symbol: "ASR",
    logo: "🦁",
    category: "Football",
    description: "Fan Token oficial da AS Roma",
    chiliz_contract: "0x1A1fB575F0111104d8d7E66eFb43c52b5265e514"
  },
  {
    name: "FC Barcelona",
    symbol: "BAR",
    logo: "🔵🔴",
    category: "Football",
    description: "Fan Token oficial do FC Barcelona",
    chiliz_contract: "0x68037790A0229e9Ce6EaA8A99ea92964106C4703"
  },
  {
    name: "Juventus",
    symbol: "JUV",
    logo: "⚪️⚫️",
    category: "Football",
    description: "Fan Token oficial da Juventus FC",
    chiliz_contract: "0x5180DB8F5c931AAe63c74266b211F580155ecac8"
  },
  {
    name: "AC Milan",
    symbol: "ACM",
    logo: "🔴⚫️",
    category: "Football",
    description: "Fan Token oficial do AC Milan",
    chiliz_contract: "0x2859aFc32d7f1cD0c77044A905dfEd64b9eEAd23"
  },
  {
    name: "Manchester City",
    symbol: "CITY",
    logo: "🔵",
    category: "Football",
    description: "Fan Token oficial do Manchester City FC",
    chiliz_contract: "0x2f54b1254DCf81597E2a417c539563d400eD311F"
  },
  {
    name: "Galatasaray",
    symbol: "GAL",
    logo: "🦁",
    category: "Football",
    description: "Fan Token do Galatasaray S.K.",
    chiliz_contract: "0xe6d118cB7b932c5b879aB1632C6E9eCe8b635320"
  },
  {
    name: "UFC",
    symbol: "UFC",
    logo: "🥊",
    category: "Sports",
    description: "Fan Token oficial da UFC",
    chiliz_contract: "0x82e3A8F066a6989666DEb8C4adfcfc6A947F1356"
  },
  {
    name: "Atlético de Madrid",
    symbol: "ATM",
    logo: "🔴⚪️",
    category: "Football",
    description: "Fan Token oficial do Atlético de Madrid",
    chiliz_contract: "0x93bFf8b4A6f7eC19C21c36aC6A8BEbA856854871"
  },
  {
    name: "S.S. Lazio",
    symbol: "LAZIO",
    logo: "🦅",
    category: "Football",
    description: "Fan Token oficial da S.S. Lazio",
    chiliz_contract: "0x23a6eAf5e635cF1bFa2d0B01b94239Cf9bA49448"
  },
  {
    name: "FC Porto",
    symbol: "PORTO",
    logo: "🔵⚪️",
    category: "Football",
    description: "Fan Token oficial do FC Porto",
    chiliz_contract: "0x282d8efCE846A88B159800bd4130ad77443Fa1A1"
  },
  {
    name: "AS Monaco",
    symbol: "ASM",
    logo: "🔴⚪",
    category: "Football",
    description: "Fan Token oficial do AS Monaco",
    chiliz_contract: "0x2c25eF937eA1ec4b8B9e5C1a40DE8531bc30981a"
  },
  {
    name: "Fenerbahçe",
    symbol: "FB",
    logo: "💛💙",
    category: "Football",
    description: "Fan Token do Fenerbahçe S.K.",
    chiliz_contract: "0x5C4B2d05e8D1380C83d8b6719d6d481603C42E2E"
  },
  {
    name: "Arsenal",
    symbol: "AFC",
    logo: "🔴⚪",
    category: "Football",
    description: "Fan Token oficial do Arsenal FC",
    chiliz_contract: "0x2eB27aD2cC9BcF387F5374ae95AAb10cb205F1B9"
  },
  {
    name: "Sevilla FC",
    symbol: "SEVILLA",
    logo: "🔴⚪",
    category: "Football",
    description: "Fan Token oficial do Sevilla FC",
    chiliz_contract: "0x7e681A47989f92dFaC6D8970800F93Dd46bE3f7D"
  },
  {
    name: "Inter de Milão",
    symbol: "INTER",
    logo: "🔵⚫️",
    category: "Football",
    description: "Fan Token oficial da Inter de Milão",
    chiliz_contract: "0x6E3f0E61e2F3d8a5C338dE5eA685667c5A7f0d27"
  },
  {
    name: "OG Esports",
    symbol: "OG",
    logo: "🎮",
    category: "eSports",
    description: "Fan Token oficial da OG Esports",
    chiliz_contract: "0x5190DFE5e6B46F62a92aE1E755A1208aA07B8C9b"
  },
  {
    name: "Team Heretics",
    symbol: "TH",
    logo: "🧙",
    category: "eSports",
    description: "Fan Token oficial da Team Heretics",
    chiliz_contract: "0xBa9FAe8F5490eCb13B7fD807D7F06Ab7b6bC5ac4"
  },
  // ...adicione outros tokens da lista fornecida conforme desejado...
];

async function runSeed() {
  for (const token of seeds) {
    const { data, error } = await supabase.from("fan_tokens").insert([token]);
    if (error) {
      console.error(`Erro ao inserir ${token.symbol}:`, error.message);
    } else {
      console.log(`Inserido ${token.symbol}`);
    }
  }
}

// Descomente para rodar como script
// runSeed();

export default runSeed;

