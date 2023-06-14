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
            const { balanceETH, balanceUSD, priceUSD } = await serverResponse.json();

            document.getElementById('eth-balance').textContent = balanceETH;
            document.getElementById('usd-balance').textContent = balanceUSD.toFixed(2);
            document.getElementById('eth-usd-rate').textContent = `${priceUSD} USD/ETH`;
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