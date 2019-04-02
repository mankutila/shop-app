import SingleItemComponent, { SINGLE_ITEM_QUERY } from '../components/SingleItem';
import { mount, shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeItem } from '../lib/testUtils';

describe('SingleItem component', () => {
  it('should render with proper data', async () => {
    const mocks = [{
      request: { query: SINGLE_ITEM_QUERY, variables: { id: 'abc123' }},
      result: {
        data: { item: fakeItem() }
      }
    }];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItemComponent id="abc123" />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain('Loading...');
    await wait();
    wrapper.update();

    expect(toJSON(wrapper.find('h2'))).toMatchSnapshot();
    expect(toJSON(wrapper.find('img'))).toMatchSnapshot();
    expect(toJSON(wrapper.find('p'))).toMatchSnapshot();

  });

  it('should handle Not Found error', async () => {
    const mocks = [{
      request: { query: SINGLE_ITEM_QUERY, variables: { id: '987' }},
      result: {
        errors: [{ message: 'Item not found' }]
      }
    }];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItemComponent id="987" />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain('Item not found');
    expect(toJSON(item)).toMatchSnapshot();
  });
});
