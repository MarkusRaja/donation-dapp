import Head from 'next/head'
import { ethers } from "ethers";
import Web3 from 'web3';
import { useRouter } from "next/router";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem } from '@chakra-ui/react'
import axios from 'axios'
import abi from "../abi/Donation.json";
export default function PostDetail() {
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
  const contractAddress = "0x34eE5e12e68367AA06c93c0d44E440769620112A";
  const contractABI = abi.abi;
  const router = useRouter();
  const { postid } = router.query;
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          syncD();
        //   getTrans();
        }
      });

  }, [address]);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          setDatenow(new Date())
        }
      });

  }, [address, dateNow]);
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
    <Head>
      <title>{title}</title>
    </Head>
    <div>
      <h1 className="text-3xl font-bold underline">
        Donation DAPP
      </h1>
      <Grid templateColumns='repeat(5)' gap={6} w = "-webkit-fit-content" paddingTop={"2%"}>
        {allPosts.map((post, i) => {
                if (i == postid){
                    return (
                        <GridItem w = "-webkit-fit-content" h={"-webkit-fit-content"} bg='silver' key={i}>
                        <img className="rounded mt-4" width="350" src={post.imgurl} />
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
    </div>
  )
}