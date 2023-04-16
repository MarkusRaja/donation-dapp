import 'bootstrap/dist/css/bootstrap.css';
import '@/styles/globals.css'
import './style.css'
import Link from 'next/link'
import Web3 from 'web3';
import {Nav} from "react-bootstrap";
import Head from 'next/head'
import abi from "../abi/Donation.json";
import { ethers } from "ethers";
import {connectD, fetchD} from "../services/aio";
import { Fragment, useState, useEffect } from 'react';
export default function App({ Component, pageProps }) {
  const appid = 43113;
  const currencyD = "AVAX";
  const contractAddress = "0x4003C8D1CcD6A30D97E9622642e4C0CF51fbd920";
  const contractABI = abi.abi;
  const [address, setAddress] = useState('');
  const [myPosts, setMyposts] = useState(0);
  const [allPosts, setPosts] = useState([]);
  const [rewardId, setRewardid] = useState([]);
  const [changed, setChanged] = useState(false);
  const [networkid, setNid] = useState('');
  const connect = async () => {
    const address1 = await connectD();

    // sign hashed message
    
    setAddress(address1);
  }
  const syncW = async () => {
    if (!address) {
      return;
    }
    const tokenIds = [];
    const fetchData = await fetchD(contractAddress, contractABI);
    const waveTxn = fetchData.waveTxn;
    const dcontract = fetchData.dcontract;
    for(let i = 0; i <= waveTxn.length - 1 ; i++){
      const rid = await dcontract.ownerOf(Number(waveTxn[i].rewardid._hex));
      
      if(address == rid.toLowerCase()){
        tokenIds.push(Number(waveTxn[i].rewardid._hex));
      }
    }
    const cpost = waveTxn.reduce((count, data) => {
      if (data.provider.toLowerCase() === address) {
        return count + 1;
      } else {
        return count;
      }
    }, 0);
    setMyposts(cpost);
    setRewardid(tokenIds);
    return {cpost, waveTxn, tokenIds, dcontract}
  };
  async function detectNetwork1(rload) {
    try{
      const provider = new ethers.providers.Web3Provider(ethereum);
          const { chainId } = await provider.getNetwork()
          if (chainId != appid) {
            if(changed == false){
              const changeN = await detectNetwork(rload);
              await changeN.wait();
              setChanged(true);
            }
          }
          else{
            setNid(chainId);
            setChanged(false);
          }
    }
    catch(err){

    }
    

  }
  async function detectNetwork(rload) {
    try {
      console.log(networkid)
      const provider = new ethers.providers.Web3Provider(ethereum);
      const { chainId } = await provider.getNetwork()
      if (chainId != appid) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: Web3.utils.toHex(appid) }]
          }).then(() => {
            if(rload == true){
              window.location.reload();
            }
          });
          
        } catch (err) {
            // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            document.getElementById("switchN").style.display = "block";
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: 'Avalanche Testnet C-Chain',
                  chainId: Web3.utils.toHex(appid),
                  nativeCurrency: { name: 'Avalanche', decimals: 18, symbol: 'AVAX' },
                  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://testnet.snowtrace.io/']
                }
              ]
            }).then(() => {
              if(rload == true){
                window.location.reload();
              }
            });
          }
        }
      }
      setNid(chainId);
      console.log(networkid);
    } catch (err) {
      console.log(err.message);
    }
  }
  async function switchN() {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const { chainId } = await provider.getNetwork()
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainName: 'Avalanche Testnet C-Chain',
          chainId: Web3.utils.toHex(appid),
          nativeCurrency: { name: 'Avalanche', decimals: 18, symbol: 'AVAX' },
          rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
          blockExplorerUrls: ['https://testnet.snowtrace.io/']
        }
      ]
    }).then(() => {
      setNid(chainId);
      window.location.reload();
    });
  }
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap');
  }, []);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
    detectNetwork1(false);
        }
      })
  }, [address, networkid]);
  return (
    <div>
      {networkid == appid && (
        <div>
          <Nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom box-shadow mb-3">
              <div className="ms-3">
                <div className="navbar-brand text-success fw-bold">
                Donation DAPP
              </div>
              </div>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                  <span className="navbar-toggler-icon"></span>
              </button>

              <div className="container-fluid ">
                  <div className="d-none d-lg-block"></div>
                  <div>
                      <div className="collapse navbar-collapse text-nowrap" id="navbarSupportedContent">
                          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                              <li className="nav-item active">
                                  <Link href="/" id="nav-home" className="nav-link text-uppercase nav-hover-green">
                                    <div>Home</div>
                                    </Link>
                              </li>
                              <li className="nav-item">
                                  <Link href={`/posts/${address}`} className="nav-link text-uppercase nav-hover-green">
                                    <div>My Posts {myPosts > 0 && <span className='px-1 rounded-1 bg-success text-white'>{myPosts}</span>}</div>
                                    </Link>
                              </li>
                              <li className="nav-item">
                                  <Link href={`/reward/${address}`} className="nav-link text-uppercase nav-hover-green">
                                    <div>My Rewards {rewardId.length > 0 && <span className='px-1 rounded-1 bg-success text-white'>{rewardId.length}</span>}</div>
                                    </Link>
                              </li>
                              
                          </ul>
                          <ul className='ms-auto mb-sm-2 mb-lg-0'>
                            <li className="nav-item d-block">
                                    <Link href={`/create-post`} className="nav-link text-uppercase nav-hover-green">
                                      <div className='px-2 rounded-pill bg-success text-white fs-4 text-center'>+</div>
                                      </Link>
                                </li>
                          </ul>
                      </div>
                  </div>
              </div>
          </Nav>
        <Component {...pageProps} connect={connect} address={address} syncW={syncW} contractAddress={contractAddress} contractABI={contractABI} currencyD={currencyD} />
        </div>
      )}
      {networkid != appid && (
      <div>
      <Head>
        <title>Swithing Network</title>
      </Head>
      <div>
        <h1>PLEASE CLICK SWITCH NETWORK ON METAMASK POP UP WINDOW</h1>
        <button id='switchN' type='button' className="btn btn-success mb-3" onClick={switchN}>Add Network</button>
        <div>{networkid}</div>
      </div>
      </div>
    )}
    </div>
      
  )
}
