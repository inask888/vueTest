import axios from 'axios';

const RPC_MAP = {
    "ethereum": "https://eth.llamarpc.com",
    "optimism": "https://optimism-mainnet.public.blastapi.io",
    "arbitrum": "https://rpc.ankr.com/arbitrum",
    "polygon": "https://polygon-bor.publicnode.com",
    "bsc": "https://bscrpc.com",
    "zkEvm": "https://zkevm-rpc.com"
};

async function getTxCount(address, network) {
    if(network == "linea"){
        try {
            let linea_tx = 0;
            let apikey = "8D1VZ164J3612TQX7BD424PEW3BBD1UQPI";
            let url = `https://api.lineascan.build/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${apikey}`;
            const response = await axios.get(url);
            for (let i = 0; i < response.data.result.length; i++) {
                if (response.data.result[i].from.toLowerCase() === address.toLowerCase() && response.data.result[i]['txreceipt_status'] === "1") {
                    linea_tx++;
                }
            }
            return parseInt(linea_tx, 16);
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
                method: "eth_getTransactionCount",
                params: [address, "latest"],
                id: 1
            });
            const transactionCountHex = response.data.result;
            return parseInt(transactionCountHex, 16);
        } catch (error) {
            console.error(error);
            return "Error";
        }
    }
}

export default getTxCount;
