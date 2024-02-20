import axios from 'axios';
import {ethers} from "ethers";

const RPC_MAP = {
    "ethereum": "https://eth.llamarpc.com",
    "optimism": "https://optimism-mainnet.public.blastapi.io",
    "arbitrum": "https://rpc.ankr.com/arbitrum",
    "polygon": "https://polygon-bor.publicnode.com",
    "bsc": "https://bscrpc.com",
    "zkEvm": "https://zkevm-rpc.com",
    "linea": "https://rpc.linea.build",
    "zksync": "https://mainnet.era.zksync.io"
};

async function getEthBalance(walletAddress, network) {
    if(network == "linea"){
        try {
            let apikey = "8D1VZ164J3612TQX7BD424PEW3BBD1UQPI";
            let url = `https://api.lineascan.build/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${apikey}`;
            const response = await axios.get(url);
            let balance = response.data.result;
            const value = ethers.formatEther(balance, "ether");
            return parseFloat(value).toFixed(4);
        } catch (error) {
            console.error(error);
            return "Error";
        }
        
    }else{
        try {
            let rpcLink = RPC_MAP[network];
            if (!rpcLink) {
                return "Error: Invalid Network Name";
            }
            const response = await axios.post(rpcLink, {
                jsonrpc: "2.0",
                method: "eth_getBalance",
                params: [walletAddress, "latest"],
                id: 1
            });
            let balance = response.data.result;
            return (parseInt(balance, 16) / 10 ** 18).toFixed(4);
        } catch (error) {
            console.error(error);
            return "Error";
        }
    }
    
}

export default getEthBalance;
