import Head from 'next/head'
import { ethers } from "ethers";
import Web3 from 'web3';
import { useRouter } from "next/router";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image  } from '@chakra-ui/react'
import axios from 'axios'
import Link from 'next/link'
import abi from "../../abi/Donation.json";
export default function ListPosts({connect, address, syncW, contractAddress, contractABI}) {
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
  const [addressP, setAddressp] = useState('');
  const [loaded, setLoad] = useState(0);
  const [rewardId, setRewardid] = useState([]);
  const [allPosts, setPosts] = useState([]);
  const [myPosts, setMyposts] = useState(0);
  const [allDonors1, setDonors1] = useState([]);
  const [changed, setChanged] = useState(false);
  const router = useRouter();
  const { qaddress } = router.query;
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          const intervalId = setInterval(() => {
            setDatenow(new Date());
          }, 1000);
          return () => clearInterval(intervalId);
        }
      });

  }, [address]);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          syncD();
        //   getTrans();
        }
      });

  }, [address]);
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
    if (!address) {
      return;
    }
    const {cpost, waveTxn} = await syncW();
    setMyposts(cpost);
    setPosts(waveTxn);
    


    // console.log(postid);
    // setTitle(waveTxn1[postid].title);
    // const tokenUri = await dcontract.tokenURI(Number(waveTxn1[postid].rewardid._hex))
    // const meta = await axios.get(tokenUri)
    // setnftImg(meta.data.image);
    // console.log(allPosts);
    // console.log(postid);
    // console.log(allPosts[parseInt(postid)].transactions)
  };
  const liatD = async () => {
    console.log(rewardId);
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
  const seconds = (posttime) => {
    return (((dateNow - new Date(posttime * 1000))/ 1000)/ 60);
  };
  return (
    <div>
      <div>
      <Head>
        {address == qaddress && myPosts > 1 && <title>Your Posts</title>}
        {address == qaddress && myPosts == 1 && <title>Your Post</title>}
        {address != qaddress && myPosts > 1 && <title>List Posts</title>}
        {address != qaddress && myPosts == 1 && <title>The Post</title>}
      </Head>
      <div>
      <ChakraProvider>
          <div className='container'>
            <div className='row pb-5'>
              {address == qaddress && myPosts > 1 && <div className="col fs-1 fw-bold text-success">Your Posts</div>}
              {address == qaddress && myPosts == 1 && <div className="col fs-1 fw-bold text-success">Your Post</div>}
              {address != qaddress && myPosts > 1 && <div className="col fs-1 fw-bold text-success">List Posts of {qaddress}</div>}
              {address != qaddress && myPosts == 1 && <div className="col fs-1 fw-bold text-success">The Post of {qaddress}</div>}
            </div>
            <div className='row justify-content-center'>
            {allPosts.map((post, i) => {
              if(post.provider.toLowerCase() === qaddress){
                  return (
                    
                    <div className='col-lg-3 mx-lg-3 mx-md-3 mx-sm-0 mt-sm-4' key={i}>
                      <div className='rounded-2 bg-opacity-25 bg-success pt-1 px-2 mb-4'>
                        <Link className='text-black' href= {`/${i}`}>
                          <div className='d-flex justify-content-center mb-4 mt-3'>
                            <div className="center-cropped shadow mw-100 rounded-2">
                                  <img src={post.imgurl} alt={post.title} />
                              </div>
                          </div>
                          
                          <p className="fw-bold mb-4">{post.title}</p>
                          <pre className='mb-4'>{Web3.utils.hexToAscii(post.desc)}</pre>
                          {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toString().replace('.',',')} minutes ago</p>}
                          {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago</p>}
                          {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago</p>}
                          {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago</p>}
                          {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago</p>}
                        </Link>
                      </div>
                      
                    </div>)
              }
                })}
            </div>
          </div>
        </ChakraProvider>
      </div>
      </div>
    </div>
  )
}