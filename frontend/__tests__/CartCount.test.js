import CartCountComponent from '../components/CartCount';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

describe('CartCount component', function () {
  it('should render', function () {
    shallow(<CartCountComponent count={10} />)
  });

  it('matches snapshot', function () {
    const wrapper = shallow(<CartCountComponent count={10} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  it('updates via props', function () {
    const wrapper = shallow(<CartCountComponent count={50} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 10 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
