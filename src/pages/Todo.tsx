import React, { useState, useEffect, useRef } from 'react';
import { Redirect, useHistory } from 'react-router';  
import { Promise } from 'bluebird';
import Arweave from 'arweave';
import ArDB from 'ardb';
import possibleErrors from '../constants/errors';
import ArdbTransaction from 'ardb/lib/models/transaction';

const Todo: React.FC = () => {
  let arweave: Arweave = useRef<Arweave>(Arweave.init({
    host: 'arweave.net',// Hostname or IP address for a Arweave host
    port: 443,          // Port
    protocol: 'https',  // Network protocol http or https
    timeout: 20000,     // Network request timeouts in milliseconds
    logging: false, 
  })).current;
  const db = new ArDB(arweave)
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  const [loaded, setLoaded] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(false);
  const [input, setInput] = useState<String>('');
  const [todos, setTodos] = useState<String[]>([]);
  const history = useHistory();

  useEffect(() => {
    if (!loaded) {
      window.addEventListener('arweaveWalletLoaded', () => setLoaded(true));
      // setLoaded(true)
    }

    // check if user is logged in
    (async () => {
      try {
        if (!window.arweaveWallet) {
          history.push('/login');
        }

        if (loaded) {
          const address = await window.arweaveWallet.getActiveAddress();
          if (address) {
            setIsLoggedIn(true);
          }
        }
      } catch (error: any) {
        console.log(error);
        if (error.message === possibleErrors.NO_PERMISSION) {
          history.push("/login")
        }
      }
    })();

    (async () => {
      const txs = await db.search('transactions').appName('TodoList').find();

      const parsed = await Promise.map(txs as Iterable<ArdbTransaction>,async (tx) => {
        const data = await arweave.transactions.getData(tx.id, {
          decode: true,
          string: true
        })
        return data
      }) 

      setTodos(parsed as String[])
    })();

    return () => {
      setLoaded(false);
    }
  }, [loaded, isLoggedIn, todos]);

  const createTodo: () => void = async () => {
   try {
    setLoading(true)
    if (input.length <= 0) {
      throw new Error('TODO CANNOT BE EMPTY')
    }

    const data = await arweave.wallets.generate();
    const transaction = await arweave.createTransaction({
      data: input as any,
    }, data);

    console.log(transaction)
    transaction.addTag('App-Name', 'TodoList');
    transaction.addTag('Content-Type', 'text/html')
    await arweave.transactions.sign(transaction, data);

    const response = await arweave.transactions.post(transaction);
    if (response.status !== 200 ) {
      alert(response.statusText);
    }

    if (response.status === 200 ) {
      alert('TODO ADDED');
    }
    setLoading(false)
   } catch (error: any) {
    alert(error.message)
    setLoading(false)
   }
  };

  const handleLogOut = async () => {
   await window.arweaveWallet.disconnect(); 
    window.location.assign('/login')
  };

  if (loading) {
    return (
      <h1>Loading....</h1>
    )
  }
  return (
    <div className="container-fluid">
      <button className="btn btn-primary" onClick={handleLogOut}>
        Log out
      </button>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 pt-5">
            <div className="container-flud bg-primary p-2 font-weight-bold rounded">
              <p className="text-center h4 font-weight-bold text-white">Todo List</p>
            </div>
            {todos.map((todo, index) => (
              <div className="container bg-light rounded row mt-2" key={index.toString()}>
                <div className="col-12">
                  {todo}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container text-center mt-5">
          <input className="form-control" type="text" onChange={(e) => setInput(e.target.value)} value={input as any} />
          <button className="btn btn-primary" onClick={createTodo} disabled={loading as boolean}>
            Add Todo
          </button>
        </div>
      </div>
    </div>
  )
}

export default Todo
