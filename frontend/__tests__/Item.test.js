import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: 'uniqueId',
  title: 'One more item',
  description: 'One more item description',
  price: 5000,
  image: 'image.jpg',
  largeImage: 'large-image.jpg',
};

describe('Item component', function () {
  it('should render and match snapshot', function () {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  /*it('should render', function () {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const PriceTag = wrapper.find('PriceTag');
    const img = wrapper.find('img');

    expect(PriceTag.dive().text()).toEqual('BYN 50');
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);

  });

  it('should render the buttons properly', function () {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    const buttonList = wrapper.find('.buttonList');
    console.log(buttonList.debug());
    expect(buttonList.children()).toHaveLength(3);
    expect(buttonList.find('Link')).toHaveLength(1);
    expect(buttonList.find('AddToCart')).toHaveLength(1);
    expect(buttonList.find('DeleteItem')).toHaveLength(1);

  });*/
});
