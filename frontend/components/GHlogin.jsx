import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost';
import gql from 'graphql-tag';
import { GH_CLIENT_ID, GH_REDIRECT_URI } from '../config';
import { CURRENT_USER_QUERY } from './User';

const httpLink = new HttpLink({ uri: 'https://api.github.com/graphql' });

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('auth_token');
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  });
  return forward(operation);
});

const customClient = new ApolloClient({
  link: authLink.concat(httpLink), // Chain it with the HttpLink
  cache: new InMemoryCache()
});

const GH_INFO_QUERY = gql`
  query GH_INFO_QUERY {
    viewer {
      name
      email
      login
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $name: String!, $token: String!) {
    signupGithub(email: $email, name: $name, token: $token) {
      id
      email
      name
    }
  }
`;


class GHlogin extends Component {
  state = {
    token: null,
  };

  componentDidMount () {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
      // Gatekeeper endpoint
      fetch(`https://shopappm.herokuapp.com/authenticate/${code}`)
        .then(response => response.json())
        .then(({ token }) => {
          localStorage.setItem('auth_token', token);
          this.setState({ token })
        });
    }
  }

  render () {
    return (
      <div>
        <a
          href={`https://github.com/login/oauth/authorize?client_id=${GH_CLIENT_ID}&scope=user&redirect_uri=${GH_REDIRECT_URI}`}
        >
          Login via GitHub
        </a>
        { this.state.token && (
          <Query asyncMode query={GH_INFO_QUERY} client={customClient}>
            {({ data, data: { viewer }}) => {
              console.log(data, viewer);
              return (
                <Mutation
                  mutation={SIGNUP_MUTATION}
                  variables={{
                    email: viewer && viewer.email,
                    name: viewer && viewer.name,
                    token: this.state.token,
                  }}
                  refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                >
                  {(signupGithub) => {
                    console.log(({
                      email: viewer && viewer.email,
                      name: viewer && viewer.name,
                      token: this.state.token,
                    }));
                    return <button onClick={signupGithub}>sign up</button>;
                  }}
                </Mutation>
              );
            }}
          </Query>
        )}

      </div>
    );
  }
}

export default GHlogin;
