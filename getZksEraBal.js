import axios from 'axios';

async function getZksEraBal(address) {
    try {
        let url = "https://zksync2-mainnet.zkscan.io/api?module=account&action=tokenlist&address=" + address;
        //console.log('getZksEraBal url', url);
        const response = await axios.get(url);
        //console.log('getZksEraBal begin');
        //console.log(response);
        let lpBal = Number(0);
        for(let i=0;i<response.data.result.length;i++){
            if(response.data.result[i].name!=null && response.data.result[i].name.indexOf("LP")!=-1){
                if(response.data.result[i].symbol == "USDC/WETH cSLP"){
                    lpBal += 24.789*Number(response.data.result[i].balance)/263181743343;
                }
                
            }
        }
        lpBal = lpBal.toFixed(4);
        return {lpBal};
    } catch (error) {
        console.error(error);
        return {lpBal: "Error"};
    }
}

export default getZksEraBal;
