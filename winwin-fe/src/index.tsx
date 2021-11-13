import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import UserProvider from 'providers/User';
import PaymentProvider from 'providers/Payment';
import CaseProvider from 'providers/Case';

const client = new ApolloClient({
  uri: process.env.GRAPHQL_URI || 'http://localhost:4001/graphql',
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <UserProvider>
        <CaseProvider>
          <PaymentProvider>
            <Router>
              <App />
            </Router>
          </PaymentProvider>
        </CaseProvider>
      </UserProvider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
