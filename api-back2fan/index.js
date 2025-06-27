import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import { sepolia } from "thirdweb/chains";
import { nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { prepareContractCall, sendTransaction } from "thirdweb";
// Removed ThirdwebStorage import - not using IPFS anymore
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Trust proxy for rate limiting in production
app.set("trust proxy", 1);

// MiddlewareMint parameters: {
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

// AWIN Configuration
const AWIN_CONFIG = {
  publisherId: process.env.AWIN_PUBLISHER_ID,
  apiToken: process.env.AWIN_API_TOKEN,
  baseUrl: "https://www.awin1.com",
};

// Rakuten Configuration
const RAKUTEN_CONFIG = {
  publisherId: process.env.RAKUTEN_PUBLISHER_ID,
  apiKey: process.env.RAKUTEN_API_KEY,
  baseUrl: "https://api.rakuten.com",
};

// Thirdweb Configuration for Spicy Testnet (Chiliz Chain)
const SPICY_TESTNET = defineChain({
  id: 88882,
  name: "Spicy Testnet",
  nativeCurrency: {
    name: "CHZ",
    symbol: "CHZ",
    decimals: 18,
  },
  rpc: "https://spicy-rpc.chiliz.com",
  blockExplorers: [
    {
      name: "Chiliz Explorer",
      url: "https://spicy-explorer.chiliz.com",
    },
  ],
});

// Initialize Thirdweb client with private key as signer
const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID,
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

// Removed storage initialization - not using IPFS anymore

const NFT_CONTRACT_ADDRESS = "0xE7350d20845FDaa6Ec54a60bad677e27c22bc8B3";

// Initialize contract and wallet after SDK initialization
let nftContract;
let account;

// Initialize the SDK connection
async function initializeThirdweb() {
  try {
    // Create account from private key - this will be our signer
    account = privateKeyToAccount({
      client,
      privateKey: process.env.THIRDWEB_PRIVATE_KEY,
    });

    console.log("✅ Account created:", account.address);
    console.log("✅ Signer configured:", account.address);

    // Get NFT Contract instance - this will use the account as signer
    nftContract = getContract({
      client,
      chain: SPICY_TESTNET,
      address: NFT_CONTRACT_ADDRESS,
    });

    console.log("✅ Thirdweb SDK initialized successfully");
    console.log("✅ Contract address:", NFT_CONTRACT_ADDRESS);
    console.log("✅ All transactions will be signed by:", account.address);
  } catch (error) {
    console.error("❌ Error initializing Thirdweb SDK:", error);
  }
}

// Call initialization
await initializeThirdweb();

// Helper function to generate AWIN tracking link
function generateAwinLink(originalUrl, userId, partnerId, tokenId = null) {
  const clickRef = tokenId 
    ? `user_${userId}_${Date.now()}_token_${tokenId}`
    : `user_${userId}_${Date.now()}`;
  return `${AWIN_CONFIG.baseUrl}/cread.php?awinmid=${partnerId}&awinaffid=${AWIN_CONFIG.publisherId}&clickref=${clickRef}&p=${encodeURIComponent(originalUrl)}`;
}

// Helper function to generate Rakuten tracking link
function generateRakutenLink(originalUrl, userId, partnerId, tokenId = null) {
  const clickRef = tokenId 
    ? `user_${userId}_${Date.now()}_token_${tokenId}`
    : `user_${userId}_${Date.now()}`;
  return `https://click.linksynergy.com/deeplink?id=${RAKUTEN_CONFIG.publisherId}&mid=${partnerId}&murl=${encodeURIComponent(originalUrl)}&u1=${clickRef}`;
}

// Helper function to log postback
async function logPostback(
  network,
  payload,
  processed = false,
  errorMessage = null,
  transactionId = null,
) {
  try {
    await supabase.from("postback_logs").insert({
      affiliate_network: network,
      raw_payload: payload,
      processed,
      error_message: errorMessage,
      transaction_id: transactionId,
    });
  } catch (error) {
    console.error("Error logging postback:", error);
  }
}

// Helper function to grant MINTER_ROLE to an account
async function grantMinterRole(targetAddress) {
  try {
    console.log(`[NFT] Granting MINTER_ROLE to address: ${targetAddress}`);

    const contract = getContract({
      address: NFT_CONTRACT_ADDRESS,
      client,
      chain: SPICY_TESTNET,
    });

    // MINTER_ROLE hash (keccak256("MINTER_ROLE"))
    const MINTER_ROLE =
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

    const grantRoleTx = await prepareContractCall({
      contract,
      method: "function grantRole(bytes32 role, address account)",
      params: [MINTER_ROLE, targetAddress],
    });
    console.log("Enviando com account:", account);
    const { transactionHash } = await sendTransaction({
      account,
      transaction: grantRoleTx,
    });

    console.log(
      `[NFT] MINTER_ROLE granted successfully. TxHash: ${transactionHash}`,
    );
    return { success: true, transactionHash };
  } catch (error) {
    console.error("[NFT] Error granting MINTER_ROLE:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to mint NFT for user
async function mintCashbackNFT(userWalletAddress, transactionData) {
  try {
    console.log(`[NFT] Attempting to mint NFT for user: ${userWalletAddress}`);

    // Validate user wallet address
    if (
      !userWalletAddress ||
      userWalletAddress.length !== 42 ||
      !userWalletAddress.startsWith("0x")
    ) {
      console.error("[NFT] Invalid user wallet address:", userWalletAddress);
      return {
        success: false,
        error: "Invalid user wallet address",
      };
    }

    // Check if account is initialized
    if (!account) {
      console.error("[NFT] Account not initialized");
      return {
        success: false,
        error: "Account not initialized",
      };
    }

    console.log(`[NFT] Using signer account: ${account.address}`);

    // Verificar se o signer tem o MINTER_ROLE
    try {
      const { readContract } = await import("thirdweb");
      const MINTER_ROLE =
        "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

      const hasMinterRole = await readContract({
        contract: nftContract,
        method:
          "function hasRole(bytes32 role, address account) view returns (bool)",
        params: [MINTER_ROLE, account.address],
      });

      console.log(`[NFT] Signer has MINTER_ROLE: ${hasMinterRole}`);

      if (!hasMinterRole) {
        console.log(
          "[NFT] ERROR: Signer does not have MINTER_ROLE. Attempting to grant...",
        );

        // Tentar conceder o papel usando nosso endpoint
        const grantResult = await grantMinterRole(account.address);
        if (!grantResult.success) {
          return {
            success: false,
            error: `Signer does not have MINTER_ROLE and auto-grant failed: ${grantResult.error}`,
          };
        }
        console.log("[NFT] MINTER_ROLE granted successfully");
      }
    } catch (error) {
      console.log("[NFT] Could not verify MINTER_ROLE:", error.message);
    }

    // Get fan token symbol if fanTokenId is provided
    let fanTokenSymbol = null;
    if (transactionData.fan_token_id) {
      console.log(`[NFT] Looking up fan token symbol for ID: ${transactionData.fan_token_id}`);
      try {
        const { data: fanToken, error: fanTokenError } = await supabase
          .from("fan_tokens")
          .select("symbol")
          .eq("id", transactionData.fan_token_id)
          .single();

        if (!fanTokenError && fanToken) {
          fanTokenSymbol = fanToken.symbol;
          console.log(`[NFT] Found fan token symbol: ${fanTokenSymbol}`);
        } else {
          console.log(`[NFT] Fan token not found for ID: ${transactionData.fan_token_id}`);
        }
      } catch (error) {
        console.log(`[NFT] Error fetching fan token:`, error.message);
      }
    }

    // Create metadata with specified image and English text
    const metadata = {
      name: `Cashback NFT – ${transactionData.partner_name}`,
      description: `Cashback reward of ${transactionData.currency.toUpperCase()}$${transactionData.cashback_amount} from ${transactionData.partner_name}${fanTokenSymbol ? ` (${fanTokenSymbol} Fan Token)` : ''}`,
      image: "https://back2.fan/nft.png",
      attributes: [
        { trait_type: "Partner", value: transactionData.partner_name },
        {
          trait_type: "Cashback Amount",
          value: transactionData.cashback_amount.toString(),
        },
        { trait_type: "Currency", value: transactionData.currency.toUpperCase() },
        {
          trait_type: "Purchase Amount",
          value: transactionData.sale_amount.toString(),
        },
        { trait_type: "Status", value: "pending" },
        {
          trait_type: "Date",
          value: new Date(transactionData.transaction_date).toISOString(),
        },
        ...(fanTokenSymbol ? [{ trait_type: "Fan Token", value: fanTokenSymbol }] : []),
      ],
    };

    // Cria URI simples com dados básicos (sem upload para IPFS)
    const metadataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;
    console.log(
      "[NFT] Metadata created:",
      metadataUri.substring(0, 100) + "...",
    );

    // Get next token ID
    console.log("[NFT] Getting next token ID...");
    const nextTokenId = await nextTokenIdToMint({
      contract: nftContract,
    });
    console.log("[NFT] Next token ID will be:", nextTokenId.toString());

    // Verificar se o nextTokenId parece correto
    if (nextTokenId.toString() === "0") {
      console.log(
        "[NFT] WARNING: Token ID is 0 even though NFTs exist. Checking contract state...",
      );

      // Tentar verificar o total supply
      try {
        const { readContract } = await import("thirdweb");
        const totalSupply = await readContract({
          contract: nftContract,
          method: "function totalSupply() view returns (uint256)",
          params: [],
        });
        console.log("[NFT] Contract total supply:", totalSupply.toString());
      } catch (error) {
        console.log("[NFT] Could not read total supply:", error.message);
      }
    }

    // Validar e normalizar o endereço do usuário
    const normalizedUserAddress = userWalletAddress.toLowerCase();
    console.log("[NFT] Normalized user address:", normalizedUserAddress);

    // Log dos parâmetros para debug
    console.log("[NFT] Mint parameters:", {
      userWalletAddress: normalizedUserAddress,
      metadataUri,
      signerAccount: account.address,
      nextTokenId: nextTokenId.toString(),
    });

    // Prepara a transação de mint com o objeto contract
    const transaction = await prepareContractCall({
      contract: nftContract,
      method: "function mintTo(address,string)",
      params: [userWalletAddress, metadataUri],
      account, // ← força o SDK a usar este "from" na simulação
    });

    // Envia a transação diretamente sem usar forwarder
    console.log("[NFT] Sending transaction to blockchain...initializeThirdweb");
    const result = await sendTransaction({
      transaction,
      account,
    });

    console.log("✅ NFT mintado! TxHash:", result);

    return {
      success: true,
      tokenId: nextTokenId.toString(),
      contractAddress: NFT_CONTRACT_ADDRESS,
      transactionHash: result,
      metadata,
      metadataUri,
    };
  } catch (error) {
    console.error("[NFT] Error in NFT minting process:", error);
    console.error("[NFT] Full error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to set claim conditions for ClaimableERC721
async function setClaimConditions() {
  try {
    console.log("[NFT] Setting up claim conditions...");

    if (!nftContract || !account) {
      return {
        success: false,
        error: "NFT contract or account not initialized",
      };
    }

    console.log(
      "[NFT] Claim conditions setup for ClaimableERC721 requires contract interaction",
    );
    console.log(
      "[NFT] Please configure claim conditions through Thirdweb dashboard",
    );

    return {
      success: false,
      error: "Please configure claim conditions through Thirdweb dashboard",
    };
  } catch (error) {
    console.error("[NFT] Error setting claim conditions:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper function to update NFT status
async function updateNFTStatus(tokenId, newStatus, additionalData = {}) {
  try {
    console.log(
      `[NFT] Updating NFT status. Token ID: ${tokenId}, New Status: ${newStatus}`,
    );

    // Note: With the new Thirdweb SDK, metadata updates are typically handled off-chain
    // or require special contract permissions. For now, we'll log the update and store it in our database
    const updatedMetadata = {
      status: newStatus,
      confirmation_date: additionalData.confirmation_date,
      notes: additionalData.notes,
    };

    console.log(
      `[NFT] NFT status update prepared for token ${tokenId}:`,
      updatedMetadata,
    );

    return {
      success: true,
      tokenId,
      newStatus,
      metadata: updatedMetadata,
    };
  } catch (error) {
    console.error("[NFT] Error updating NFT status:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Route to generate tracking links
app.post("/api/track-link", async (req, res) => {
  try {
    const { url, userId, network, tokenId } = req.body;

    if (!url || !userId || !network) {
      return res.status(400).json({
        error: "Missing required parameters: url, userId, network",
      });
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("wallet_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract domain from URL to find partner
    const domain = new URL(url).hostname.replace("www.", "");
    console.log(
      `[${network.toUpperCase()}] Looking for partner with domain: ${domain} from URL: ${url}`,
    );

    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("*")
      .ilike("url", `%${domain}%`)
      .single();

    console.log(`[${network.toUpperCase()}] Partner query result:`, {
      found: !!partner,
      error: partnerError?.message,
      partnerName: partner?.name,
      partnerUrl: partner?.url,
    });

    if (partnerError || !partner) {
      // Try to log all available partners for debugging
      const { data: allPartners } = await supabase
        .from("partners")
        .select("name, url")
        .limit(10);

      console.log(
        `[${network.toUpperCase()}] Available partners:`,
        allPartners,
      );

      return res.status(404).json({
        error: "Partner not found for this URL",
        debug: {
          searchedDomain: domain,
          originalUrl: url,
          availablePartners: allPartners?.map((p) => ({
            name: p.name,
            url: p.url,
          })),
        },
      });
    }

    let trackedUrl;

    console.log(`[${network.toUpperCase()}] Partner configuration:`, {
      partnerId: partner.id,
      partnerName: partner.name,
      awinAdvertiserId: partner.awin_advertiser_id,
      rakutenAdvertiserId: partner.rakuten_advertiser_id,
      hasAwinId: !!partner.awin_advertiser_id,
      hasRakutenId: !!partner.rakuten_advertiser_id,
    });

    if (network.toLowerCase() === "awin" && partner.awin_advertiser_id) {
      console.log(
        `[AWIN] Generating link with advertiser ID: ${partner.awin_advertiser_id}`,
      );
      trackedUrl = generateAwinLink(url, userId, partner.awin_advertiser_id, tokenId);
    } else if (network.toLowerCase() === "rakuten") {
      if (!partner.rakuten_advertiser_id) {
        console.log(
          `[RAKUTEN] Partner ${partner.name} has no Rakuten advertiser ID configured`,
        );
        return res.status(400).json({
          error: "Partner not configured for Rakuten network",
          debug: {
            partnerId: partner.id,
            partnerName: partner.name,
            hasRakutenAdvertiserId: false,
          },
        });
      }
      console.log(
        `[RAKUTEN] Generating link with merchant ID: ${partner.rakuten_advertiser_id}`,
      );
      trackedUrl = generateRakutenLink(
        url,
        userId,
        partner.rakuten_advertiser_id,
        tokenId,
      );
    } else {
      console.log(
        `[ERROR] Invalid network '${network}' or partner not configured`,
      );
      return res.status(400).json({
        error: "Invalid network or partner not configured for this network",
        debug: {
          network: network,
          partnerId: partner.id,
          partnerName: partner.name,
          hasAwinAdvertiserId: !!partner.awin_advertiser_id,
          hasRakutenAdvertiserId: !!partner.rakuten_advertiser_id,
        },
      });
    }

    // Log the click
    await supabase.from("store_clicks").insert({
      wallet_address: user.wallet_address,
      partner_id: partner.id,
    });

    res.json({
      success: true,
      trackedUrl,
      partner: {
        id: partner.id,
        name: partner.name,
        baseRate: partner.base_rate,
      },
    });
  } catch (error) {
    console.error("Error generating tracking link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// AWIN Postback/Webhook endpoint
app.post("/api/webhook/awin", async (req, res) => {
  const postbackData = req.body;

  try {
    console.log("AWIN Webhook received:", postbackData);

    let transactionData;
    
    // Check if it's the new AwinTransactionPush format
    if (postbackData.AwinTransactionPush) {
      try {
        transactionData = JSON.parse(postbackData.AwinTransactionPush);
        console.log("AWIN Transaction Push parsed:", transactionData);
      } catch (parseError) {
        console.error("Error parsing AwinTransactionPush:", parseError);
        await logPostback("awin", postbackData, false, "Invalid AwinTransactionPush JSON");
        return res.status(400).json({ error: "Invalid AwinTransactionPush JSON" });
      }
    } else {
      // Fallback to old format
      transactionData = postbackData;
    }

    // Extract data from either format
    const advertiserId = transactionData.merchantId || transactionData.advertiserId;
    const clickRef = transactionData.clickRef;
    const commissionAmount = parseFloat(transactionData.commission || transactionData.commissionAmount || 0);
    const saleAmount = parseFloat(transactionData.transactionAmount || transactionData.saleAmount || 0);
    const currency = transactionData.transactionCurrency || transactionData.currency || "BRL";
    const transactionId = transactionData.transactionId;
    const status = transactionData.eventType === "created" ? "confirmed" : (transactionData.status || "pending");
    const orderRef = transactionData.orderRef || transactionId;
    const transactionDate = transactionData.transactionDate ? new Date(transactionData.transactionDate) : new Date();

    // Log raw postback
    await logPostback("awin", postbackData);

    if (!clickRef || !clickRef.startsWith("user_")) {
      await logPostback("awin", postbackData, false, "Invalid click reference");
      return res.status(400).json({ error: "Invalid click reference" });
    }

    // Extract user ID and tokenId from click reference
    const clickRefParts = clickRef.split("_");
    const userId = clickRefParts[1];
    
    // Extract tokenId if present (format: user_userId_timestamp_token_tokenId)
    let fanTokenId = null;
    const tokenIndex = clickRefParts.indexOf("token");
    if (tokenIndex !== -1 && clickRefParts[tokenIndex + 1]) {
      fanTokenId = clickRefParts[tokenIndex + 1];
      console.log(`[AWIN] Found fan token ID in clickRef: ${fanTokenId}`);
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("wallet_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      const errorMsg = `User not found for ID: ${userId}`;
      console.error(errorMsg);
      await logPostback("awin", postbackData, false, errorMsg);
      return res.status(404).json({ error: "User not found" });
    }

    // Get partner info
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("*")
      .eq("awin_advertiser_id", advertiserId)
      .single();

    if (partnerError || !partner) {
      const errorMsg = `Partner not found for advertiser ID: ${advertiserId}`;
      console.error(errorMsg);
      await logPostback("awin", postbackData, false, errorMsg);
      return res.status(404).json({ error: "Partner not found" });
    }

    // Calculate cashback based on partner's base_rate, not commission
    const purchaseValue = saleAmount;
    const cashbackPercent = partner.base_rate;
    const cashbackAmount = (purchaseValue * cashbackPercent) / 100;

    console.log(`[AWIN] Cashback calculation:`, {
      purchaseValue,
      partnerCashbackPercent: cashbackPercent,
      calculatedCashback: cashbackAmount,
      receivedCommission: commissionAmount
    });

    // Check if transaction already exists to avoid duplicates
    const { data: existingTransaction } = await supabase
      .from("affiliate_transactions")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("affiliate_network", "awin")
      .single();

    if (existingTransaction) {
      console.log(`[AWIN] Transaction ${transactionId} already exists, updating status if needed`);
      
      // Update status if it changed
      if (existingTransaction.status !== status) {
        await supabase
          .from("affiliate_transactions")
          .update({
            status,
            confirmation_date: status === "confirmed" ? new Date() : null,
            updated_at: new Date()
          })
          .eq("id", existingTransaction.id);

        // Update NFT status if exists
        if (existingTransaction.nft_token_id) {
          await updateNFTStatus(existingTransaction.nft_token_id, status, {
            confirmation_date: status === "confirmed" ? new Date() : null
          });
          console.log(`[AWIN] NFT ${existingTransaction.nft_token_id} status updated to ${status}`);
        }
      }

      await logPostback("awin", postbackData, true, "Duplicate transaction - status updated", existingTransaction.id);
      return res.json({
        success: true,
        message: "Transaction status updated",
        transactionId: existingTransaction.id,
      });
    }

    // Insert new transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("affiliate_transactions")
      .insert({
        user_id: userId,
        wallet_address: user.wallet_address,
        partner_id: partner.id,
        fan_token_id: fanTokenId,
        transaction_id: transactionId,
        order_id: orderRef,
        click_reference: clickRef,
        sale_amount: purchaseValue,
        commission_amount: commissionAmount,
        cashback_percent: cashbackPercent,
        cashback_amount: cashbackAmount,
        currency: currency?.toLowerCase() || "brl",
        affiliate_network: "awin",
        advertiser_id: advertiserId,
        status: status,
        transaction_date: transactionDate,
        confirmation_date: status === "confirmed" ? new Date() : null,
        raw_data: postbackData,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error inserting transaction:", transactionError);
      await logPostback("awin", postbackData, false, transactionError.message);
      return res.status(500).json({ error: "Failed to record transaction" });
    }

    // Mint NFT for the user
    const nftData = {
      partner_name: partner.name,
      partner_logo: partner.logo,
      cashback_amount: cashbackAmount,
      currency: currency?.toLowerCase() || "brl",
      sale_amount: purchaseValue,
      affiliate_network: "awin",
      transaction_date: transactionDate,
      fan_token_id: fanTokenId,
    };

    const nftResult = await mintCashbackNFT(user.wallet_address, nftData);

    if (nftResult.success) {
      // Update transaction with NFT data
      await supabase
        .from("affiliate_transactions")
        .update({
          nft_token_id: nftResult.tokenId,
          nft_contract_address: nftResult.contractAddress,
          nft_transaction_hash: nftResult.transactionHash,
          nft_metadata: nftResult.metadata,
        })
        .eq("id", transaction.id);

      console.log(
        `[AWIN] NFT minted for transaction ${transaction.id}: Token ID ${nftResult.tokenId}`,
      );
    } else {
      console.log(
        `[AWIN] NFT minting failed for transaction ${transaction.id}: ${nftResult.error}`,
      );

      // Store NFT metadata for future minting when contract is ready
      if (nftResult.metadata) {
        await supabase
          .from("affiliate_transactions")
          .update({
            nft_metadata: nftResult.metadata,
            nft_mint_status: "pending_contract_update",
          })
          .eq("id", transaction.id);
      }
    }

    // Log successful processing
    await logPostback("awin", postbackData, true, null, transaction.id);

    console.log(`[AWIN] Transaction recorded successfully:`, {
      transactionId: transaction.id,
      userId,
      partnerId: partner.id,
      purchaseValue,
      cashbackAmount,
      status: transaction.status,
      nftMinted: nftResult.success,
      nftTokenId: nftResult.success ? nftResult.tokenId : null
    });

    res.json({
      success: true,
      message: "Transaction recorded successfully",
      transactionId: transaction.id,
      nftMinted: nftResult.success,
      nftTokenId: nftResult.success ? nftResult.tokenId : null
    });
  } catch (error) {
    console.error("AWIN webhook error:", error);
    await logPostback("awin", postbackData, false, error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Rakuten Postback/Webhook endpoint
app.post("/api/webhook/rakuten", async (req, res) => {
  const postbackData = req.body;

  try {
    console.log("Rakuten Webhook received:", postbackData);

    const {
      mid, // merchant ID
      u1, // click reference
      amt, // sale amount
      cur, // currency
      oid, // order ID
      commission,
      sid, // session ID
      etd, // event transaction date
      qty, // quantity
    } = postbackData;

    // Log raw postback
    await logPostback("rakuten", postbackData);

    if (!u1 || !u1.startsWith("user_")) {
      await logPostback(
        "rakuten",
        postbackData,
        false,
        "Invalid click reference",
      );
      return res.status(400).json({ error: "Invalid click reference" });
    }

    // Extract user ID and tokenId from click reference
    const clickRefParts = u1.split("_");
    const userId = clickRefParts[1];
    
    // Extract tokenId if present (format: user_userId_timestamp_token_tokenId)
    let fanTokenId = null;
    const tokenIndex = clickRefParts.indexOf("token");
    if (tokenIndex !== -1 && clickRefParts[tokenIndex + 1]) {
      fanTokenId = clickRefParts[tokenIndex + 1];
      console.log(`[RAKUTEN] Found fan token ID in clickRef: ${fanTokenId}`);
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("wallet_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      const errorMsg = `User not found for ID: ${userId}`;
      console.error(errorMsg);
      await logPostback("rakuten", postbackData, false, errorMsg);
      return res.status(404).json({ error: "User not found" });
    }

    // Get partner info using rakuten_advertiser_id field for Rakuten mid
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("*")
      .eq("rakuten_advertiser_id", mid)
      .single();

    if (partnerError || !partner) {
      const errorMsg = `Partner not found for merchant ID: ${mid}`;
      console.error(errorMsg);
      await logPostback("rakuten", postbackData, false, errorMsg);
      return res.status(404).json({ error: "Partner not found" });
    }

    // Calculate cashback based on partner's base_rate, not commission
    const purchaseValue = parseFloat(amt);
    const commissionValue = parseFloat(commission) || 0;
    const cashbackPercent = partner.base_rate;
    const cashbackAmount = (purchaseValue * cashbackPercent) / 100;

    console.log(`[RAKUTEN] Cashback calculation:`, {
      purchaseValue,
      partnerCashbackPercent: cashbackPercent,
      calculatedCashback: cashbackAmount,
      receivedCommission: commissionValue
    });

    // Check if transaction already exists to avoid duplicates
    const { data: existingTransaction } = await supabase
      .from("affiliate_transactions")
      .select("*")
      .eq("transaction_id", sid)
      .eq("affiliate_network", "rakuten")
      .single();

    if (existingTransaction) {
      console.log(`[RAKUTEN] Transaction ${sid} already exists`);
      await logPostback("rakuten", postbackData, true, "Duplicate transaction", existingTransaction.id);
      return res.json({
        success: true,
        message: "Transaction already processed",
        transactionId: existingTransaction.id,
      });
    }

    // Insert transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("affiliate_transactions")
      .insert({
        user_id: userId,
        wallet_address: user.wallet_address,
        partner_id: partner.id,
        fan_token_id: fanTokenId,
        transaction_id: sid, // Using session ID as transaction ID
        order_id: oid,
        click_reference: u1,
        sale_amount: purchaseValue,
        commission_amount: commissionValue,
        cashback_percent: cashbackPercent,
        cashback_amount: cashbackAmount,
        currency: cur?.toLowerCase() || "brl",
        affiliate_network: "rakuten",
        advertiser_id: mid,
        status: "confirmed", // Rakuten usually sends confirmed transactions
        transaction_date: etd ? new Date(etd) : new Date(),
        confirmation_date: new Date(),
        raw_data: postbackData,
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Error inserting transaction:", transactionError);
      await logPostback(
        "rakuten",
        postbackData,
        false,
        transactionError.message,
      );
      return res.status(500).json({ error: "Failed to record transaction" });
    }

    // Mint NFT for the user
    const nftData = {
      partner_name: partner.name,
      partner_logo: partner.logo,
      cashback_amount: cashbackAmount,
      currency: cur?.toLowerCase() || "brl",
      sale_amount: purchaseValue,
      affiliate_network: "rakuten",
      transaction_date: etd ? new Date(etd) : new Date(),
      fan_token_id: fanTokenId,
    };

    const nftResult = await mintCashbackNFT(user.wallet_address, nftData);

    if (nftResult.success) {
      // Update transaction with NFT data
      await supabase
        .from("affiliate_transactions")
        .update({
          nft_token_id: nftResult.tokenId,
          nft_contract_address: nftResult.contractAddress,
          nft_transaction_hash: nftResult.transactionHash,
          nft_metadata: nftResult.metadata,
        })
        .eq("id", transaction.id);

      console.log(
        `[RAKUTEN] NFT minted for transaction ${transaction.id}: Token ID ${nftResult.tokenId}`,
      );
    } else {
      console.log(
        `[RAKUTEN] NFT minting failed for transaction ${transaction.id}: ${nftResult.error}`,
      );

      // Store NFT metadata for future minting when contract is ready
      if (nftResult.metadata) {
        await supabase
          .from("affiliate_transactions")
          .update({
            nft_metadata: nftResult.metadata,
            nft_mint_status: "pending_contract_update",
          })
          .eq("id", transaction.id);
      }
    }

    // Log successful processing
    await logPostback("rakuten", postbackData, true, null, transaction.id);

    console.log(`[RAKUTEN] Transaction recorded successfully:`, {
      transactionId: transaction.id,
      userId,
      partnerId: partner.id,
      purchaseValue,
      cashbackAmount,
      status: transaction.status,
      nftMinted: nftResult.success,
      nftTokenId: nftResult.success ? nftResult.tokenId : null
    });

    res.json({
      success: true,
      message: "Transaction recorded successfully",
      transactionId: transaction.id,
      nftMinted: nftResult.success,
      nftTokenId: nftResult.success ? nftResult.tokenId : null
    });
  } catch (error) {
    console.error("Rakuten webhook error:", error);
    await logPostback("rakuten", postbackData, false, error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Get user transactions (updated to use new table)
app.get("/api/transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, network, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("v_affiliate_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (network) {
      query = query.eq("affiliate_network", network);
    }

    const { data: transactions, error } = await query;

    if (error) {
      return res.status(500).json({ error: "Failed to fetch transactions" });
    }

    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user purchases (backward compatibility)
app.get("/api/purchases/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: transactions, error } = await supabase
      .from("v_affiliate_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch purchases" });
    }

    // Transform to match old format
    const purchases = transactions.map((t) => ({
      id: t.id,
      wallet_address: t.wallet_address,
      partner_id: t.partner_id,
      purchase_value: t.sale_amount,
      cashback_percent: t.cashback_percent,
      cashback_amount: t.cashback_amount,
      date: t.transaction_date,
      status: t.status,
      currency: t.currency,
      partners: {
        name: t.partner_name,
        logo: t.partner_logo,
        url: t.partner_url,
      },
    }));

    res.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get transaction statistics
app.get("/api/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: stats, error } = await supabase.rpc(
      "get_user_transaction_stats",
      { user_uuid: userId },
    );

    if (error) {
      // Fallback calculation if RPC doesn't exist
      const { data: transactions, error: txError } = await supabase
        .from("affiliate_transactions")
        .select("*")
        .eq("user_id", userId);

      if (txError) {
        return res.status(500).json({ error: "Failed to fetch statistics" });
      }

      const totalTransactions = transactions.length;
      const totalSales = transactions.reduce(
        (sum, t) => sum + parseFloat(t.sale_amount),
        0,
      );
      const totalCashback = transactions.reduce(
        (sum, t) => sum + parseFloat(t.cashback_amount),
        0,
      );
      const confirmedTransactions = transactions.filter(
        (t) => t.status === "confirmed",
      ).length;
      const pendingTransactions = transactions.filter(
        (t) => t.status === "pending",
      ).length;

      return res.json({
        totalTransactions,
        totalSales,
        totalCashback,
        confirmedTransactions,
        pendingTransactions,
        awinTransactions: transactions.filter(
          (t) => t.affiliate_network === "awin",
        ).length,
        rakutenTransactions: transactions.filter(
          (t) => t.affiliate_network === "rakuten",
        ).length,
      });
    }

    res.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin endpoint to get postback logs
app.get("/api/admin/postback-logs", async (req, res) => {
  try {
    const { network, processed, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from("postback_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (network) {
      query = query.eq("affiliate_network", network);
    }

    if (processed !== undefined) {
      query = query.eq("processed", processed === "true");
    }

    const { data: logs, error } = await query;

    if (error) {
      return res.status(500).json({ error: "Failed to fetch postback logs" });
    }

    res.json({ logs });
  } catch (error) {
    console.error("Error fetching postback logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Confirm cashback and update NFT status
app.post("/api/admin/confirm-cashback/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, notes } = req.body; // status: 'confirmed', 'rejected', 'cancelled'

    if (!["confirmed", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be: confirmed, rejected, or cancelled",
      });
    }

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from("affiliate_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (txError || !transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Update transaction status
    const updateData = {
      status,
      confirmation_date: status === "confirmed" ? new Date() : null,
      admin_notes: notes,
    };

    const { error: updateError } = await supabase
      .from("affiliate_transactions")
      .update(updateData)
      .eq("id", transactionId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update transaction" });
    }

    // Update NFT status if token exists
    if (transaction.nft_token_id) {
      const nftUpdateResult = await updateNFTStatus(
        transaction.nft_token_id,
        status,
        { confirmation_date: updateData.confirmation_date },
      );

      if (nftUpdateResult.success) {
        console.log(
          `[NFT] Updated NFT ${transaction.nft_token_id} status to ${status}`,
        );
      } else {
        console.error(
          `[NFT] Failed to update NFT status:`,
          nftUpdateResult.error,
        );
      }
    }

    res.json({
      success: true,
      message: `Transaction ${status} successfully`,
      transactionId,
      nftUpdated: !!transaction.nft_token_id,
    });
  } catch (error) {
    console.error("Error confirming cashback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's NFT collection
app.get("/api/nfts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's transactions with NFT data
    const { data: transactions, error } = await supabase
      .from("v_affiliate_transactions")
      .select("*")
      .eq("user_id", userId)
      .not("nft_token_id", "is", null)
      .order("transaction_date", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch NFTs" });
    }

    const nfts = transactions.map((tx) => ({
      tokenId: tx.nft_token_id,
      contractAddress: tx.nft_contract_address,
      transactionHash: tx.nft_transaction_hash,
      partnerName: tx.partner_name,
      partnerLogo: tx.partner_logo,
      cashbackAmount: tx.cashback_amount,
      currency: tx.currency,
      saleAmount: tx.sale_amount,
      network: tx.affiliate_network,
      status: tx.status,
      transactionDate: tx.transaction_date,
      confirmationDate: tx.confirmation_date,
    }));

    res.json({ nfts });
  } catch (error) {
    console.error("Error fetching user NFTs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all NFTs by wallet address with complete information
app.get("/api/wallet/:walletAddress/nfts", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { readContract } = await import("thirdweb");

    console.log(`[WALLET NFT CHECK] Starting verification for wallet: ${walletAddress}`);

    // Validate wallet address format
    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith("0x")) {
      console.log(`[WALLET NFT CHECK] Invalid wallet address format: ${walletAddress}`);
      return res.status(400).json({ 
        error: "Invalid wallet address format. Must be a valid Ethereum address." 
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    console.log(`[WALLET NFT CHECK] Normalized address: ${normalizedAddress}`);
    console.log(`[WALLET NFT CHECK] Contract address: ${NFT_CONTRACT_ADDRESS}`);

    // FIRST: Get NFTs directly from blockchain contract
    console.log(`[WALLET NFT CHECK] Reading total supply from contract...`);
    const totalSupply = await readContract({
      contract: nftContract,
      method: "function totalSupply() view returns (uint256)",
      params: [],
    });

    console.log(`[WALLET NFT CHECK] Total supply: ${totalSupply.toString()}`);

    const blockchainNFTs = [];

    // Check each token ID to see if it belongs to the wallet
    console.log(`[WALLET NFT CHECK] Checking ownership for ${totalSupply.toString()} tokens...`);
    
    for (let tokenId = 0; tokenId < parseInt(totalSupply.toString()); tokenId++) {
      try {
        console.log(`[WALLET NFT CHECK] Checking token ${tokenId}/${parseInt(totalSupply.toString()) - 1}...`);
        
        // Check if token exists and get owner
        const owner = await readContract({
          contract: nftContract,
          method: "function ownerOf(uint256) view returns (address)",
          params: [BigInt(tokenId)],
        });

        console.log(`[WALLET NFT CHECK] Token ${tokenId} owner: ${owner.toLowerCase()}`);

        // If this wallet owns the token, get its metadata
        if (owner.toLowerCase() === normalizedAddress) {
          console.log(`[WALLET NFT CHECK] ✅ Found NFT ${tokenId} owned by wallet ${normalizedAddress}`);

          let tokenURI = "";
          let metadata = null;

          // Get token URI
          console.log(`[WALLET NFT CHECK] Reading tokenURI for token ${tokenId}...`);
          try {
            tokenURI = await readContract({
              contract: nftContract,
              method: "function tokenURI(uint256) view returns (string)",
              params: [BigInt(tokenId)],
            });

            console.log(`[WALLET NFT CHECK] Token ${tokenId} URI: ${tokenURI.substring(0, 100)}${tokenURI.length > 100 ? '...' : ''}`);

            // If tokenURI is a data URI, decode it
            if (tokenURI.startsWith("data:application/json;base64,")) {
              console.log(`[WALLET NFT CHECK] Decoding base64 metadata for token ${tokenId}...`);
              const base64Data = tokenURI.replace("data:application/json;base64,", "");
              const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
              metadata = JSON.parse(decodedData);
              console.log(`[WALLET NFT CHECK] Decoded metadata for token ${tokenId}:`, {
                name: metadata.name,
                description: metadata.description?.substring(0, 50),
                attributesCount: metadata.attributes?.length || 0
              });
            } else if (tokenURI.startsWith("http")) {
              console.log(`[WALLET NFT CHECK] HTTP URI found for token ${tokenId}, storing as external_uri`);
              metadata = { external_uri: tokenURI };
            }
          } catch (error) {
            console.log(`[WALLET NFT CHECK] Could not read tokenURI for token ${tokenId}:`, error.message);
          }

          blockchainNFTs.push({
            tokenId: tokenId.toString(),
            owner: owner.toLowerCase(),
            tokenURI,
            metadata,
            contractAddress: NFT_CONTRACT_ADDRESS,
            // Blockchain specific data
            blockchain: {
              network: "Spicy Testnet (Chiliz)",
              chainId: 88882,
              contractAddress: NFT_CONTRACT_ADDRESS,
              tokenId: tokenId.toString(),
              tokenStandard: "ERC721"
            }
          });
        } else {
          console.log(`[WALLET NFT CHECK] Token ${tokenId} owned by different wallet: ${owner.toLowerCase()}`);
        }
      } catch (error) {
        // Token might not exist or other error, skip it
        console.log(`[WALLET NFT CHECK] Error checking token ${tokenId}:`, error.message);
        continue;
      }
    }

    console.log(`[WALLET NFT CHECK] ✅ Found ${blockchainNFTs.length} NFTs on blockchain for wallet ${normalizedAddress}`);

    // SECOND: Get transactions from database to enrich NFT data
    console.log(`[WALLET NFT CHECK] Querying database for transactions...`);
    const { data: transactions, error } = await supabase
      .from("affiliate_transactions")
      .select(`
        *,
        partners (
          name,
          logo,
          url,
          base_rate
        )
      `)
      .eq("wallet_address", normalizedAddress)
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error(`[WALLET NFT CHECK] Database error:`, error);
      // Continue with blockchain data only
      console.log(`[WALLET NFT CHECK] Continuing with blockchain data only due to database error`);
    }

    console.log(`[WALLET NFT CHECK] Found ${transactions?.length || 0} transactions for wallet ${normalizedAddress}`);

    // THIRD: Combine blockchain NFTs with database transaction data
    const enrichedNFTs = blockchainNFTs.map((nft) => {
      // Try to find matching transaction by token ID or by sequential matching
      const matchingTransaction = transactions?.find(tx => 
        tx.nft_token_id === nft.tokenId || 
        // Fallback: match by index if no nft_token_id is set
        (!tx.nft_token_id && transactions.indexOf(tx) === parseInt(nft.tokenId))
      );

      console.log(`[WALLET NFT CHECK] Processing NFT ${nft.tokenId}:`, {
        hasMatchingTransaction: !!matchingTransaction,
        transactionId: matchingTransaction?.id,
        partner: matchingTransaction?.partners?.name,
        cashback: matchingTransaction?.cashback_amount,
        status: matchingTransaction?.status
      });

      if (matchingTransaction) {
        // Enrich with transaction data
        return {
          // Basic NFT Info from blockchain
          tokenId: nft.tokenId,
          contractAddress: nft.contractAddress,
          owner: nft.owner,
          tokenURI: nft.tokenURI,
          
          // Metadata from blockchain (but can be overridden by database)
          name: nft.metadata?.name || `Cashback NFT – ${matchingTransaction.partners?.name || 'Unknown Partner'}`,
          description: nft.metadata?.description || `Cashback reward of ${matchingTransaction.currency.toUpperCase()}$${matchingTransaction.cashback_amount} from ${matchingTransaction.partners?.name || 'Unknown Partner'}`,
          image: nft.metadata?.image || "https://back2.fan/nft.png",
          attributes: nft.metadata?.attributes || [
            { trait_type: "Partner", value: matchingTransaction.partners?.name || 'Unknown Partner' },
            { trait_type: "Cashback Amount", value: matchingTransaction.cashback_amount.toString() },
            { trait_type: "Currency", value: matchingTransaction.currency.toUpperCase() },
            { trait_type: "Purchase Amount", value: matchingTransaction.sale_amount.toString() },
            { trait_type: "Status", value: matchingTransaction.status },
            { trait_type: "Date", value: new Date(matchingTransaction.transaction_date).toISOString() },
            ...(matchingTransaction.fan_token_id ? [{ trait_type: "Fan Token ID", value: matchingTransaction.fan_token_id }] : []),
          ],
          
          // Transaction Details
          transactionDetails: {
            id: matchingTransaction.id,
            transactionId: matchingTransaction.transaction_id,
            orderId: matchingTransaction.order_id,
            clickReference: matchingTransaction.click_reference,
            saleAmount: matchingTransaction.sale_amount,
            commissionAmount: matchingTransaction.commission_amount,
            cashbackPercent: matchingTransaction.cashback_percent,
            cashbackAmount: matchingTransaction.cashback_amount,
            currency: matchingTransaction.currency,
            affiliateNetwork: matchingTransaction.affiliate_network,
            advertiserId: matchingTransaction.advertiser_id,
            status: matchingTransaction.status,
            transactionDate: matchingTransaction.transaction_date,
            confirmationDate: matchingTransaction.confirmation_date,
            adminNotes: matchingTransaction.admin_notes,
            fanTokenId: matchingTransaction.fan_token_id
          },
          
          // Partner Information
          partner: {
            id: matchingTransaction.partner_id,
            name: matchingTransaction.partners?.name,
            logo: matchingTransaction.partners?.logo,
            url: matchingTransaction.partners?.url,
            baseRate: matchingTransaction.partners?.base_rate
          },
          
          // Blockchain Information
          blockchain: nft.blockchain,
          
          // Additional Properties
          properties: {
            cashbackEarned: matchingTransaction.cashback_amount,
            purchaseValue: matchingTransaction.sale_amount,
            cashbackRate: matchingTransaction.cashback_percent,
            affiliateNetwork: matchingTransaction.affiliate_network,
            partnerName: matchingTransaction.partners?.name,
            transactionStatus: matchingTransaction.status,
            mintDate: matchingTransaction.created_at,
            lastUpdated: matchingTransaction.updated_at
          }
        };
      } else {
        // NFT exists on blockchain but no matching transaction in database
        console.log(`[WALLET NFT CHECK] NFT ${nft.tokenId} exists on blockchain but no matching transaction found`);
        return {
          // Basic NFT Info from blockchain
          tokenId: nft.tokenId,
          contractAddress: nft.contractAddress,
          owner: nft.owner,
          tokenURI: nft.tokenURI,
          
          // Metadata from blockchain
          name: nft.metadata?.name || `Unknown NFT #${nft.tokenId}`,
          description: nft.metadata?.description || `NFT #${nft.tokenId} from blockchain`,
          image: nft.metadata?.image || "https://back2.fan/nft.png",
          attributes: nft.metadata?.attributes || [],
          
          // No transaction details available
          transactionDetails: null,
          partner: null,
          
          // Blockchain Information
          blockchain: nft.blockchain,
          
          // Minimal properties
          properties: {
            source: "blockchain_only",
            hasTransactionData: false
          }
        };
      }
    });

    // Calculate summary statistics
    console.log(`[WALLET NFT CHECK] Calculating summary statistics for ${enrichedNFTs.length} NFTs...`);
    
    const nftsWithTransactions = enrichedNFTs.filter(nft => nft.transactionDetails);
    
    const summary = {
      totalNFTs: enrichedNFTs.length,
      nftsWithTransactionData: nftsWithTransactions.length,
      nftsBlockchainOnly: enrichedNFTs.length - nftsWithTransactions.length,
      totalCashbackEarned: nftsWithTransactions.reduce((sum, nft) => sum + parseFloat(nft.transactionDetails.cashbackAmount), 0),
      totalPurchaseValue: nftsWithTransactions.reduce((sum, nft) => sum + parseFloat(nft.transactionDetails.saleAmount), 0),
      confirmedNFTs: nftsWithTransactions.filter(nft => nft.transactionDetails.status === 'confirmed').length,
      pendingNFTs: nftsWithTransactions.filter(nft => nft.transactionDetails.status === 'pending').length,
      networksUsed: [...new Set(nftsWithTransactions.map(nft => nft.transactionDetails.affiliateNetwork))],
      partnersUsed: [...new Set(nftsWithTransactions.map(nft => nft.partner?.name).filter(Boolean))],
      currencies: [...new Set(nftsWithTransactions.map(nft => nft.transactionDetails.currency))]
    };

    console.log(`[WALLET NFT CHECK] Summary calculated:`, {
      totalNFTs: summary.totalNFTs,
      withTransactionData: summary.nftsWithTransactionData,
      blockchainOnly: summary.nftsBlockchainOnly,
      totalCashback: summary.totalCashbackEarned,
      confirmed: summary.confirmedNFTs,
      pending: summary.pendingNFTs
    });

    console.log(`[WALLET NFT CHECK] ✅ Sending successful response for wallet ${normalizedAddress}`);

    res.json({
      success: true,
      walletAddress: normalizedAddress,
      summary,
      nfts: enrichedNFTs,
      dataSource: {
        blockchain: true,
        database: !error,
        contractAddress: NFT_CONTRACT_ADDRESS,
        totalSupplyOnChain: totalSupply.toString()
      }
    });

  } catch (error) {
    console.error(`[WALLET NFT CHECK] Unexpected error for wallet ${req.params.walletAddress}:`, error);
    console.error(`[WALLET NFT CHECK] Error stack:`, error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});

// Get NFT metadata by token ID
app.get("/api/nft/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;

    console.log(`[NFT CHECK] Starting verification for NFT token ID: ${tokenId}`);

    // Get transaction data from database (primary source of NFT info)
    console.log(`[NFT CHECK] Querying database for NFT token ID: ${tokenId}`);
    const { data: transaction, error: dbError } = await supabase
      .from("affiliate_transactions")
      .select("*, partners(name, logo, url)")
      .eq("nft_token_id", tokenId)
      .single();

    if (dbError) {
      console.log(`[NFT CHECK] Database error for token ${tokenId}:`, dbError);
      if (dbError.code === 'PGRST116') {
        console.log(`[NFT CHECK] No transaction found with nft_token_id: ${tokenId}`);
        return res.status(404).json({ error: "NFT not found" });
      }
      throw dbError;
    }

    if (!transaction) {
      console.log(`[NFT CHECK] No transaction found for NFT token ID: ${tokenId}`);
      return res.status(404).json({ error: "NFT not found" });
    }

    console.log(`[NFT CHECK] Found transaction for NFT ${tokenId}:`, {
      transactionId: transaction.id,
      walletAddress: transaction.wallet_address,
      partner: transaction.partners?.name,
      cashbackAmount: transaction.cashback_amount,
      status: transaction.status,
      fanTokenId: transaction.fan_token_id
    });

    // Construct metadata from transaction data
    console.log(`[NFT CHECK] Constructing metadata for NFT ${tokenId}...`);
    
    const metadata = {
      name: `Cashback NFT - ${transaction.partners.name}`,
      description: `Cashback reward for purchase at ${transaction.partners.name}. Amount: ${transaction.currency.toUpperCase()}$${transaction.cashback_amount}`,
      image: "https://back2.fan/nft.png",
      attributes: [
        { trait_type: "Partner", value: transaction.partners.name },
        {
          trait_type: "Cashback Amount",
          value: transaction.cashback_amount.toString(),
        },
        { trait_type: "Currency", value: transaction.currency.toUpperCase() },
        {
          trait_type: "Purchase Amount",
          value: transaction.sale_amount.toString(),
        },
        { trait_type: "Status", value: transaction.status },
        {
          trait_type: "Date",
          value: new Date(transaction.transaction_date).toISOString(),
        },
      ],
    };

    console.log(`[NFT CHECK] Metadata constructed successfully for NFT ${tokenId}:`, {
      name: metadata.name,
      partner: transaction.partners.name,
      cashback: transaction.cashback_amount,
      currency: transaction.currency,
      status: transaction.status
    });

    console.log(`[NFT CHECK] Sending successful response for NFT ${tokenId}`);

    res.json({
      tokenId,
      contractAddress: NFT_CONTRACT_ADDRESS,
      metadata,
      owner: transaction.wallet_address,
      transaction,
    });
  } catch (error) {
    console.error(`[NFT CHECK] Unexpected error for NFT ${req.params.tokenId}:`, error);
    console.error(`[NFT CHECK] Error stack:`, error.stack);
    res.status(500).json({ error: "NFT not found or error fetching data" });
  }
});

// Grant MINTER_ROLE to address (admin endpoint)
app.post("/api/admin/grant-minter-role", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const result = await grantMinterRole(address);

    if (result.success) {
      res.json({
        success: true,
        message: "MINTER_ROLE granted successfully",
        transactionHash: result.transactionHash,
        address,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error granting MINTER_ROLE:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Configure claim conditions (admin endpoint)
app.post("/api/admin/configure-claim-conditions", async (req, res) => {
  try {
    const result = await setClaimConditions();

    if (result.success) {
      res.json({
        success: true,
        message: "Claim conditions configured successfully",
        transactionHash: result.transactionHash,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error configuring claim conditions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update NFT status (admin endpoint)
app.post("/api/admin/nft/:tokenId/status", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status, notes } = req.body;

    const result = await updateNFTStatus(tokenId, status, { notes });

    if (result.success) {
      // Also update the transaction record
      await supabase
        .from("affiliate_transactions")
        .update({
          status,
          admin_notes: notes,
          confirmation_date: status === "confirmed" ? new Date() : null,
        })
        .eq("nft_token_id", tokenId);

      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error updating NFT status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get DEFAULT_ADMIN_ROLE from NFT contract
app.get("/api/contract/default-admin-role", async (req, res) => {
  try {
    const { readContract } = await import("thirdweb");

    const data = await readContract({
      contract: nftContract,
      method: "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
      params: [],
    });

    res.json({
      success: true,
      defaultAdminRole: data,
      contractAddress: NFT_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error reading DEFAULT_ADMIN_ROLE:", error);
    res.status(500).json({
      success: false,
      error: "Failed to read DEFAULT_ADMIN_ROLE from contract",
      details: error.message,
    });
  }
});

// Get MINTER_ROLE hash
app.get("/api/contract/minter-role", async (req, res) => {
  try {
    const { readContract } = await import("thirdweb");

    const data = await readContract({
      contract: nftContract,
      method: "function MINTER_ROLE() view returns (bytes32)",
      params: [],
    });

    res.json({
      success: true,
      minterRole: data,
      contractAddress: NFT_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error reading MINTER_ROLE:", error);
    res.status(500).json({
      success: false,
      error: "Failed to read MINTER_ROLE from contract",
      details: error.message,
    });
  }
});

// Check if address has specific role
app.get("/api/contract/has-role/:role/:address", async (req, res) => {
  try {
    const { role, address } = req.params;
    const { readContract } = await import("thirdweb");

    const hasRole = await readContract({
      contract: nftContract,
      method:
        "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [role, address],
    });

    res.json({
      success: true,
      hasRole,
      role,
      address,
      contractAddress: NFT_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error checking role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check role",
      details: error.message,
    });
  }
});

// Check current account roles
app.get("/api/contract/my-roles", async (req, res) => {
  try {
    const { readContract } = await import("thirdweb");

    // Get role hashes
    const DEFAULT_ADMIN_ROLE =
      "0x0000000000000000000000000000000000000000000000000000000000000000";
    const MINTER_ROLE =
      "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

    // Check if current account has roles
    const hasAdminRole = await readContract({
      contract: nftContract,
      method:
        "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [DEFAULT_ADMIN_ROLE, account.address],
    });

    const hasMinterRole = await readContract({
      contract: nftContract,
      method:
        "function hasRole(bytes32 role, address account) view returns (bool)",
      params: [MINTER_ROLE, account.address],
    });

    res.json({
      success: true,
      address: account.address,
      roles: {
        DEFAULT_ADMIN_ROLE: {
          hash: DEFAULT_ADMIN_ROLE,
          hasRole: hasAdminRole,
        },
        MINTER_ROLE: {
          hash: MINTER_ROLE,
          hasRole: hasMinterRole,
        },
      },
      contractAddress: NFT_CONTRACT_ADDRESS,
    });
  } catch (error) {
    console.error("Error checking my roles:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check roles",
      details: error.message,
    });
  }
});

// Grant DEFAULT_ADMIN_ROLE to current account (only if contract owner)
app.post("/api/contract/grant-admin-role", async (req, res) => {
  try {
    const { prepareContractCall, sendTransaction } = await import("thirdweb");

    const DEFAULT_ADMIN_ROLE =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    const grantRoleTx = await prepareContractCall({
      contract: nftContract,
      method: "function grantRole(bytes32 role, address account)",
      params: [DEFAULT_ADMIN_ROLE, account.address],
    });

    const { transactionHash } = await sendTransaction({
      account,
      transaction: grantRoleTx,
    });

    res.json({
      success: true,
      message: "DEFAULT_ADMIN_ROLE granted to current account",
      transactionHash,
      address: account.address,
    });
  } catch (error) {
    console.error("Error granting admin role:", error);
    res.status(500).json({
      success: false,
      error: "Failed to grant admin role",
      details: error.message,
    });
  }
});

// Get NFT data directly from Thirdweb contract for a specific wallet
app.get("/api/contract/wallet/:walletAddress/nfts", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { readContract } = await import("thirdweb");

    console.log(`[CONTRACT NFT CHECK] Starting contract verification for wallet: ${walletAddress}`);

    // Validate wallet address format
    if (!walletAddress || walletAddress.length !== 42 || !walletAddress.startsWith("0x")) {
      console.log(`[CONTRACT NFT CHECK] Invalid wallet format: ${walletAddress}`);
      return res.status(400).json({ 
        error: "Invalid wallet address format. Must be a valid Ethereum address." 
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    console.log(`[CONTRACT NFT CHECK] Normalized address: ${normalizedAddress}`);
    console.log(`[CONTRACT NFT CHECK] Contract address: ${NFT_CONTRACT_ADDRESS}`);

    // Get total supply of NFTs
    console.log(`[CONTRACT NFT CHECK] Reading total supply from contract...`);
    const totalSupply = await readContract({
      contract: nftContract,
      method: "function totalSupply() view returns (uint256)",
      params: [],
    });

    console.log(`[CONTRACT NFT CHECK] Total supply: ${totalSupply.toString()}`);

    const walletNFTs = [];
    const contractInfo = {
      address: NFT_CONTRACT_ADDRESS,
      name: "",
      symbol: "",
      totalSupply: totalSupply.toString(),
      network: "Spicy Testnet (Chiliz)",
      chainId: 88882
    };

    // Try to get contract name and symbol
    try {
      contractInfo.name = await readContract({
        contract: nftContract,
        method: "function name() view returns (string)",
        params: [],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read contract name:", error.message);
    }

    try {
      contractInfo.symbol = await readContract({
        contract: nftContract,
        method: "function symbol() view returns (string)",
        params: [],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read contract symbol:", error.message);
    }

    // Check each token ID to see if it belongs to the wallet
    console.log(`[CONTRACT NFT CHECK] Checking ownership for ${totalSupply.toString()} tokens...`);
    
    for (let tokenId = 0; tokenId < parseInt(totalSupply.toString()); tokenId++) {
      try {
        console.log(`[CONTRACT NFT CHECK] Checking token ${tokenId}/${parseInt(totalSupply.toString()) - 1}...`);
        
        // Check if token exists and get owner
        const owner = await readContract({
          contract: nftContract,
          method: "function ownerOf(uint256) view returns (address)",
          params: [BigInt(tokenId)],
        });

        console.log(`[CONTRACT NFT CHECK] Token ${tokenId} owner: ${owner.toLowerCase()}`);

        // If this wallet owns the token, get its metadata
        if (owner.toLowerCase() === normalizedAddress) {
          console.log(`[CONTRACT NFT CHECK] ✅ Found NFT ${tokenId} owned by wallet ${normalizedAddress}`);

          let tokenURI = "";
          let metadata = null;

          // Get token URI
          console.log(`[CONTRACT NFT CHECK] Reading tokenURI for token ${tokenId}...`);
          try {
            tokenURI = await readContract({
              contract: nftContract,
              method: "function tokenURI(uint256) view returns (string)",
              params: [BigInt(tokenId)],
            });

            console.log(`[CONTRACT NFT CHECK] Token ${tokenId} URI: ${tokenURI.substring(0, 100)}${tokenURI.length > 100 ? '...' : ''}`);

            // If tokenURI is a data URI, decode it
            if (tokenURI.startsWith("data:application/json;base64,")) {
              console.log(`[CONTRACT NFT CHECK] Decoding base64 metadata for token ${tokenId}...`);
              const base64Data = tokenURI.replace("data:application/json;base64,", "");
              const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
              metadata = JSON.parse(decodedData);
              console.log(`[CONTRACT NFT CHECK] Decoded metadata for token ${tokenId}:`, {
                name: metadata.name,
                description: metadata.description?.substring(0, 50),
                attributesCount: metadata.attributes?.length || 0
              });
            } else if (tokenURI.startsWith("http")) {
              console.log(`[CONTRACT NFT CHECK] HTTP URI found for token ${tokenId}, storing as external_uri`);
              metadata = { external_uri: tokenURI };
            }
          } catch (error) {
            console.log(`[CONTRACT NFT CHECK] Could not read tokenURI for token ${tokenId}:`, error.message);
          }

          // Get additional token data if available
          let approved = null;
          console.log(`[CONTRACT NFT CHECK] Reading approval data for token ${tokenId}...`);
          try {
            approved = await readContract({
              contract: nftContract,
              method: "function getApproved(uint256) view returns (address)",
              params: [BigInt(tokenId)],
            });
            console.log(`[CONTRACT NFT CHECK] Token ${tokenId} approved address: ${approved}`);
          } catch (error) {
            console.log(`[CONTRACT NFT CHECK] Could not read approved for token ${tokenId}:`, error.message);
          }

          const nftData = {
            tokenId: tokenId.toString(),
            owner: owner.toLowerCase(),
            tokenURI,
            metadata,
            approved,
            contractAddress: NFT_CONTRACT_ADDRESS,
            // Blockchain specific data
            blockchain: {
              network: "Spicy Testnet (Chiliz)",
              chainId: 88882,
              contractAddress: NFT_CONTRACT_ADDRESS,
              tokenId: tokenId.toString(),
              tokenStandard: "ERC721"
            }
          };

          console.log(`[CONTRACT NFT CHECK] Adding NFT ${tokenId} to results for wallet ${normalizedAddress}`);
          walletNFTs.push(nftData);
        } else {
          console.log(`[CONTRACT NFT CHECK] Token ${tokenId} owned by different wallet: ${owner.toLowerCase()}`);
        }
      } catch (error) {
        // Token might not exist or other error, skip it
        console.log(`[CONTRACT NFT CHECK] Error checking token ${tokenId}:`, error.message);
        continue;
      }
    }

    // Get additional wallet info
    let balance = "0";
    try {
      balance = await readContract({
        contract: nftContract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [walletAddress],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read balance:", error.message);
    }

    const response = {
      success: true,
      walletAddress: normalizedAddress,
      contract: contractInfo,
      summary: {
        totalNFTs: walletNFTs.length,
        balance: balance.toString(),
        contractAddress: NFT_CONTRACT_ADDRESS,
        network: "Spicy Testnet (Chiliz)"
      },
      nfts: walletNFTs
    };

    console.log(`[CONTRACT NFT CHECK] ✅ Final result: Found ${walletNFTs.length} NFTs for wallet ${normalizedAddress}`);
    console.log(`[CONTRACT NFT CHECK] Contract info:`, {
      name: contractInfo.name,
      symbol: contractInfo.symbol,
      totalSupply: contractInfo.totalSupply,
      balance: balance.toString()
    });
    
    if (walletNFTs.length > 0) {
      console.log(`[CONTRACT NFT CHECK] NFT token IDs owned:`, walletNFTs.map(nft => nft.tokenId));
    }

    res.json(response);

  } catch (error) {
    console.error(`[CONTRACT NFT CHECK] Unexpected error for wallet ${req.params.walletAddress}:`, error);
    console.error(`[CONTRACT NFT CHECK] Error stack:`, error.stack);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch NFTs from contract",
      details: error.message 
    });
  }
});

// Get specific NFT data directly from contract
app.get("/api/contract/nft/:tokenId", async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { readContract } = await import("thirdweb");

    console.log(`[CONTRACT] Fetching NFT data for token ${tokenId}`);

    // Check if token exists and get owner
    const owner = await readContract({
      contract: nftContract,
      method: "function ownerOf(uint256) view returns (address)",
      params: [BigInt(tokenId)],
    });

    // Get token URI
    const tokenURI = await readContract({
      contract: nftContract,
      method: "function tokenURI(uint256) view returns (string)",
      params: [BigInt(tokenId)],
    });

    let metadata = null;
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const decodedData = Buffer.from(base64Data, "base64").toString("utf-8");
      metadata = JSON.parse(decodedData);
    }

    // Get approved address
    let approved = null;
    try {
      approved = await readContract({
        contract: nftContract,
        method: "function getApproved(uint256) view returns (address)",
        params: [BigInt(tokenId)],
      });
    } catch (error) {
      console.log(`[CONTRACT] Could not read approved for token ${tokenId}:`, error.message);
    }

    const response = {
      success: true,
      tokenId: tokenId.toString(),
      contractAddress: NFT_CONTRACT_ADDRESS,
      owner: owner.toLowerCase(),
      tokenURI,
      metadata,
      approved,
      blockchain: {
        network: "Spicy Testnet (Chiliz)",
        chainId: 88882,
        contractAddress: NFT_CONTRACT_ADDRESS,
        tokenId: tokenId.toString(),
        tokenStandard: "ERC721"
      }
    };

    res.json(response);

  } catch (error) {
    console.error(`[CONTRACT] Error fetching NFT ${req.params.tokenId}:`, error);
    
    if (error.message.includes("ERC721: invalid token ID") || error.message.includes("nonexistent token")) {
      res.status(404).json({ 
        success: false,
        error: "NFT not found",
        tokenId: req.params.tokenId 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch NFT from contract",
        details: error.message 
      });
    }
  }
});

// Get contract information
app.get("/api/contract/info", async (req, res) => {
  try {
    const { readContract } = await import("thirdweb");

    const contractInfo = {
      address: NFT_CONTRACT_ADDRESS,
      network: "Spicy Testnet (Chiliz)",
      chainId: 88882,
      name: "",
      symbol: "",
      totalSupply: "0",
      owner: "",
      supportedInterfaces: {}
    };

    // Get basic contract info
    try {
      contractInfo.name = await readContract({
        contract: nftContract,
        method: "function name() view returns (string)",
        params: [],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read name:", error.message);
    }

    try {
      contractInfo.symbol = await readContract({
        contract: nftContract,
        method: "function symbol() view returns (string)",
        params: [],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read symbol:", error.message);
    }

    try {
      const totalSupply = await readContract({
        contract: nftContract,
        method: "function totalSupply() view returns (uint256)",
        params: [],
      });
      contractInfo.totalSupply = totalSupply.toString();
    } catch (error) {
      console.log("[CONTRACT] Could not read totalSupply:", error.message);
    }

    try {
      contractInfo.owner = await readContract({
        contract: nftContract,
        method: "function owner() view returns (address)",
        params: [],
      });
    } catch (error) {
      console.log("[CONTRACT] Could not read owner:", error.message);
    }

    // Check supported interfaces
    const interfaces = {
      "ERC165": "0x01ffc9a7",
      "ERC721": "0x80ac58cd",
      "ERC721Metadata": "0x5b5e139f",
      "AccessControl": "0x7965db0b"
    };

    for (const [name, interfaceId] of Object.entries(interfaces)) {
      try {
        contractInfo.supportedInterfaces[name] = await readContract({
          contract: nftContract,
          method: "function supportsInterface(bytes4) view returns (bool)",
          params: [interfaceId],
        });
      } catch (error) {
        console.log(`[CONTRACT] Could not check interface ${name}:`, error.message);
        contractInfo.supportedInterfaces[name] = false;
      }
    }

    res.json({
      success: true,
      contract: contractInfo
    });

  } catch (error) {
    console.error("[CONTRACT] Error fetching contract info:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch contract information",
      details: error.message 
    });
  }
});



// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
