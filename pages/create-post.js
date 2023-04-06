import Head from 'next/head'
import Link from 'next/link'
import {Nav} from "react-bootstrap";
import { getDefaultProvider, ethers } from "ethers";
import Web3 from 'web3';
import {cobainaja} from "../services/aio";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image  } from '@chakra-ui/react'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import abi from "../abi/Donation.json";
const projectId = '2J5pUVzx4zKsQTgwnAYsE6MVObL'
const projectSecret = 'f41fe913f0ae1ea7c45c0d36caace45a'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth
  }
})
export default function CreatePost({connect, address, syncW, contractAddress, contractABI}) {
  const appid = 43113;
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const [newtitle, setNewtitle] = useState('');
  const [networkid, setNid] = useState('');
  const [newPostimg, setPostimg] = useState(null);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState(null);
  const [newDesc, setNewdesc] = useState('');
  const [newMax, setNewmax] = useState('');
  const [newNFTname, setNFTname] = useState('');
  const [newNFTdesc, setNFTdesc] = useState('');
  const [newNFTimg, setNFTimg] = useState(null);
  const [newRewardv, setRewardv] = useState('');
  const [error1, setError1] = useState(null);
  const [veth, setVeth] = useState('');
  const [PID, setPID] = useState('');
  const [PID1, setPID1] = useState('');
  const [addressP, setAddressp] = useState('');
  const [blockTime, setBlocktime] = useState('');
  const [realTime, setRealtime] = useState('');
  const [allPosts, setPosts] = useState([]);
  const [myPosts, setMyposts] = useState(0);
  const [rewardId, setRewardid] = useState([]);
  const [allDonors, setDonors] = useState([]);
  const [dateNow, setDatenow] = useState(null);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          syncD();
          
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
    const waveTxn = await dcontract.gotMoney(parseInt(PID), { gasLimit: 300000, value: ethers.utils.parseEther(veth)});
  };
  const postNow = async () => {
    await connect();
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    if (!newPostimg) {
      setError("No file selected");
      return;
    }
    if (!newNFTimg) {
      setError1("No file selected");
      return;
    }
    const data = JSON.stringify({
      newNFTname, newNFTdesc, image: newNFTimg
    })
    try {
      const added = await client.add(data)
      const url = `https://finaladp.infura-ipfs.io/ipfs/${added.path}`
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
      const waveTxn = await dcontract.createpost(newtitle, newPostimg, Web3.utils.asciiToHex(newDesc), Web3.utils.padLeft(Web3.utils.toHex(Web3.utils.toWei(newMax, 'ether')), 64), url, Web3.utils.padLeft(Web3.utils.toHex(Web3.utils.toWei(newRewardv, 'ether')), 64), { gasLimit: 800000});
      await waveTxn.wait();
      window.location.href = '/';
      syncD();
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
    
  };
  const syncD = async () => {
    if (!address) {
      return;
    }
    const {waveTxn} = await syncW();
    setPosts(waveTxn);
  };
  const getTrans = async () => {
    syncD();
    const wavesCleaned = allPosts[PID1].transactions.map(donor => {
        
      return {
        donors: donor.donors,
        valueofdonors: donor.valueofdonors
      };
    });
    setAddressp(allPosts[PID1].provider);
    setDonors(wavesCleaned);
  };
  const getRealtime = async () => {
    setRealtime(new Date(blockTime * 1000).toString());
  };
  const reloadaja = async () => {
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const tokenIds = [];
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    for(let i = 0; i <= allPosts.length - 1 ; i++){
      const rid = await contract.ownerOf(Number(allPosts[i].rewardid._hex));
      
      if(address == rid.toLowerCase()){
        tokenIds.push(Number(allPosts[i].rewardid._hex));
      }
    }
    console.log(allPosts.length);
    setRewardid(tokenIds);
  };
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setPostimg(null);
      setError("No file selected");
      return;
    }
    if (selectedFile.size > 1000000) {
      setPostimg(null);
      setError("File size exceeds the limit of 1 MB");
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      setPostimg(null);
      setError("File is not an image");
      return;
    }
    try {
      const added = await client.add(
        selectedFile,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://finaladp.infura-ipfs.io/ipfs/${added.path}`
      console.log(url)
      setPostimg(url)
      setError(null);
    } catch (error) {
      setError(`Error uploading file: ${error}`);
    }
  };
  const handleNFTChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setNFTimg(null);
      setError1("No file selected");
      return;
    }
    if (selectedFile.size > 1000000) {
      setNFTimg(null);
      setError1("File size exceeds the limit of 1 MB");
      return;
    }
    if (!selectedFile.type.startsWith("image/")) {
      setNFTimg(null);
      setError1("File is not an image");
      return;
    }
    try {
      const added = await client.add(
        selectedFile,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://finaladp.infura-ipfs.io/ipfs/${added.path}`
      console.log(url)
      setNFTimg(url)
      setError1(null);
    } catch (error) {
      setError1(`Error uploading file: ${error}`);
    }
  };
  return (
    <div>
    <div className='container-fluid'>
    <Head>
      <title>Create Post - Donation DAPP</title>
    </Head>
    <div className='container'>
    <div className='row pb-5'>
          <div className='col fs-1 fw-bold text-success'>Create Post</div>
        </div>
      <div className='row justify-content-center mb-5'>
        <div className='col-lg-7 col-md-10 col-sm-15'>
        <form className='bg-success bg-opacity-25 px-4 py-4 rounded-4'>
            <div className='form-group'>
            <input className="form-control mb-3" placeholder="Title" onChange={e => setNewtitle(e.target.value)} /><br></br>
            <input className="form-control-file mb-3" type="file" onChange={handleFileChange} /><br></br>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {
                newPostimg && (
                    <img className="rounded mt-4 mb-3" width="350" src={newPostimg} />
                )
                }
            <textarea
                className="form-control mb-3"
                placeholder="desc"
                onChange={e => setNewdesc(e.target.value)}
                rows={10}
                cols={30}
            /><br></br>
            <input className="form-control mb-3" placeholder="how much eth value you need?" onChange={e => setNewmax(e.target.value)} /><br></br>
            <label>Please give an image reward for a donor</label><br></br>
            <input className="form-control mb-3" placeholder="NFT Name" onChange={e => setNFTname(e.target.value)} /><br></br>
            <input className="form-control mb-3" placeholder="NFT desc" onChange={e => setNFTdesc(e.target.value)} /><br></br>
            <input className="form-control-file mb-3" type="file" onChange={handleNFTChange} /><br></br>
            {error1 && <p style={{ color: "red" }}>{error1}</p>}
            {
                newNFTimg && (
                    <img className="rounded mt-4 mb-3" width="350" src={newNFTimg} />
                )
                }
            <input className="form-control mb-3" placeholder="how much eth value can get it?" onChange={e => setRewardv(e.target.value)} />
            <div className='d-flex justify-content-end'>
                <button type='button' className="btn btn-success mb-3" onClick={postNow}>Post Now</button>
            </div>
            </div>
        </form>
        </div>
      </div>
        
    </div>
    </div>
      
    </div>
  )
}