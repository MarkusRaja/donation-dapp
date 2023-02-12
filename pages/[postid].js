import Head from 'next/head'
import { ethers } from "ethers";
import Web3 from 'web3';
import { useRouter } from "next/router";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image  } from '@chakra-ui/react'
import axios from 'axios'
import abi from "../abi/Donation.json";
export default function PostDetail() {
  const appid = 43113;
  const [networkid, setNid] = useState('');
  const [title, setTitle] = useState('');
  const [newDesc, setNewdesc] = useState('');
  const [newMax, setNewmax] = useState('');
  const [nftImg, setnftImg] = useState(null);
  const [dateNow, setDatenow] = useState(null);
  const [veth, setVeth] = useState('');
  const [PID, setPID] = useState('');
  const [PID1, setPID1] = useState('');
  const [address, setAddress] = useState('');
  const [addressP, setAddressp] = useState('');
  const [loaded, setLoad] = useState(0);
  const [allPosts, setPosts] = useState([]);
  const [allDonors1, setDonors1] = useState([]);
  const [changed, setChanged] = useState(false);
  const contractAddress = "0x15A2aEC6308E2b5E21b4c7bBFB3eDe6A2043e835";
  const contractABI = abi.abi;
  const router = useRouter();
  const { postid } = router.query;
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          const intervalId = setInterval(() => {
            setDatenow(new Date());
          }, 1000);
          detectNetwork1(false);
          return () => clearInterval(intervalId);
        }
      });

  }, [address, dateNow, networkid]);
  useEffect(() => {
    connect()
      .then(() => {
        if (address && networkid == appid) {
          syncD();
        //   getTrans();
        }
      });

  }, [address, networkid]);
  
  async function detectNetwork1(rload) {
    try{
      const provider = new ethers.providers.Web3Provider(ethereum);
          const { chainId } = await provider.getNetwork()
          if (chainId != appid) {
            if(changed == false){
              detectNetwork(rload);
              setChanged(true)
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
  const connect = async () => {
    const ethereum = window.ethereum;

    if (!ethereum) {
      alert('Install MetaMask');
      return;
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    // sign hashed message
    
    setAddress(address);
  }
  const donateNow = async () => {
    await connect();
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await dcontract.gotMoney(parseInt(postid), { gasLimit: 300000, value: ethers.utils.parseEther(veth)});
  };
  const postNow = async () => {
    await connect();
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await dcontract.createpost(newtitle, newDesc, parseInt(newMax), { gasLimit: 300000});
    await waveTxn.wait();
    syncD();
  };
  const syncD = async () => {
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn1 = await dcontract.syncdonation({ gasLimit: 300000});
    console.log(waveTxn1);
    setPosts(waveTxn1);
    console.log(postid);
    setTitle(waveTxn1[postid].title);
    const tokenUri = await dcontract.tokenURI(Number(waveTxn1[postid].rewardid._hex))
    const meta = await axios.get(tokenUri)
    setnftImg(meta.data.image);
    console.log(allPosts);
    console.log(postid);
    setLoad(1);
    // console.log(allPosts[parseInt(postid)].transactions)
  };
  const liatD = async () => {
    console.log(allPosts);
    // console.log(allPosts[parseInt(postid)].transactions)
  };
  const getTrans = async () => {
    
    await syncD();
    const wavesCleaned = allPosts[postid].transactions.map(donor => {
        
      return {
        donortime: donor.donortime,
        donors: donor.donors,
        valueofdonors: donor.valueofdonors
      };
    });
    setAddressp(allPosts[postid].provider);
    setDonors1(wavesCleaned);
  };
  return (
    <div>
      {networkid == appid && (
      <div>
      <Head>
        <title>{title}</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold underline">
          Donation DAPP
        </h1>
        <ChakraProvider>
        <Grid templateColumns='repeat(5, 1fr)' w = "-webkit-fit-content" paddingTop={"2%"}>
          {allPosts.map((post, i) => {
                  if (i == postid){
                      return (
                          <GridItem borderRadius ="md" boxSize="-moz-min-content" bg='silver' key={i}>
                          <Image
                            boxSize="-webkit-fit-content"
                            objectFit="contain"
                            src={post.imgurl}
                            alt={post.title}
                            borderRadius ="md"
                          />
                          <h2 fontWeight= 'bold'>{post.title}</h2><br></br><br></br>
                          <pre>{Web3.utils.hexToAscii(post.desc)}</pre>
                          <p>We need {Number(post.maxvalue._hex)} ethers</p>
                          <p>We had received {Web3.utils.fromWei(Web3.utils.toBN(Number(post.currvalue._hex)))} ethers</p>
                          {post.owned === false && nftImg && (
                            <div>
                              <p>If you donate by {Web3.utils.fromWei(Web3.utils.toBN(Number(post.rewardvalue._hex)))} ethers, you will get on bellow NFT</p>
                              <img className="rounded mt-4" width="350" src={nftImg} />
                              </div>
                            )}
                          {post.owned === true && (
                            <div>
                              <br></br>
                              <p style={{ color: "red" }}>The reward had been owned</p>
                              <br></br>
                              </div>
                            )}
                          <p>Posted {Math.floor((((dateNow - new Date(post.posttime * 1000))/ 1000)/ 60)).toString()} minutes ago by {post.provider}</p>
                          </GridItem>)
                  }
              })}
          </Grid>
        </ChakraProvider>
          <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="Value of donate in ETH" onChange={e => setVeth(e.target.value)} />
        <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={donateNow}>Donate Now</button><br></br>
        <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={getTrans}>Show Transaction History</button><br></br>
        <table className="table-auto">
        <thead>
          <tr>
            <th>Index</th>
            <th>Transaction Time</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {allDonors1.map((donor, i) => {
              return (
                <tr key={i}>
                <td>{i}</td>
                <td>{Math.floor((((dateNow - new Date(donor.donortime * 1000))/ 1000)/ 60)).toString()} minutes ago</td>
                <td>{donor.donors}</td>
                <td>{addressP}</td>
                <td>{Web3.utils.fromWei(Web3.utils.toBN(Number(donor.valueofdonors._hex)))} ether</td>
                </tr>)
            })}
        </tbody>
      </table>
      </div>
      </div>)}
      {networkid != appid && (
      <div>
      <Head>
        <title>Swithing Network</title>
      </Head>
      <div>
        <h1>PLEASE CLICK SWITCH NETWORK ON METAMASK POP UP WINDOW</h1>
        
      </div>
      </div>
    )}
    </div>
  )
}