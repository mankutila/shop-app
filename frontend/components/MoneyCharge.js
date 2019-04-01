import React, { Component } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

function totalItems(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
}

class MoneyCharge extends Component {
  onToken = async (token, createOrder) => {
    NProgress.start();
    try {
      const order = await createOrder({
        variables: {
          token: token.id
        }
      });
      Router.push({
        pathname: '/order',
        query: { id: order.data.createOrder.id }
      });
    } catch(error) {
      alert(error.message);
    }
  };

  render () {
    const { children } = this.props;
    return (
      <Mutation
        mutation={CREATE_ORDER_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(createOrder) => (
          <User>
            {({ data: { me } }) => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Shop App"
                description={`Order of ${totalItems(me.cart)} items`}
                image={me.cart[0] && me.cart[0].item && me.cart[0].item.image}
                stripeKey="pk_test_5cI7BT3QYRURIruo4NkjqGSU00AWnn6Hn8"
                currency="USD"
                email={me.email}
                token={res => {this.onToken(res, createOrder)}}
              >
                {children}
              </StripeCheckout>
            )}
          </User>
        )}

      </Mutation>
    );
  }
}

export default MoneyCharge;
