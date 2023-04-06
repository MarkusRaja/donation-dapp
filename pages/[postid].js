import Head from 'next/head'
import { ethers } from "ethers";
import Web3 from 'web3';
import { useRouter } from "next/router";
import {Nav} from "react-bootstrap";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image  } from '@chakra-ui/react'
import axios from 'axios'
import Link from 'next/link'
import abi from "../abi/Donation.json";
export default function PostDetail({connect, address, syncW, contractAddress, contractABI}) {
  const appid = 43113;
  const [networkid, setNid] = useState('');
  const [title, setTitle] = useState('');
  const [newDesc, setNewdesc] = useState('');
  const [newMax, setNewmax] = useState('');
  const [nftImg, setnftImg] = useState(null);
  const [nftowner, setNftowner] = useState('');
  const [dateNow, setDatenow] = useState(null);
  const [veth, setVeth] = useState('');
  const [PID, setPID] = useState('');
  const [PID1, setPID1] = useState('');
  const [donating, setDonating] = useState(false);
  const [addressP, setAddressp] = useState('');
  const [loaded, setLoad] = useState(0);
  const [allPosts, setPosts] = useState([]);
  const [allDonors1, setDonors1] = useState([]);
  const [changed, setChanged] = useState(false);
  const [myPosts, setMyposts] = useState(0);
  const [rewardId, setRewardid] = useState([]);
  const router = useRouter();
  const { postid } = router.query;
  useEffect(() => {
    connect()
      .then(() => {
        if (address && donating == false) {
          const intervalId = setInterval(() => {
            setDatenow(new Date());
          }, 500);
          return () => clearInterval(intervalId);
        }
      });

  }, [address, dateNow, donating]);
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
          let wavePortalContract;
          const onNewWave = (syncid, newerpost) => {
            if(postid == syncid){
              console.log("NewWave", syncid, newerpost);
              allPosts[syncid] = newerpost;
              const wavesCleaned = newerpost.transactions.map(donor => {
        
                return {
                  donortime: donor.donortime,
                  donors: donor.donors,
                  valueofdonors: donor.valueofdonors
                };
              });
              setDonors1(wavesCleaned);
            }
          };
        
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
        
            wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            wavePortalContract.on("NewWave", onNewWave);
          }
            return () => {
            if (wavePortalContract) {
              wavePortalContract.off("NewWave", onNewWave);
            }
          };
        }
      });

  }, []);
  const donateNow = async () => {
    setDonating(true);
    await connect();
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await dcontract.gotMoney(parseInt(postid), { gasLimit: 300000, value: ethers.utils.parseEther(veth)});
    await waveTxn.wait();
    setDonating(false);
    window.location.reload();
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
    if (!address) {
      return;
    }
    const {waveTxn, dcontract} = await syncW();
    console.log(waveTxn);
    setPosts(waveTxn);
    console.log(postid);
    setTitle(waveTxn[postid].title);
    const tokenUri = await dcontract.tokenURI(Number(waveTxn[postid].rewardid._hex))
    const rid = await dcontract.ownerOf(Number(waveTxn[postid].rewardid._hex));
    const meta = await axios.get(tokenUri)
    setnftImg(meta.data.image);
    console.log(allPosts);
    console.log(postid);
    setNftowner(rid)
    const wavesCleaned = waveTxn[postid].transactions.map(donor => {
        
      return {
        donortime: donor.donortime,
        donors: donor.donors,
        valueofdonors: donor.valueofdonors
      };
    });
    setAddressp(waveTxn[postid].provider);
    setDonors1(wavesCleaned);
    // console.log(allPosts[parseInt(postid)].transactions)
  };
  const seconds = (posttime) => {
    return (((dateNow - new Date(posttime * 1000))/ 1000)/ 60);
  };
  const getTrans = async () => {
    
    await syncD();
    
  };
  return (
    <div>
      <div className='container'>
      <Head>
        <title>{title}</title>
      </Head>
      <div>
        <ChakraProvider>
        <div className='container'>
          <div className='row'>
            <div className='col'>
              <div className='row pb-5'>
            <div className='col fs-1 fw-bold text-success'>Post Detail</div>
          </div>
          <div className='row'>
          {allPosts.map((post, i) => {
            if (i == postid){
                return (
                  
                  <div className='col-lg-9 rounded-2 bg-opacity-25 bg-success mx-lg-5 mx-md-3 mx-sm-0 mt-lg-0 mt-sm-4' key={i}>
                    <Link className='text-black' href= {`/${i}`}>
                      <div className='d-flex justify-content-center mb-4 mt-4'>
                      <img src={post.imgurl} alt={post.title} />
                      </div>
                      
                      <div className="fw-bold fs-5">{post.title}</div><br></br><br></br>
                      <pre className='mb-4'>{Web3.utils.hexToAscii(post.desc)}</pre>
                      <p className='mb-4'>We need {Web3.utils.fromWei(Web3.utils.toBN(Number(post.maxvalue._hex)))} ethers</p>
                      <p className='mb-4'>We had received {Web3.utils.fromWei(Web3.utils.toBN(Number(post.currvalue._hex)))} ethers</p>
                      {post.owned === false && nftImg && (
                        <div>
                          <p className='mb-4'>If you donate by {Web3.utils.fromWei(Web3.utils.toBN(Number(post.rewardvalue._hex)))} ethers, you will get on bellow NFT</p>
                          <img className="rounded mt-4 mb-4" width="350" src={nftImg} />
                          </div>
                        )}
                      {post.owned === true && (
                        <div>
                          <p className='mb-4' style={{ color: "red" }}>The reward had been owned by <Link href= {`/reward/${nftowner.toLowerCase()}`}>{nftowner}</Link></p>
                          <br></br>
                          </div>
                        )}
                      {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toFixed(2).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                    </Link>
                  </div>)
            }
              })}
              <div className='row mt-3'>
                  <div className='col-sm-5 mx-lg-5 mx-md-3'>
                    <input className="form-control mb-3" placeholder="Value of donate in ETH" onChange={e => setVeth(e.target.value)} />
                  </div>
                  <div className='col-sm-3 mx-lg-1 mx-md-1'>
                    <button type='button' className="btn btn-success mb-3" onClick={donateNow}>Donate Now</button>
                  </div>
                </div>
          </div>
            </div>
            <div className='col w-50 mt-5 pt-5'>
              <table id='tabletrans' className="table mt-5">
              <thead>
                <tr>
                  <th scope="col">Index</th>
                  <th scope="col">Time</th>
                  <th scope="col">From</th>
                  <th scope="col">To</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {allDonors1.map((donor, i) => {
                    return (
                      <tr scope="row" key={i}>
                      <th>{i}</th>
                      <td><span className='text-truncate'>{seconds(donor.donortime) >= 1 && seconds(donor.donortime)/60 < 1 && <span>{Math.floor(seconds(donor.donortime)).toString()} minutes ago</span>}
                      {seconds(donor.donortime)/60 == 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hour ago</span>}
                      {seconds(donor.donortime)/60 > 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hours ago</span>}
                      {(seconds(donor.donortime)/60)/24 == 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} day ago</span>}
                      {(seconds(donor.donortime)/60)/24 >= 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} days ago</span>}</span></td>
                      <td><span className='text-truncate'>{donor.donors}</span></td>
                      <td><span className='text-truncate'>{addressP}</span></td>
                      <td>{Web3.utils.fromWei(Web3.utils.toBN(Number(donor.valueofdonors._hex)))} ether</td>
                      </tr>)
                  })}
              </tbody>
            </table>
            </div>
          </div>
        
      </div>
        </ChakraProvider>
        <form id='donating' className='bg-success bg-opacity-25 d-flex rounded-4'>
            <div className='container'>
              
              
              
            </div>
        </form>
          <br></br>
        
      </div>
      </div>
    </div>
  )
}