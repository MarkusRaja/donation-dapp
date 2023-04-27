import { getDefaultProvider, ethers } from "ethers";
const fetchD = async (contractAddress, contractABI) => {
    const ethereum = window.ethereum;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await dcontract.syncdonation({ gasLimit: 300000});
    return {waveTxn, dcontract};
}
const connectD = async () => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      alert('Install MetaMask');
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // sign hashed message
    
    return address;
  }
  const countQadd = async (qaddress, waveTxn) => {
    const cpost = waveTxn.reduce((count, data) => {
      if (data.provider.toLowerCase() === qaddress) {
        return count + 1;
      } else {
        return count;
      }
    }, 0);
    return {cpost, tokenIds};
  }
export {connectD, fetchD, countQadd};