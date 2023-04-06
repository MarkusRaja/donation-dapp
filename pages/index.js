import Head from 'next/head'
import Link from 'next/link'
import Dropdown from "react-bootstrap/Dropdown";
import { getDefaultProvider, ethers } from "ethers";
import Web3 from 'web3';
import {connectD, fetchD, detectNetwork1} from "../services/aio";
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, Button, ChakraProvider, Image, Select  } from '@chakra-ui/react'
import { create as ipfsHttpClient } from 'ipfs-http-client'

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
export default function Home({connect, address, syncW}) {
  
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => setIsOpen(true);
  const [newtitle, setNewtitle] = useState('');
  
  const [newPostimg, setPostimg] = useState(null);
  
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
  const [filterC, setFilterC] = useState('option1');
  const [allPosts, setPosts] = useState([]);
  const [myPosts, setMyposts] = useState(0);
  const [rewardId, setRewardid] = useState([]);
  const [allDonors, setDonors] = useState([]);
  const [dateNow, setDatenow] = useState(null);
  const [sortedTrans, setSortedTrans] = useState([]);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          // setDatenow(new Date())
          const intervalId = setInterval(() => {
            setDatenow(new Date());
          }, 1000);
          return () => clearInterval(intervalId);
          
        }
      });

  }, [address, dateNow]);
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
      const waveTxn = await dcontract.createpost(newtitle, newPostimg, Web3.utils.asciiToHex(newDesc), parseInt(newMax), url, Web3.utils.padLeft(Web3.utils.toHex(Web3.utils.toWei(newRewardv, 'ether')), 64), { gasLimit: 800000});
      await waveTxn.wait();
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
    var trans = [];
    const wavesCleaned = waveTxn.map(post => {
      const wavesaja = post.transactions.map(donor => {
        return trans.push({
          donors: donor.donors,
          donortime: donor.donortime,
          valueofdonors: Number(Web3.utils.fromWei(Web3.utils.toBN(Number(donor.valueofdonors._hex))))
        });
      });
    });
    trans = trans.sort((a, b) => {
      if (a.valueofdonors > b.valueofdonors) {
        return -1;
      }
    });
    const uniqueData = trans.filter((value, index, self) => {
      return self.findIndex(v => v.donors === value.donors) === index;
    });
    setSortedTrans(uniqueData);
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
  const cobain = async (e) =>{
    console.log()
  }
  const seconds = (posttime) => {
    return (((dateNow - new Date(posttime * 1000))/ 1000)/ 60);
  };
  return (
    <div>
    <div className='container-fluid'>
    <Head>
      <title>Donation DAPP</title>
    </Head>
      {/* {rewardId.map((rid, i) => {
            return (
              <p key={i}>{rid}</p>)
          })} */}
      
      
      {/* <textarea
        placeholder="desc"
        onChange={e => console.log(e.target.value)}
        rows={10}
        cols={30}
      /> */}
      <div className='container'>
        <div className='row pb-5'>
          <div className='col fs-1 fw-bold text-success'>Rank of Donations</div>
        </div>
        <div className='row justify-content-center'>
        <div className='col'>
        <table className="table">
              <thead>
                <tr>
                  <th scope="col">Ranking</th>
                  <th scope="col">Transaction Time</th>
                  <th scope="col">Donors</th>
                  <th scope="col">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedTrans.map((donor, i) => {
                    return (
                      <tr scope="row" key={i}>
                      <th>{i+1}</th>
                      <td>{seconds(donor.donortime) >= 1 && seconds(donor.donortime)/60 < 1 && <span>{Math.floor(seconds(donor.donortime)).toString()} minutes ago</span>}
                      {seconds(donor.donortime)/60 == 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hour ago</span>}
                      {seconds(donor.donortime)/60 > 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hours ago</span>}
                      {(seconds(donor.donortime)/60)/24 == 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} day ago</span>}
                      {(seconds(donor.donortime)/60)/24 >= 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} days ago</span>}</td>
                      <td><span className='text-truncate'>{donor.donors}</span></td>
                      <td>{donor.valueofdonors} ether</td>
                      </tr>)
                  })}
              </tbody>
            </table>
        </div>
        </div>
      </div>
      
    <ChakraProvider>
      <div className='container'>
        <div className='row pb-5'>
          <div className='col fs-1 fw-bold text-success'>Donation Posts</div>
        </div>
        <div className='row'>
          <div className='col'>
            <div className='d-flex w-100 justify-content-end mb-4 mb-md-0'>
              <div className='w25'>
                <Select id='filterid' onChange={e => setFilterC(e.target.value)}>
                  <option value='option1' selected>All Posts</option>
                  <option value='option2'>Hasn't Reach Target</option>
                  <option value='option3'>Already Reach Target</option>
                </Select>
              </div>
            </div>
            
          </div>
        </div>
        <div className='row justify-content-center'>
        {allPosts.map((post, i) => {
          if(filterC=='option1'){
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
                      {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toFixed(2).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                      {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                    </Link>
                  </div>
                  
                </div>)
                }
                if(filterC=='option2'){
                  if(Number(Web3.utils.fromWei(Web3.utils.toBN(Number(post.maxvalue._hex)))) > Number(Web3.utils.fromWei(Web3.utils.toBN(Number(post.currvalue._hex))))){
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
                          {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                          {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                          {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                          {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                          {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                        </Link>
                      </div>
                      
                    </div>)
                    }
                    }
                    if(filterC=='option3'){
                      if(Number(Web3.utils.fromWei(Web3.utils.toBN(Number(post.maxvalue._hex)))) <= Number(Web3.utils.fromWei(Web3.utils.toBN(Number(post.currvalue._hex))))){
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
                              {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                              {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                              {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                              {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                              {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                            </Link>
                          </div>
                          
                        </div>)
                        }
                        }
            })}
        </div>
      </div>
    </ChakraProvider>
    
    </div>
    
      
    </div>
  )
}
