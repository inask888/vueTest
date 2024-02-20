import axios from "axios";
import {ethers} from "ethers";
import {availableProtocols} from "./protocols"

function getDayNumber(d) {
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "W" + weekNo;
}

function getMonthNumber(d) {
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1);
}

function getCurName(cur){
    if(cur.toLowerCase() == '5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'.toLowerCase()){
        return "ETH"
    }else if(cur.toLowerCase() == '3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'.toLowerCase()){
        return "USDC"
    }else if(cur.toLowerCase() == '787c09494Ec8Bcb24DcAf8659E7d5D69979eE508'.toLowerCase()){
        return "MAV"
    }else if(cur.toLowerCase() == '41108b80c758f7081b7df77ca565f08dfe56da4f'.toLowerCase()){
        return "USDC/ETH"
    }else if(cur.toLowerCase() == '74a8f079eb015375b5dbb3ee98cbb1b91089323f'.toLowerCase()){
        return "USDC/ETH"
    }else if(cur.toLowerCase() == 'aca5d8805d6f160eb46e273e28169ddbf703ecdc'.toLowerCase()){
        return "USDC/USD+"
    }else if(cur.toLowerCase() == '2039bb4116b4efc145ec4f0e2ea75012d6c0f181'.toLowerCase()){
        return "BUSD"
    }else{
        console.log("不知道的币地址:", cur);
        return "";
    }
}

function getDate(date) {
    // return ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + " " + ("0" + date.getHours() ).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    return ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) ;
};

function getSyncAmount(address, list, calldata, transall) {
    let translist = "";
    if(calldata.startsWith('0x7d10')){
        translist += " 解LP,"
        transall += "SYNC解LP->"
        if(list.length == 4 ){
            const symbol = list[2]['tokenInfo']['symbol']
            if (symbol === "ETH") {
                const usdPrice = list[2]['tokenInfo']['usdPrice']
                let totalExchangeAmount = parseInt(list[2]['amount'], 16) / 10 ** 18
                translist += "得到" +totalExchangeAmount.toFixed(4) + "ETH"
            } else if (list[2]['tokenInfo']['symbol'] === "USDC") {
                let totalExchangeAmount = parseInt(list[2]['amount'], 16) / 10 ** 6
                translist += "得到" + totalExchangeAmount.toFixed(0) +  "USDC"
            }
        }else if(list.length == 3 ){
            const symbol = list[1]['tokenInfo']['symbol']
            if (symbol === "ETH") {
                const usdPrice = list[1]['tokenInfo']['usdPrice']
                let totalExchangeAmount = parseInt(list[1]['amount'], 16) / 10 ** 18
                translist += "得到" +totalExchangeAmount.toFixed(4) + "ETH"
            } else if (list[1]['tokenInfo']['symbol'] === "USDC") {
                let totalExchangeAmount = parseInt(list[1]['amount'], 16) / 10 ** 6
                translist += "得到" + totalExchangeAmount.toFixed(0) +  "USDC"
            }
        }
        
    }
    if(calldata.startsWith('0x94ec')){
        translist += " 加LP "
        transall += "SYNC加LP->"
        if(list.length == 6){
            if (list[2]['from'].toLowerCase() === address.toLowerCase() && list[2]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
                const symbol = list[2]['tokenInfo']['symbol']
                if (symbol === "ETH") {
                    const usdPrice = list[2]['tokenInfo']['usdPrice']
                    let totalExchangeAmount = parseInt(list[2]['amount'], 16) / 10 ** 18
                    translist += "ETH/"
                } else if (list[2]['tokenInfo']['symbol'] === "USDC") {
                    let totalExchangeAmount = parseInt(list[2]['amount'], 16) / 10 ** 6
                    translist += "USDC/"
                }
            }
            if (list[3]['from'].toLowerCase() === address.toLowerCase() && list[3]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
                const symbol = list[3]['tokenInfo']['symbol']
                if (symbol === "ETH") {
                    const usdPrice = list[3]['tokenInfo']['usdPrice']
                    let totalExchangeAmount = parseInt(list[3]['amount'], 16) / 10 ** 18
                    translist += "ETH"
                } else if (list[3]['tokenInfo']['symbol'] === "USDC") {
                    let totalExchangeAmount = parseInt(list[3]['amount'], 16) / 10 ** 6
                    translist += "USDC"
                }
            }
        }
        
    }else if(calldata.startsWith('0x2cc4081e')){
        translist += " SWAP "
        transall += "SYNC-SWAP->"
        for (let i = 0; i < list.length; i++) {
            if (list[i]['from'].toLowerCase() === address.toLowerCase() && list[i]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
                translist += list[i]['tokenInfo']['symbol']+'/'
            } else if (list[i]['to'].toLowerCase() === address.toLowerCase() && list[i]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase() && list[i]['from'].toLowerCase() !== "0x9606ec131eec0f84c95d82c9a63959f2331cf2ac".toLowerCase()) {
                translist += list[i]['tokenInfo']['symbol']
            }
        }
        
        
        
    }
    
    return [translist, transall];
}

function getIZUMIAmount(address, list, calldata) {
    let translist = " SWAP ";
    for (let i = 0; i < list.length; i++) {
        if (list[i]['from'].toLowerCase() === address.toLowerCase() && list[i]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[i]['tokenInfo']['symbol']+'/'
        } else if (list[i]['to'].toLowerCase() === address.toLowerCase() && list[i]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase() && list[i]['from'].toLowerCase() !== "0x9606ec131eec0f84c95d82c9a63959f2331cf2ac".toLowerCase()) {
            translist += list[i]['tokenInfo']['symbol']
        }
    }
    // console.log("endwith:", translist.endsWith("/"));
    // console.log("IUSD:", calldata.indexOf("0447a0751aa84f"));
    // console.log("IZI:", calldata.indexOf("83952547EE5b"));
    // console.log("Cheems:", calldata.indexOf("e1238A7149E"));
    // if(translist.endsWith("/")){
    //     if(calldata.indexOf("0447a0751aa84f")!=-1){
    //         translist += "IUSD"
    //     }else if(calldata.indexOf("83952547EE5b")!=-1){
    //         translist += "IZI"
    //     }else if(calldata.indexOf("e1238A7149E")!=-1){
    //         translist += "Cheems"
    //     }
    // }
    return translist;
}

function getMavAmount(address, list, transall, calldata) {
    let translist = "";
    
    if(list.length == 6 && list[2]['from'].toLowerCase() === address.toLowerCase()){
        translist += " 加LP "
        transall += "MAV-加LP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[2]['from'].toLowerCase() === address.toLowerCase() && list[2]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[2]['tokenInfo']['symbol']
        }
    }else if( calldata.startsWith("0xac9650d8") ){
        translist += " SWAP "
        transall += "MAV-SWAP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[2]['to'].toLowerCase() === address.toLowerCase() && list[2]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[2]['tokenInfo']['symbol']
        }
    }
    
    return [translist, transall];
}

function getMuteAmount(address, list, transall) {
    let translist = "";
    //console.log('length:', list.length);
    if( (list.length == 5 || list.length == 6 ) && list[1]['from'].toLowerCase() === address.toLowerCase() && list[2]['from'].toLowerCase() === address.toLowerCase()){
        translist += " 加LP "
        transall += "MUTE-加LP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[2]['from'].toLowerCase() === address.toLowerCase() && list[2]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[2]['tokenInfo']['symbol']
        }
    }else if(list.length == 6 && list[1]['from'].toLowerCase() !== address.toLowerCase()){
        translist += " 解LP "
        transall += "MUTE-解LP->"
        if (list[2]['from'].toLowerCase() === address.toLowerCase() && list[2]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[2]['tokenInfo']['symbol']+'/'
        }
        if (list[4]['from'].toLowerCase() === address.toLowerCase() && list[4]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[4]['tokenInfo']['symbol']
        }
    }else if( list.length == 5  &&  list[2]['from'].toLowerCase() !== address.toLowerCase()){
        translist += " SWAP "
        transall += "MUTE-SWAP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[3]['to'].toLowerCase() === address.toLowerCase() && list[3]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[3]['tokenInfo']['symbol']
        }
    }else if( list.length == 6  &&  list[2]['from'].toLowerCase() !== address.toLowerCase()){
        translist += " SWAP "
        transall += "MUTE-SWAP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[4]['to'].toLowerCase() === address.toLowerCase() && list[4]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[4]['tokenInfo']['symbol']
        }
    }else if( list.length == 7  && list[0]['from'].toLowerCase() === address.toLowerCase()){
        translist += " SWAP "
        transall += "MUTE-SWAP->"
        if (list[1]['from'].toLowerCase() === address.toLowerCase() && list[1]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[1]['tokenInfo']['symbol']+'/'
        }
        if (list[5]['to'].toLowerCase() === address.toLowerCase() && list[5]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            translist += list[5]['tokenInfo']['symbol']
        }
    }
    
    return [translist, transall];
}

function getAmount(address, list, transall) {
    let translist = "";
    for (let i = 0; i < list.length; i++) {
        if (list[i]['from'].toLowerCase() === address.toLowerCase() && list[i]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            const symbol = list[i]['tokenInfo']['symbol']
            if (symbol === "ETH") {
                const usdPrice = list[i]['tokenInfo']['usdPrice']
                let totalExchangeAmount = parseInt(list[i]['amount'], 16) / 10 ** 18
                translist += "SWAP " + totalExchangeAmount.toFixed(4) + "ETH/"
                transall += "SWAP->"
            } else if (list[i]['tokenInfo']['symbol'] === "USDC") {
                let totalExchangeAmount = parseInt(list[i]['amount'], 16) / 10 ** 6
                translist += "SWAP " + totalExchangeAmount.toFixed(2) + "USDC/"
                transall += "SWAP->"
        }
        } else if (list[i]['to'].toLowerCase() === address.toLowerCase() && list[i]['from'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase()) {
            const symbol = list[i]['tokenInfo']['symbol']
            if (symbol === "ETH") {
                const usdPrice = list[i]['tokenInfo']['usdPrice']
                // let totalExchangeAmount = (parseInt(list[i]['amount'], 16) / 10 ** 18) * parseFloat(usdPrice)
                translist += "ETH"
            } else if (list[i]['tokenInfo']['symbol'] === "USDC") {
                // let totalExchangeAmount = parseInt(list[i]['amount'], 16) / 10 ** 6
                translist += "USDC"
            }
        }
        }
    return [translist, transall];
}

function GetDiffTime(date){
    const offset = 8;
    const utc8Date = new Date(date.getTime() + offset * 3600 * 1000);
    const now = new Date();
    const utc8Now = new Date(now.getTime() + offset * 3600 * 1000);
    const diff = utc8Now - utc8Date;
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays > 0) {
        return diffInDays + "天前"
    } else if (diffInHours > 0) {
        return diffInHours + "小时前"
    } else {
        return "刚刚"
    }
}

async function processTransactions(
    transall,
    translist,
    address,
    list,
    era_cz,
    era_zc,
    sync,
    izumi,
    mav,
    orbiter,
    mute,
    zns,
    eralend,
    velocore,
    spacefi
) {
    console.log(list);
    for (let i = 0; i < list.length; i++) {
        const status = list[i]['status'];
        const receivedDate = list[i]['receivedAt']
        const value = ethers.formatEther(list[i]['value'], "ether");
        const isL1Originated = list[i]['isL1Originated']
        const contractAddress = list[i]['to'];
        const fromAddress = list[i]['from'];
        const calldata = list[i]['data'];

        if(status !== "verified" && status !== "included" )continue;
        const receivedAt = new Date(Date.parse(receivedDate));
        // const transDate = GetDiffTime(receivedAt);
        const transDate = getDate(receivedAt);
        
        // console.log(i + 'isL1Originated:', list[i].isL1Originated);
        // console.log(i + 'contractAddress:', contractAddress);
        // console.log(i + 'initiatorAddress:', list[i].initiatorAddress);
        if (isL1Originated === true) {
            console.log('官方桥 转入', transDate, list[i]);
            era_cz += transDate + " 官方桥 转入" + (+value).toFixed(4) + "$;$"
            transall += "官方桥转入->"
        } else if (
            contractAddress ===
            "0x000000000000000000000000000000000000800a"
        ) {
            console.log('官方桥 转出:', transDate, list[i]);
            era_zc += transDate + " 官方桥 转出" + (+value).toFixed(4)  + "$;$"
            transall += "官方桥转出->"
        }else if(fromAddress.toLowerCase() === "0x888270ff52f486729ef865466340d4eac83a31d6".toLowerCase()){
            console.log('OK 转入:', transDate, list[i]);
            era_cz += transDate + " OK 转入 " + (+value).toFixed(4) + " ETH $;$"
            transall += "OK转入->"
        }else if ( /* orbiter*/
            availableProtocols.orbiter.includes(contractAddress.toLowerCase()) ||
            availableProtocols.orbiter.includes(fromAddress.toLowerCase())
        ) {
            console.log('orbiter:', transDate, list[i]);
            let target = "";
            if("0xbf3922a0cebbcd718e715e83d9187cc4bba23f11".toLowerCase() === contractAddress.toLowerCase() ){
                target = "STARK "
            }
            if(fromAddress.toLowerCase() === address.toLowerCase()
            ){
                era_zc += transDate + " ORB 转出 " + target + (+value).toFixed(4)  + " ETH $;$"
                transall += "ORB转出->"
            }else{
                era_cz += transDate + " ORB 转入 " + (+value).toFixed(4)  + " ETH $;$"
                transall += "ORB转入->"
            }
        }else if ( /* owlto*/
            availableProtocols.owlto.includes(contractAddress.toLowerCase()) ||
            availableProtocols.owlto.includes(fromAddress.toLowerCase())
        ) {
            console.log('owlto:', transDate, list[i]);
            if(fromAddress.toLowerCase() === address.toLowerCase()
            ){
                era_zc += transDate + " OWL 转出 " + (+value).toFixed(4)  + " ETH $;$"
                transall += "OWL转出->"
            }else{
                era_cz += transDate + " OWL 转入 " + (+value).toFixed(4)  + " ETH $;$"
                transall += "OWL转入->"
            }
            
            
        }else if ( /* BUNGEE*/
            availableProtocols.bungee.includes(contractAddress.toLowerCase()) ||
            availableProtocols.bungee.includes(fromAddress.toLowerCase())
        ) {
            console.log('BUNGEE:', transDate, list[i]);
            if(contractAddress.toLowerCase() === '0x7Ee459D7fDe8b4a3C22b9c8C7aa52AbadDd9fFD5'.toLowerCase()){
                era_zc += transDate + " BUNGEE REFUEL " + (+value).toFixed(4)  + " ETH $;$"
                transall += "BUNGEE转出->"
            }else{
                if(fromAddress.toLowerCase() === address.toLowerCase()
                ){
                    era_zc += transDate + " BUNGEE 转出 " + (+value).toFixed(4)  + " ETH $;$"
                    transall += "BUNGEE转出->"
                }else{
                    era_cz += transDate + " BUNGEE 转入 " + (+value).toFixed(4)  + " ETH $;$"
                    transall += "BUNGEE转入->"
                }
            }
        }else if ( /* gal*/
            availableProtocols.gal.includes(contractAddress.toLowerCase()) ||
            availableProtocols.gal.includes(fromAddress.toLowerCase())
        ) {
            console.log('gal:', transDate, list[i]);
            if(calldata.indexOf("1b87e")!=-1){
                translist += transDate + " 领取Karat NFT" + "$;$"
                transall += "领取Karat->"
            }else if(calldata.indexOf("1b923")!=-1){
                sync += transDate + " 领取银河徽章" + "$;$"
                transall += "领取SYNC徽章->"
            }else if(calldata.indexOf("15c7c")!=-1){
                mav += transDate + " 领取银河徽章" + "$;$"
                transall += "领取MAV徽章->"
            }else{
                console.log(transDate, list[i]);
            }
            
        }else if ( /* SYNCSWAP*/
            availableProtocols.syncswap.includes(contractAddress.toLowerCase()) ||
            availableProtocols.syncswap.includes(fromAddress.toLowerCase())
        ) {
            console.log('SYNCSWAP:', transDate, list[i]);
            let synctranslist = "";
            if(calldata.startsWith('0x7d10c9d6')){
                synctranslist += " 解LP"
                transall += "SYNC解LP->"
            }
            if(calldata.startsWith('0x94ec')){
                synctranslist += " 加LP "
                transall += "SYNC加LP->"
            }else if(calldata.startsWith('0x2cc4081e')){
                synctranslist += " SWAP "
                transall += "SYNC-SWAP->"
            }
            sync += transDate + synctranslist + "$;$"
            
        }else if ( /* OKXSWAP*/
            availableProtocols.okxswap.includes(contractAddress.toLowerCase()) ||
            availableProtocols.okxswap.includes(fromAddress.toLowerCase())
        ) {
            console.log("OKXSWAP:",transDate, list[i]);
            translist += transDate + "OkxSwap SWAP" + "$;$"
            transall += "OkxSwap->"
            
        }else if ( /* 1inch*/
            availableProtocols._1inch.includes(contractAddress.toLowerCase()) ||
            availableProtocols._1inch.includes(fromAddress.toLowerCase())
        ) {
            console.log("1inch:", transDate, list[i]);
            translist += transDate + "1inch SWAP" + "$;$"
            transall += "1inch SWAP->"
            
        } else if ( /* vesync*/
            availableProtocols.vesync.includes(contractAddress.toLowerCase()) ||
            availableProtocols.vesync.includes(fromAddress.toLowerCase())
        ) {
            console.log("vesync:", transDate, list[i]);
            translist += transDate + "veSync SWAP" + "$;$"
            transall += "veSync SWAP->"
            
        } else if ( /* IZUMI*/
            availableProtocols.izumi.includes(contractAddress.toLowerCase()) ||
            availableProtocols.izumi.includes(fromAddress.toLowerCase())
        ) {
            console.log('IZUMI:', transDate, list[i]);
            let transCode = calldata.substr(327,11)
            if(contractAddress.toLowerCase() === "0xed4a5bd232161a931c9cfbe930cea26125c31294".toLowerCase() ){
                if(fromAddress.toLowerCase() == address.toLowerCase()
                ){
                    transall += "IZUMI-加LP->"
                    izumi += transDate + " 加LP USDC/USDT " + "$;$"
                }else{
                    transall += "IZUMI-解LP->"
                izumi += transDate + " 解LP USDC/USDT " + "$;$"
                }
                
            }else if(contractAddress.toLowerCase() === "0x936c9a1b8f88bfdbd5066ad08e5d773bc82eb15f".toLowerCase() ){
                if(transCode == '16496f639ed'
                ){
                    transall += "IZUMI-加LP->"
                    izumi += transDate + " 加LP USDC/ETH " + "$;$"
                }else if(transCode == '22000000000'){
                    transall += "IZUMI-解LP->"
                    izumi += transDate + " 解LP USDC/ETH " + "$;$"
                }
                
            }else{
                if(transCode == '124115ff67e'){
                    transall += "IZUMI-SWAP->"
                    izumi += transDate +  " SWAP "+  (+value).toFixed(4) + " ETH/USDC $;$"
                }else if(transCode == '12475ceafe6'){
                    transall += "IZUMI-SWAP->"
                    izumi += transDate +  " SWAP USDC/ETH $;$"
                }
                
            }
        } else if ( /* MAV*/
            availableProtocols.maverick.includes(contractAddress.toLowerCase()) ||
            availableProtocols.maverick.includes(fromAddress.toLowerCase())
        ) {
            console.log('MAV:', transDate, list[i]);
            if('0xa54ff4b1005df3a180da8d2d310afd5589117182'.toLowerCase() === contractAddress.toLowerCase()){
                mav += transDate + "领取MAV空投"  + "$;$"
                transall += "领MAV空投->"
            }else{
                let mavtranslist = " ";
                const transcode = [
                    '0e427dbbf70', // ETH SWAP
                    '104a5dcbcdf',//ERC20 SWAP
                    '7c479b28ef3', //LP
                    '124c04b8d59'
                ]
                if(calldata.startsWith("0xac9650d8")){
                    for(let i=0;i<transcode.length;i++){
                        let index = calldata.indexOf(transcode[i]);
                        // console.log('index:', transcode[i], index);
                        if(index!=-1){
                            const cur1 = calldata.substr(index+35,40)
                            const cur2 = calldata.substr(index+99,40)
                            
                            if(transcode[i] == '7c479b28ef3'){
                                mavtranslist += "加LP "+getCurName(cur1)
                            }else {
                                mavtranslist += "SWAP "+getCurName(cur1)+"/"+getCurName(cur2)
                            }
                            break;
                        }
                    }
                }else if(calldata.startsWith("0x095ea7b3")){
                    mavtranslist += "解LP "
                }
                mav += transDate + mavtranslist  + "$;$"
                transall += mavtranslist + "->"
            }
            
        }else if ( /* Mute.io*/
            availableProtocols.muteio.includes(contractAddress.toLowerCase()) ||
            availableProtocols.muteio.includes(fromAddress.toLowerCase())
        ) {
            console.log('Mute.io:', transDate, list[i]);
            if(calldata.startsWith("0x51cbf10f")){
                mute += transDate + " SWAP ETH/USDC" + "$;$"
                transall += "MUTE-SWAP->"
            }else if(calldata.startsWith("0x3a8e53ff")){
                mute += transDate + " 加LP " + "$;$"
                transall += "MUTE-加LP->"
            }else if(calldata.startsWith("0xaac57b19")){
                mute += transDate + " 解LP " + "$;$"
                transall += "MUTE-解LP->"
            }
        }else if ( /* zkSync Name Service*/
            availableProtocols.zns.includes(contractAddress.toLowerCase()) ||
            availableProtocols.zns.includes(fromAddress.toLowerCase())
        ) {
            console.log('ZNS:', transDate, list[i]);
            zns += transDate + " 注册ZNS域名 "  + "$;$"
            transall += "注册ZNS域名->"
        }else if ( /* ERA域名*/
            availableProtocols.era.includes(contractAddress.toLowerCase()) ||
            availableProtocols.era.includes(fromAddress.toLowerCase())
        ) {
            console.log('ERA域名:', transDate, list[i]);
            zns += transDate + " 注册ERA域名 "  + "$;$"
            transall += "注册ERA域名->"
        }else if ( /* zkS 域名*/
            availableProtocols.zks.includes(contractAddress.toLowerCase()) ||
            availableProtocols.zks.includes(fromAddress.toLowerCase())
        ) {
            console.log('zkS 域名:', transDate, list[i]);
            if(contractAddress.toLowerCase() === "0xCBE2093030F485adAaf5b61deb4D9cA8ADEAE509".toLowerCase()){
                zns += transDate + " 注册ZKS域名 "  + "$;$"
                transall += "注册ZKS域名->"
            }
            
        }else if ( /* overnight USD+*/
            availableProtocols.overnight.includes(contractAddress.toLowerCase()) ||
            availableProtocols.overnight.includes(fromAddress.toLowerCase())
        ) {
            console.log("overnight：",transDate, list[i]);
            if(contractAddress.toLowerCase() === "0x84d05333f1F5Bf1358c3f63A113B1953C427925D".toLowerCase()){
                translist += transDate + " MINT USD+ "  + "$;$"
                transall += "MINT USD+->"
            }
            
        }else if ( /* openocean*/
            availableProtocols.openocean.includes(contractAddress.toLowerCase()) ||
            availableProtocols.openocean.includes(fromAddress.toLowerCase())
        ) {
            console.log("openocean：",transDate, list[i]);
            translist += transDate + " OPENOCEAN "  + "$;$"
            transall += "OPENOCEAN->"
            
        }else if ( /* MintSquare*/
            availableProtocols.mintsquare.includes(contractAddress.toLowerCase()) ||
            availableProtocols.mintsquare.includes(fromAddress.toLowerCase())
        ) {
            console.log("MintSquare:",transDate, list[i]);
            translist += transDate + " mintsquare "  + "$;$"
            transall += "mintsquare->"
        }else if ( /* Velocore*/
            availableProtocols.velocore.includes(contractAddress.toLowerCase()) ||
            availableProtocols.velocore.includes(fromAddress.toLowerCase())
        ) {
            console.log("Velocore:",transDate, list[i]);
            velocore += transDate + " velocore "  + "$;$"
            transall += "velocore->"
        }else if ( /* spacefi */
            availableProtocols.spacefi.includes(contractAddress.toLowerCase()) ||
            availableProtocols.spacefi.includes(fromAddress.toLowerCase())
        ) {
            console.log("spacefi:",transDate, list[i]);
            spacefi += transDate + " spacefi "  + "$;$"
            transall += "spacefi->"
        }else if ( /* airdrop */
            availableProtocols.airdrop.includes(contractAddress.toLowerCase()) ||
            availableProtocols.airdrop.includes(fromAddress.toLowerCase())
        ) {
            if(contractAddress.toLowerCase() == '0x9aa48260dc222ca19bdd1e964857f6a2015f4078'.toLowerCase()){
                // console.log("zkape:",transDate, list[i]);
                translist += transDate + " 领取zkape空投 "  + "$;$"
                transall += "领取zkape空投->"
            }else if(contractAddress.toLowerCase() == '0x58DE0595D262533B564B2b8961C104042e390922'.toLowerCase()){
                // console.log("ppt:",transDate, list[i]);
                translist += transDate + " 领取ppt空投 "  + "$;$"
                transall += "领取ppt空投->"
            }
            
        }else if ( /* zk域名 */
            availableProtocols.zk.includes(contractAddress.toLowerCase()) ||
            availableProtocols.zk.includes(fromAddress.toLowerCase())
        ) {
            console.log("zk域名:",transDate, list[i]);
            zns += transDate + " 注册zk域名 "  + "$;$"
            transall += "注册zk域名->"
        }else if ( /* karat */
            availableProtocols.karat.includes(contractAddress.toLowerCase()) ||
            availableProtocols.karat.includes(fromAddress.toLowerCase())
        ) {
            console.log("karat:",transDate, list[i]);
            translist += transDate + " 领取Karat Claimer "  + "$;$"
            transall += "领取Karat->"
        }else if ( /* mintdao */
            availableProtocols.mintdao.includes(contractAddress.toLowerCase()) ||
            availableProtocols.mintdao.includes(fromAddress.toLowerCase())
        ) {
            console.log("mintdao:",transDate, list[i]);
            translist += transDate + " 领取MintDao Hunter "  + "$;$"
            transall += "MintDao->"
        }else if ( /* tevaera */
            availableProtocols.tevaera.includes(contractAddress.toLowerCase()) ||
            availableProtocols.tevaera.includes(fromAddress.toLowerCase())
        ) {
            console.log("tevaera:",transDate, list[i]);
            if('0xd29aa7bdd3cbb32557973dad995a3219d307721f'.toLowerCase() === contractAddress.toLowerCase()){
                translist += transDate + " MINT Tevaera NFT "  + "$;$"
                transall += "Tevaera->"
            }
            
        }else if ( /* ODOS */
            availableProtocols.odos.includes(contractAddress.toLowerCase()) ||
            availableProtocols.odos.includes(fromAddress.toLowerCase())
        ) {
            console.log("odos:",transDate, list[i]);
            translist += transDate + " ODOS SWAP "  + "$;$"
            transall += "ODOS SWAP->"
            
        }else if ( /* ezkalibur */
            availableProtocols.ezkalibur.includes(contractAddress.toLowerCase()) ||
            availableProtocols.ezkalibur.includes(fromAddress.toLowerCase())
        ) {
            console.log("ezkalibur:",transDate, list[i]);
            translist += transDate + " ezkalibur SWAP "  + "$;$"
            transall += "ezkalibur SWAP->"
            
        }else if ( /* onchainTrade */
            availableProtocols.onchaintrade.includes(contractAddress.toLowerCase()) ||
            availableProtocols.onchaintrade.includes(fromAddress.toLowerCase())
        ) {
            console.log("onchainTrade:",transDate, list[i]);
            if(calldata.startsWith('0x239d5928') ){
                translist += transDate + " OnChain OPEN"  + "$;$"
                transall += "OnChain OPEN->"
            }else if(calldata.startsWith('0xacbeeaa9')){
                translist += transDate + " OnChain CLOSE"  + "$;$"
                transall += "OnChain CLOSE->"
            }else if(calldata.startsWith('0x86385699')){
                translist += transDate + " OnChain SWAP"  + "$;$"
                transall += "OnChain SWAP->"
            }
        }else if ( /* rollup */
            availableProtocols.rollup.includes(contractAddress.toLowerCase()) ||
            availableProtocols.rollup.includes(fromAddress.toLowerCase())
        ) {
            console.log("rollup:",transDate, list[i]);
            if(calldata.startsWith('0x5b88e8c6') ){
                translist += transDate + " ROLLUP OPEN"  + "$;$"
                transall += "ROLLUP OPEN->"
            }else if(calldata.startsWith('0x574ec1be')){
                translist += transDate + " ROLLUP CLOSE"  + "$;$"
                transall += "ROLLUP CLOSE->"
            }else if(calldata.startsWith('0x86385699')){
                translist += transDate + " ROLLUP SWAP"  + "$;$"
                transall += "ROLLUP SWAP->"
            }
        }else if ( /* satori */
            availableProtocols.satori.includes(contractAddress.toLowerCase()) ||
            availableProtocols.satori.includes(fromAddress.toLowerCase())
        ) {
            console.log("satori:",transDate, list[i]);
            if(calldata.startsWith('0xf17a4546') ){
                translist += transDate + " Satori 存入USDC"  + "$;$"
                transall += "Satori 存入USDC->"
            }else if(calldata.startsWith('0x72f66b67')){
                translist += transDate + " Satori OPEN"  + "$;$"
                transall += "ROLLUP OPEN->"
            }else if(calldata.startsWith('0x86385699')){
                translist += transDate + " Satori CLOSE"  + "$;$"
                transall += "ROLLUP CLOSE->"
            }else if(calldata.startsWith('0x83a7abd8')){
                translist += transDate + " Satori 取出USDC"  + "$;$"
                transall += "ROLLUP 取出->"
            }
        }else if ( /* reactor*/
            availableProtocols.reactor.includes(contractAddress.toLowerCase()) ||
            availableProtocols.reactor.includes(fromAddress.toLowerCase())
        ) {
            console.log("reactor:",transDate, list[i]);
            if('0x1181d7be04d80a8ae096641ee1a87f7d557c6aeb'.toLowerCase() === contractAddress.toLowerCase() ){
                if(calldata.startsWith('0xa0712d68') ){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " REACT存入 " + amt.toFixed(0)  + " USDC $;$"
                    transall += "REACT存入USDC->"
                }else if(calldata.startsWith('0xc5ebeaec')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " REACT借出 " + amt.toFixed(0)  + " USDC $;$"
                    transall += "REACT借出USDC->"
                }else if(calldata.startsWith('0x0e752702')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " REACT归还 " + amt.toFixed(0)  + " USDC $;$"
                    transall += "REACT归还USDC->"
                }else if(calldata.startsWith('0xdb006a75')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " REACT提取 " + amt.toFixed(0)  + " USDC $;$"
                    transall += "REACT提取USDC->"
                }
                
            }else if('0x1bbd33384869b30a323e15868ce46013c82b86fb'.toLowerCase() === contractAddress.toLowerCase() ){
                if(calldata.startsWith('0xc5ebeaec') ){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " REACT借出 " + amt.toFixed(4)  + " ETH $;$"
                    transall += "REACT借出ETH->"
                }else if(calldata.startsWith('0x1249c58b')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " REACT存入 " + amt.toFixed(4)  + " ETH $;$"
                    transall += "REACT存入ETH->"
                }else if(calldata.startsWith('0x4e4d9fea')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " REACT归还 " + amt.toFixed(4)  + " ETH $;$"
                    transall += "REACT归还ETH->"
                }else if(calldata.startsWith('0x852a12e3')){
                    let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " REACT提取 " + amt.toFixed(4)  + " ETH $;$"
                    transall += "REACT提取ETH->"
                }
                
            }
            
        } else if ( /* eraLend */
            availableProtocols.eralend.includes(contractAddress.toLowerCase()) ||
            availableProtocols.eralend.includes(fromAddress.toLowerCase())
        ) {
            console.log("eraLend:",transDate, list[i]);
            if('0x1181d7be04d80a8ae096641ee1a87f7d557c6aeb'.toLowerCase() === contractAddress.toLowerCase() ){
                if(calldata.startsWith('0xa0712d68') ){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " ERA存入 USDC $;$"
                    transall += "ERA存入USDC->"
                }else if(calldata.startsWith('0xc5ebeaec')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " ERA借出 USDC $;$"
                    transall += "ERA借出USDC->"
                }else if(calldata.startsWith('0x0e752702')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " ERA归还 USDC $;$"
                    transall += "ERA归还USDC->"
                }else if(calldata.startsWith('0x852a12e3')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " ERA提取 USDC $;$"
                    transall += "ERA提取USDC->"
                }
                
            }else if('0x1bbd33384869b30a323e15868ce46013c82b86fb'.toLowerCase() === contractAddress.toLowerCase() ){
                if(calldata.startsWith('0xc5ebeaec') ){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " ERA借出 ETH $;$"
                    transall += "ERA借出ETH->"
                }else if(calldata.startsWith('0x1249c58b')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " ERA存入 ETH $;$"
                    transall += "ERA存入ETH->"
                }else if(calldata.startsWith('0x4e4d9fea')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " ERA归还 ETH $;$"
                    transall += "ERA归还ETH->"
                }else if(calldata.startsWith('0x852a12e3')){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 18
                    eralend += transDate + " ERA提取 ETH $;$"
                    transall += "ERA提取ETH->"
                }
                
            }else if('0x80115c708E12eDd42E504c1cD52Aea96C547c05c'.toLowerCase() === contractAddress.toLowerCase() ){
                if(calldata.startsWith('0xa0712d68') ){
                    // let amt = parseInt(list[i]['erc20Transfers'][1]['amount'], 16) / 10 ** 6
                    eralend += transDate + " ERA存入 SYNCLP $;$"
                    transall += "ERA存入SYNCLP->"
                }
            }
            
        }else if( //授权
            availableProtocols.tokenpermit.includes(contractAddress.toLowerCase())
        ) {
            /*什么都不做 */
        }
        else{
            
            if (fromAddress.toLowerCase() === address.toLowerCase()) {
                if ( /* layerSwap */
                    calldata == "0x"
                ){
                    era_zc += transDate + " layerSwap转出 " + (+value).toFixed(4)  + " ETH $;$"
                    transall += "layerSwap转出->"
                }
                else{
                    console.log('其他:',transDate, list[i]);
                    let othertranslist = "";
                    //[othertranslist, transall] = getAmount(address, list[i]['erc20Transfers'], transall)
                    translist += transDate + othertranslist  + "$;$"
                }
                
            }
        }
    }
    return [transall, translist, era_cz, era_zc, sync, izumi, mav, orbiter,
        mute,
        zns,
        eralend,
        velocore,
        spacefi];
}

async function getZkSyncTrans(address) {
    try {
        let translist = "";
        let transall = "";
        let era_cz = "";
        let era_zc = "";
        let sync = "";
        let izumi = "";
        let mav = "";
        let orbiter = "";
        let mute = "";
        let zns = "";
        let eralend = "";
        let velocore = "";
        let spacefi = "";
        const initUrl = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=1`;
        const response = await axios.get(initUrl)
        const pageValue = parseInt(response.data.meta.totalPages);
        for (let i = 1; i <= pageValue; i++) {
            const url = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=${i}`;
            const response = await axios.get(url);
            const list = response.data.items;
            [transall, translist, era_cz, era_zc, sync, izumi, mav, orbiter,
                mute,
                zns,
                eralend,
                velocore,
                spacefi] =
                await processTransactions(
                    transall,
                    translist,
                    address,
                    list,
                    era_cz,
                    era_zc,
                    sync,
                    izumi,
                    mav,
                    orbiter,
                    mute,
                    zns,
                    eralend,
                    velocore,
                    spacefi
                );
        }
        return {
            transall,
            translist,
            era_cz,
            era_zc,
            sync,
            izumi,
            mav,
            orbiter,
            mute,
            zns,
            eralend,
            velocore,
            spacefi
        }
    } catch (e) {
        console.log(e);
        return {
            transall: "Error",
            translist: "Error",
            era_cz: "Error",
            era_zc: "Error",
            sync: "Error",
            izumi: "Error",
            mav: "Error",
            orbiter: "Error",
            mute: "Error",
            zns: "Error",
            eralend: "Error",
            velocore: "Error",
            spacefi: "Error",
        }
    }
}

export default getZkSyncTrans;
