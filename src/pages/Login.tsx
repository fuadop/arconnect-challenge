import React, { useEffect, useState, useRef } from 'react';
import Arweave from 'arweave';
import { Redirect, useHistory } from 'react-router-dom';
import possibleErrors from '../constants/errors';

const Login: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  const [loaded, setLoaded] = useState<Boolean>(false);
  const history = useHistory();

  useEffect(() => {
    if (isLoggedIn) {
      history.push("/");
    }

    if (!loaded) {
      window.addEventListener('arweaveWalletLoaded', () => setLoaded(true));
    }

    // check if user is logged in
    (async () => {
      try {
        if (loaded) {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setIsLoggedIn(true);
          }
        }
      } catch (error: any) {
        console.log(error);
        if (error.message === possibleErrors.NO_PERMISSION) {
          setIsLoggedIn(false);
        }
      }
    })();
  }, [loaded, isLoggedIn, history]);

  const handleLogin: () => void = async () => {
    // Perform oauth login logic here.
    try {
      await window.arweaveWallet.connect(
        [
          'ACCESS_ADDRESS',
          'ACCESS_PUBLIC_KEY',
          'SIGN_TRANSACTION'
        ],
        {
          name: 'Todo List',
          logo: 'https://analyticsindiamag.com/wp-content/uploads/2019/04/preview.jpg'
        }
      )
      setIsLoggedIn(true);
    } catch (error: any) {
      console.log(error);
      if (error.message === possibleErrors.NO_PERMISSION || error.message === possibleErrors.USER_CANCEL_POPUP) {
        // set logged in state to false
        setIsLoggedIn(false);
      }
    }
  };

  if (isLoggedIn) {
    return <Redirect to="/" />
  }

  return (
    <div className="container-fluid">
      <div className="row full-height full-width">
        <div className="col-md-6 d-none d-md-block bg-primary">

        </div>
        <div className="col-12 col-md-6">
          <div className="container d-flex justify-content-center align-items-center full-height">
            { loaded && <p
              className="btn btn-primary btn-block w-100"
              style={{
                fontWeight: 'bolder'
              }}
              onClick={handleLogin}
            >
              <img
                src="https://arconnect.io/_next/static/images/logo-893917071649f242fe057c92ccdd396a.png"
                alt="logo"
                className="img-fluid"
                style={{
                  width: '30px',
                  marginRight: '10px'
                }} 
              />
              Login with ArConnect
            </p>}
            { !loaded && <h1>Install Arconnect extension to use this software</h1>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
