import React from 'react';
import styled from 'styled-components';
import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  
  img {
    margin-right: 10px;
  }
  
  h3 {
    margin: 0;
  }
`;

const CartItem = ({ cartItem: { item }, cartItem }) => {
  if (!cartItem.item) return null;
  return (
    <CartItemStyles>
      <img src={item.image} alt={item.title} width="100" />
      <div className="cart-item-details">
        <h3>{item.title}</h3>
        <p>
          {formatMoney(item.price * cartItem.quantity)}
          {' - '}
          <em>{cartItem.quantity} &times; {formatMoney(item.price)} each</em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyles>
  );
};

export default CartItem;
