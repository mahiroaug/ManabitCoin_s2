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
            document.getElementById('mnbc-allowance').textContent = allowanceMNBC;
            document.getElementById('output').style.display = 'block';
        } else {
            document.getElementById('output').style.display = 'none';
            alert('Error: please check address');
        }
    } catch (err) {
        //console.error(err);
        document.getElementById('output').style.display = 'none';
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
            body: '',
        });

        if (serverResponse.ok) {
            const { addr01, allowance01, addr02, allowance02 } = await serverResponse.json();

            document.getElementById('OWNER_ADDRESS01').textContent = addr01;
            document.getElementById('ALLOWANCE01').textContent = allowance01;
            document.getElementById('OWNER_ADDRESS02').textContent = addr02;
            document.getElementById('ALLOWANCE02').textContent = allowance02;

            //document.getElementById('output').style.display = 'block'
        }

    } catch (err) {
        console.error(err);
        //document.getElementById('output').style.display = 'none'
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

        if (serverResponse.ok) {
            document.getElementById('output').style.display = 'block'
        }

    } catch (err) {
        document.getElementById('output').style.display = 'none'
    }

});