import Head from 'next/head'
import { ethers } from "ethers";
import Web3 from 'web3';
import {Nav} from "react-bootstrap";
import Link from 'next/link'
import { useRouter } from "next/router";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image  } from '@chakra-ui/react'
import axios from 'axios'
import abi from "../../abi/Donation.json";
export default function ListRewards({connect, address, syncW, contractAddress, contractABI}) {
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
  const [allDonors1, setDonors1] = useState([]);
  const [changed, setChanged] = useState(false);
  const [myPosts, setMyposts] = useState(0);
  const router = useRouter();
  const { qaddress } = router.query;
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
    const tokenIds = [];
    let nftdata;
    const {cpost, waveTxn, dcontract} = await syncW();
    for(let i = 0; i <= waveTxn.length - 1 ; i++){
      const rid = await dcontract.ownerOf(Number(waveTxn[i].rewardid._hex));
      if(qaddress == rid.toLowerCase()){
        const tokenUri = await dcontract.tokenURI(Number(waveTxn[i].rewardid._hex))
        const meta = await axios.get(tokenUri)
        nftdata = {
          title: meta.data.newNFTname,
          desc: meta.data.newNFTdesc,
          nfturl: meta.data.image,
          postid: i
        }
        tokenIds.push(nftdata);
      }
    }
    setMyposts(cpost);
    setPosts(waveTxn);
    setRewardid(tokenIds);


    // console.log(postid);
    // setTitle(waveTxn[postid].title);
    // const tokenUri = await dcontract.tokenURI(Number(waveTxn[postid].rewardid._hex))
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
  return (
    <div>
      <div>
      <Head>
        {address == qaddress && rewardId.length > 1 && <title>Your Rewards</title>}
        {address == qaddress && rewardId.length == 1 && <title>Your Reward</title>}
        {address != qaddress && rewardId.length > 1 && <title>List Rewards</title>}
        {address != qaddress && rewardId.length <= 1 && <title>The Reward</title>}
      </Head>
      <div>
      <ChakraProvider>
        <div className='container'>
          <div className='row pb-5'>
            {address == qaddress && rewardId.length > 1 && <div className="col fs-1 fw-bold text-success">Your Rewards</div>}
            {address == qaddress && rewardId.length == 1 && <div className="col fs-1 fw-bold text-success">Your Reward</div>}
            {address != qaddress && rewardId.length > 1 && <div className="col fs-1 fw-bold text-success">List Rewards of {qaddress}</div>}
            {address != qaddress && rewardId.length <= 1 && <div className="col fs-1 fw-bold text-success">The Reward of {qaddress}</div>}
          </div>
          <div className='row justify-content-center'>
          {rewardId.length > 0 && rewardId.map((nft, i) => {
                return (
                  
                  <div className='col-lg-3 mx-lg-3 mx-md-3 mx-sm-0 mt-sm-4' key={i}>
                    <div className='rounded-2 bg-opacity-25 bg-success pt-1 px-2 mb-4'>
                      <Link className='text-black' href= {`/${nft.postid}`}>
                        <p className="fw-bold mb-4">{nft.title}</p>
                        <div className='d-flex justify-content-center mb-4 mt-3'>
                          <div className="center-cropped shadow mw-100 rounded-2">
                                <img src={nft.nfturl} alt={nft.title} />
                            </div>
                        </div>
                        
                        
                        <pre className='mb-4'>{nft.desc}</pre>
                      </Link>
                    </div>
                    
                  </div>)
              })}
            {rewardId.length == 0 && <div id='emptystatement' className='w-100 text-center fs-3'>No Reward</div>}
          </div>
        </div>
      </ChakraProvider>
      </div>
      </div>
    </div>
  )
}