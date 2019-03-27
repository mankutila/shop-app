import SignupComponent from '../components/Signup';
import styled from 'styled-components';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;


const Signup = props => (
  <div>
    <SignupComponent />
    <SignupComponent />
    <SignupComponent />
  </div>
);

export default Signup;
