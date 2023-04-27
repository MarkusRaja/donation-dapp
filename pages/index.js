import Head from 'next/head'
import Link from 'next/link'
import Web3 from 'web3';
import { useState, useEffect } from 'react';
import { ChakraProvider, Select } from '@chakra-ui/react'
export default function Home({connect, address, syncW, currencyD}) {
  const [filterC, setFilterC] = useState('option1');
  const [allPosts, setPosts] = useState([]);
  const [dateNow, setDatenow] = useState(null);
  const [sortedTrans, setSortedTrans] = useState([]);
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

  }, [address, dateNow]);
  useEffect(() => {
    connect()
      .then(() => {
        if (address) {
          syncD();
          
        }
      });

  }, [address]);
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
  const seconds = (posttime) => {
    return (((dateNow - new Date(posttime * 1000))/ 1000)/ 60);
  };
  return (
    <div>
    <div className='container-fluid'>
    <Head>
      <title>Donation DAPP</title>
    </Head>
      <div className='container'>
        <div className='row pb-5'>
          <div className='col fs-1 fw-bold text-success'>Rank of Donations</div>
        </div>
        <div className='row justify-content-center'>
        <div className='col'>
        {sortedTrans.length > 0 && <table className="table">
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
                      <td> {seconds(donor.donortime) <= 0 && <span>just now</span>}
                      {seconds(donor.donortime) >= 1 && seconds(donor.donortime)/60 < 1 && <span>{Math.floor(seconds(donor.donortime)).toString()} minutes ago</span>}
                      {seconds(donor.donortime)/60 == 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hour ago</span>}
                      {seconds(donor.donortime)/60 > 1 && (seconds(donor.donortime)/60)/24 < 1 && <span>{Math.floor(seconds(donor.donortime)/60).toString()} hours ago</span>}
                      {(seconds(donor.donortime)/60)/24 == 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} day ago</span>}
                      {(seconds(donor.donortime)/60)/24 >= 1 && <span>{Math.floor((seconds(donor.donortime)/60)/24).toString()} days ago</span>}</td>
                      <td><span className='text-truncate'>{donor.donors}</span></td>
                      <td>{donor.valueofdonors} {currencyD}</td>
                      </tr>)
                  })}
              </tbody>
            </table>}
            {sortedTrans.length == 0 && <div className='w-100 text-center fs-3'>No Data</div>}
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
                  <option value='option2'>Hasn&apos;t Reach Target</option>
                  <option value='option3'>Already Reach Target</option>
                </Select>
              </div>
            </div>
            
          </div>
        </div>
        <div className='row justify-content-center'>
        {allPosts.length > 0 && allPosts.map((post, i) => {
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
                      
                      <p id='titlehl' className="text-truncate fw-bold mb-4">{post.title}</p>
                      <pre id='deschl' className='mb-4'>{Web3.utils.hexToAscii(post.desc)}</pre>
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
                            
                            <p id='titlehl' className="text-truncate fw-bold mb-4">{post.title}</p>
                            <pre id='deschl' className='mb-4'>{Web3.utils.hexToAscii(post.desc)}</pre>
                            {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toFixed(2).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
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
                                
                                <p id='titlehl' className="text-truncate fw-bold mb-4">{post.title}</p>
                                <pre id='deschl' className='mb-4'>{Web3.utils.hexToAscii(post.desc)}</pre>
                                {seconds(post.posttime) >= 1 && seconds(post.posttime)/60 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)).toFixed(2).toString().replace('.',',')} minutes ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                                {seconds(post.posttime)/60 == 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {Math.floor(seconds(post.posttime)/60).toString()} hour ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                                {seconds(post.posttime)/60 > 1 && (seconds(post.posttime)/60)/24 < 1 && <p className='mb-4'>Posted {(seconds(post.posttime)/60).toFixed(2).toString().replace('.',',')} hours ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                                {(seconds(post.posttime)/60)/24 == 1 && <p className='mb-4'>Posted {Math.floor((seconds(post.posttime)/60)/24).toString()} day ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                                {(seconds(post.posttime)/60)/24 >= 1 && <p className='mb-4'>Posted {((seconds(post.posttime)/60)/24).toFixed(2).toString().replace('.',',')} days ago by <Link href= {`/posts/${post.provider.toLowerCase()}`}>{post.provider}</Link></p>}
                              </Link>
                            </div>
                            
                          </div>)
                        }
                        }
            }
            )}
            {allPosts.length == 0 && <div id='emptystatement' className='w-100 text-center fs-3'>No Post</div>}
        </div>
      </div>
    </ChakraProvider>
    
    </div>
    
      
    </div>
  )
}