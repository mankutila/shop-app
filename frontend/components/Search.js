import React, { Component } from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm },
      ]
    }) {
      id
      image
      title
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id
    }
  })
}

class Autocomplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  handleChange = debounce(async (e, client) => {
    this.setState({ loading: true });
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value }
    });

    this.setState({
      items: res.data.items,
      loading: false,
    });
  }, 350);

  render () {
    const { items, loading } = this.state;
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift itemToString={item => item === null ? '' : item.title} onChange={routeToItem}>
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex}) => (
            <div>
              <ApolloConsumer>
                {(client) => (
                  <input
                    {...getInputProps({
                      type: 'search',
                      id: 'search',
                      className: loading ? 'loading' : '',
                      placeholder: 'Search items...',
                      onChange: e => {
                        e.persist();
                        this.handleChange(e, client);
                      }
                    })}
                  />
                )}
              </ApolloConsumer>
              { isOpen && (
                <DropDown>
                  {items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({
                        item
                      })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img src={item.image} alt={item.title} width="50" />
                      {item.title}
                    </DropDownItem>
                  ))}
                  {!items.length && !loading && `No items found for ${inputValue}`}
                </DropDown>
              )}

            </div>
          )}
        </Downshift>

      </SearchStyles>
    );
  }
}

export default Autocomplete;
