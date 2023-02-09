import Head from 'next/head'
import Link from 'next/link'
import { ethers } from "ethers";
import Web3 from 'web3';
import { Fragment, useState, useEffect } from 'react';
import { Grid, GridItem } from '@chakra-ui/react'
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
export default function Home() {
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
  const [address, setAddress] = useState('');
  const [addressP, setAddressp] = useState('');
  const [blockTime, setBlocktime] = useState('');
  const [realTime, setRealtime] = useState('');
  const [allPosts, setPosts] = useState([]);
  const [allDonors, setDonors] = useState([]);
  const [dateNow, setDatenow] = useState(null);
  const contractAddress = "0x34eE5e12e68367AA06c93c0d44E440769620112A";
  const contractABI = abi.abi;
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          syncD();
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
      const waveTxn = await dcontract.createpost(newtitle, newPostimg, Web3.utils.asciiToHex(newDesc), parseInt(newMax), url, parseInt(Web3.utils.toWei(newRewardv, "ether")), { gasLimit: 3000000});
      await waveTxn.wait();
      syncD();
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
    
  };
  const syncD = async () => {
    const ethereum = window.ethereum;
    if (!address) {
      return;
    }
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const dcontract = new ethers.Contract(contractAddress, contractABI, signer);
    const waveTxn = await dcontract.syncdonation({ gasLimit: 300000});
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
  return (
    <div>
    <Head>
      <title>Donation DAPP</title>
    </Head>
    <div>
      <h1 className="text-3xl font-bold underline">
        Donation DAPP
      </h1>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="Title" onChange={e => setNewtitle(e.target.value)} /><br></br>
      <input type="file" onChange={handleFileChange} /><br></br>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {
          newPostimg && (
            <img className="rounded mt-4" width="350" src={newPostimg} />
          )
        }
      <textarea
        className="pt-4 rounded bg-gray-100 px-3 py-2 my-2"
        placeholder="desc"
        onChange={e => setNewdesc(e.target.value)}
        rows={10}
        cols={30}
      /><br></br>
      
      {/* <textarea
        placeholder="desc"
        onChange={e => console.log(e.target.value)}
        rows={10}
        cols={30}
      /> */}
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="how much you need?" onChange={e => setNewmax(e.target.value)} /><br></br>
      <label>Please give an image reward for a donor</label><br></br>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="NFT Name" onChange={e => setNFTname(e.target.value)} /><br></br>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="NFT desc" onChange={e => setNFTdesc(e.target.value)} /><br></br>
      <input type="file" onChange={handleNFTChange} /><br></br>
      {error1 && <p style={{ color: "red" }}>{error1}</p>}
      {
          newNFTimg && (
            <img className="rounded mt-4" width="350" src={newNFTimg} />
          )
        }
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2 w-64" placeholder="how much value can get it?" onChange={e => setRewardv(e.target.value)} />
      <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={postNow}>Post Now</button><br></br>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="PID" onChange={e => setPID(e.target.value)} />
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="Value of donate in ETH" onChange={e => setVeth(e.target.value)} />
      <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={donateNow}>Donate Now</button><br></br>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="PID" onChange={e => setPID1(e.target.value)} />
      <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={getTrans}>Show</button><br></br>
      <input className="pt-4 rounded bg-gray-100 px-3 py-2 my-2" placeholder="block time" onChange={e => setBlocktime(e.target.value)} />
      <button className="pt-4 shadow-md bg-green-500 mt-4 mb-4 text-white font-bold py-2 px-4 rounded" onClick={getRealtime}>get real time</button>
      {realTime && <p>{realTime}</p>}
      <table className="table-auto">
      <thead>
        <tr>
          <th>Index</th>
          <th>From</th>
          <th>To</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {allDonors.map((donor, i) => {
            return (
              <tr key={i}>
              <td>{i}</td>
              <td>{donor.donors}</td>
              <td>{addressP}</td>
              <td>{Web3.utils.fromWei(Web3.utils.toBN(Number(donor.valueofdonors._hex)))} ether</td>
              </tr>)
          })}
      </tbody>
    </table>
    <Grid templateColumns='repeat(5, 1fr)' gap={6} w = "50%">
    {allPosts.map((post, i) => {
            return (
              <Link href= {`/${i}`} key={i}>
              <GridItem w='100%' h={"-webkit-fit-content"} bg='silver'>
                <img className="rounded mt-4" width="350" src={post.imgurl} />
                <p>{post.title}</p>
                <pre>{Web3.utils.hexToAscii(post.desc)}</pre>
                <p>Posted {Math.floor((((dateNow - new Date(post.posttime * 1000))/ 1000)/ 60)).toString()} minutes ago</p>
              </GridItem>
              </Link>)
          })}
    </Grid>
    </div>
    </div>
  )
}
