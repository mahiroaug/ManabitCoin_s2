axios.get('http://localhost:8080/contracts/ManabitCoin.sol/ManabitCoin.json')
  .then(response => {
    var jsonData = response.data;
    console.log(jsonData);
  })
  .catch(error => {
    console.log('Error:', error);
  });
