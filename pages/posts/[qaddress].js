import Head from 'next/head'
import Web3 from 'web3';
import { useRouter } from "next/router";
import { useState, useEffect } from 'react';
import { ChakraProvider} from '@chakra-ui/react'
import {countQadd} from "../../services/aio";
import Link from 'next/link'
export default function ListPosts({connect, address, syncW}) {
  const [dateNow, setDatenow] = useState(null);
  const [allPosts, setPosts] = useState([]);
  const [myPosts, setMyposts] = useState(0);
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
        }
      });

  }, [address]);
  const syncD = async () => {
    if (!address) {
      return;
    }
    const {cpost, waveTxn} = await syncW();
    setMyposts(cpost);
    if(address != qaddress){
      const {cpost} = countQadd();
      setMyposts(cpost);
    }
    setPosts(waveTxn);
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
        {address != qaddress && myPosts <= 1 && <title>The Post</title>}
      </Head>
      <div>
      <ChakraProvider>
          <div className='container'>
            <div className='row pb-5'>
              {address == qaddress && myPosts > 1 && <div className="col fs-1 fw-bold text-success">Your Posts</div>}
              {address == qaddress && myPosts == 1 && <div className="col fs-1 fw-bold text-success">Your Post</div>}
              {address != qaddress && myPosts > 1 && <div className="col fs-1 fw-bold text-success">List Posts of {qaddress}</div>}
              {address != qaddress && myPosts <= 1 && <div className="col fs-1 fw-bold text-success">The Post of {qaddress}</div>}
            </div>
            <div className='row justify-content-center'>
            {myPosts > 0 && allPosts.map((post, i) => {
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
                })}
              {myPosts == 0 && <div id='emptystatement' className='w-100 text-center fs-3'>No Post</div>}
            </div>
          </div>
        </ChakraProvider>
      </div>
      </div>
    </div>
  )
}