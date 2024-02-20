import axios from "axios";


function GetDiffTime(date) {
    const offset = 8;
    const utc8Date = new Date(date.getTime() + offset * 3600 * 1000);
    const now = new Date();
    const utc8Now = new Date(now.getTime() + offset * 3600 * 1000);
    const diff = utc8Now - utc8Date;
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays > 0) {
        if (diffInDays > 7) {
            return `${parseInt(diffInDays / 7)} 周前`
        }
        return `${diffInDays} 天前`
    } else if (diffInHours > 0) {
        return `${diffInHours} 小时前`
    } else {
        return "刚刚"
    }
}


async function getZksLite(address) {
    try {
        let url = "https://api.zksync.io/jsrpc"
        console.log(url)
        const response = await axios.post(url, {
            'id': 1,
            'jsonrpc': '2.0',
            'method': 'account_info',
            'params': [
                address
            ]
        });
        let balance1
        let balance2
        let balance3
        // console.log("zklite...................")
        // console.log(response)
        // console.log(response.data.result.committed)
        if ("ETH" in response.data.result.committed.balances) {
            balance1 = (response.data.result.committed.balances.ETH / 10 ** 18).toFixed(4)
        } else {
            balance1 = 0;
        }
        if ("USDT" in response.data.result.committed.balances) {
            balance2 = (response.data.result.committed.balances.USDT / 1000000).toFixed(4)
        } else {
            balance2 = 0;
        }
        if ("USDC" in response.data.result.committed.balances) {
            balance3 = (response.data.result.committed.balances.USDC / 1000000).toFixed(4)
        } else {
            balance3 = 0;
        }
        let tx1 = response.data.result.committed.nonce;

        console.log("begin lite");
        let url2 = "https://api.zksync.io/api/v0.2/accounts/"+ address +"/transactions?from=latest&limit=100&direction=older"
        console.log(url)
        const response2 = await axios.get(url2);
        let lastTx = null;
        console.log(response2)
        if(response2.data.result.list.length > 0){
            const receivedAt = new Date(Date.parse(response2.data.result.list[0].createdAt));
            lastTx = GetDiffTime(receivedAt)
        }else{
            lastTx = "无交易"
        }
        

        return {balance1, balance2, balance3, tx1, lastTx};
    } catch (error) {
        console.error(error);
        return {balance1: "Error", balance2: "Error", balance3: "Error", tx1: "Error", lastTx: "Error"};
    }
}

export default getZksLite;
