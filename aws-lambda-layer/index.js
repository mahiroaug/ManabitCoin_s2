const SecretsManager = require('lib/secretsManager.js');
const manabitCC = require('lib/aws-web3-manabit.js') //CC=Contract Call



exports.handler = async (event, context) => {

    const secretName = 'web3-manaBit-ssm';
    const region = 'ap-northeast-1';
    const secrets = await SecretsManager.getSecret(secretName, region);

    let output;
    switch(event.action){
        case 'getOwnerBalance':
            output = await _getOwnerBalance(event);
            break;

        case 'getAccountBalance':
            output = await _getAccountBalance(event);
            break;

        case 'getAllowance':
            output = await _getAllowance(event);
            break;

        case 'approveGacha':
            output = await _approveGacha(event);
            break;

        case 'transferMNBC':
            output = await _transferMNBC(event);
            break;

        case 'sendManabit':
            output = await _sendManabit(event);
            break;
    
    }


    const response = {
        event: event, // 呼び出し元からの情報
        context: context, // コンテキスト情報
        statusCode: 200,
        headers: {
            'x-custom-header': 'custom header value'
        },
        body: JSON.stringify({
            output: output,
        })
    };

    return response;
};


/////////////////// GET(Call) Funtion /////////////////////


// オーナーの残高を取得 ***未完成***
async function _getOwnerBalance (event) {
    // Ownerアドレスを取得

    return
    //const result = await manabitCC.getAccountBalance(address);
    //return result;
}


// 指定アドレスの残高を取得
async function _getAccountBalance (event) {
    // address
    const address = event.param.to_address;
    const result = await manabitCC.getAccountBalance(address);
    return result;
}

// 指定アドレスのallowanceを取得
async function _getAllowance (event) {
    // address
    const address = event.param.to_address;
    const result = await manabitCC.getAllowance(address);
    return result;
}


/////////////////// SET(send) Funtion /////////////////////


// GACHAコントラクトに指定量(MNBC)をApprove
async function _approveGacha (event) {
    // 指定量(MNBC)チェック
    const amount = event.param.amount;

    if(amount > 1000){
        console.error('the approve amount exceeds the upper limit')
        return
    }

    const result = await manabitCC.approveGacha(amount);
    return result;
}


// MNBC転送 ****未完成
async function _transferMNBC(event) {
    // TO DO
    return
}




// manabit送信
async function _sendManabit (event) {
    // to_address,指定量(MNBC),コメントをチェック
    const address = event.param.to_address;
    const amount = event.param.amount;
    const comment = event.param.comment;

    // MNBC指定上限
    if(amount > 30){
        console.log('change the amount to the upper limit from ',amount)
        amount = 30
    }

    const result = await manabitCC.sendManabit(address, amount, comment);
    return result;
}
