document.getElementById('wallet-balance-form').addEventListener('submit', async (event) => {
    // cancel send form
    event.preventDefault();

    // get inputAddress
    const inputAddress = document.getElementById('wallet-addr').value;

    try{
        // send Address to Server
        const serverResponse = await fetch('/get_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: inputAddress}),
        });

        if (serverResponse.ok) {
            const { balanceETH, balanceUSD, priceUSD, balanceMNBC, allowanceMNBC } = await serverResponse.json();

            document.getElementById('eth-balance').textContent = balanceETH;
            document.getElementById('usd-balance').textContent = balanceUSD.toFixed(2);
            document.getElementById('eth-usd-rate').textContent = `${priceUSD} USD/ETH`;
            document.getElementById('mnbc-balance').textContent = balanceMNBC;
           // document.getElementById('output').style.display = 'block';
        } else {
           // document.getElementById('output').style.display = 'none';
            alert('Error: please check address');
        }
    } catch (err) {
        //console.error(err);
        //document.getElementById('output').style.display = 'none';
        alert('Error: send Address to Server');
    }
});



document.getElementById('allowance-form').addEventListener('submit', async (event) => {
    // cancel send form
    event.preventDefault();

    try{
        // send Address to Server
        const serverResponse = await fetch('/get_allowance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: "",
        });
        console.log("serverresponse: ",serverResponse);

        if (serverResponse.ok) {
            const { addr01,allow01,mnbc01,eth01,addr02,allow02,mnbc02,eth02 } = await serverResponse.json();
            console.log("json: ",addr01,allow01,mnbc01,eth01,addr02,allow02,mnbc02,eth02);

            document.getElementById('OWNER_ADDRESS01').textContent = addr01;
            document.getElementById('ALLOWANCE01').textContent = allow01;
            document.getElementById('BALANCEMNBC01').textContent = mnbc01;
            document.getElementById('BALANCEETH01').textContent = eth01;
            document.getElementById('OWNER_ADDRESS02').textContent = addr02;
            document.getElementById('ALLOWANCE02').textContent = allow02;
            document.getElementById('BALANCEMNBC02').textContent = mnbc02;
            document.getElementById('BALANCEETH02').textContent = eth02;

        }

    } catch (err) {
        console.error(err);
    }

});







document.getElementById('manabit-list-form').addEventListener('submit', async (event) => {
    // cancel send form
    event.preventDefault();

    try{
        // send Address to Server
        const serverResponse = await fetch('/get_manabit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '',
        });
        console.log("serverresponse: ",serverResponse);

        if (serverResponse.ok) {
            null;
        }

    } catch (err) {
        null;
    }

});