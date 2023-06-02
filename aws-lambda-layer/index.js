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

        case 'sendManabit':
            output = await _sendManabit(event);
            break;
    
    }


    const response = {

        title: 'Hello, world',
        output: output,
        event: event, // 呼び出し元からの情報
        context: context, // コンテキスト情報

        // Amazon API Gatewayを利用してLambda関数をWebAPI化するときは
        // 必要に応じisBase64Encoded,statusCode,headers,bodyをセット
        statusCode: 200,
        headers: {
            'x-custom-header': 'custom header value'
        },
        body: JSON.stringify({
            title: 'Hello, world',
            output: output,
        })
    };

    return response;
};


/////////////////// GET(Call) Funtion /////////////////////


// オーナーの残高を取得
async function _getOwnerBalance (event) {
    const result = await manabitCC.getOwnerBalance();
    return result;
}


// 指定アドレスの残高を取得
async function _getAccountBalance (event) {
    // address健全性を確認する処理


    const result = await manabitCC.getAccountBalance(address);
    return result;
}

// 指定アドレスのallowanceを取得
async function _getAllowance (event) {
    // address健全性を確認する処理


    const result = await manabitCC.getAllowance(to_address);
    return result;
}


/////////////////// SET(send) Funtion /////////////////////


// GACHAコントラクトに指定量(MNBC)をApprove
async function _approveGacha (event) {
    // 指定量(MNBC)チェック


    const result = await manabitCC.approveGacha(amount);
    return result;
}

// manabit送信
async function _sendManabit (event) {
    // to_address,指定量(MNBC),コメントをチェック


    const result = await manabitCC.sendManabit(to_address, amount, comment);
    return result;
}


