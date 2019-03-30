import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const POSSIBLE_PERMISSIONS = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE'
];

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = (props) => {
  return (
    <Query
      query={ALL_USERS_QUERY}
    >
      {({data, loading, error}) => {
        if (error) return <Error error={error} />;
        return (
          <>
            <h2>Manage Pemissions</h2>
            <Table>
              <thead>
                <th>Name</th>
                <th>Email</th>
                {POSSIBLE_PERMISSIONS.map(perm => <th key={perm}>{perm}</th>)}
                <th />
              </thead>
              <tbody>
                {data.users.map(user => (
                  <UserPermissions key={user.id} user={user} />
                ))}
              </tbody>
            </Table>
          </>
        )
      }}
    </Query>
  );
};

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.arrayOf(PropTypes.string),
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions,
  };

  handlePermissionChange = (e, updatePermissions) => {
    const { permissions } = this.state;
    const { value, checked } = e.target;

    let updatedPermissions = [ ...permissions ];
    if (checked) {
      updatedPermissions.push(value);
    } else {
      updatedPermissions = updatedPermissions.filter(perm => perm !== value);
    }

    this.setState({
      permissions: updatedPermissions,
    }, updatePermissions)
  };

  render () {
    const { user } = this.props;
    const { permissions } = this.state;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: user.id,
        }}
      >
        {(updatePermissions, {loading, error}) => {
          return (
            <>
              { error && <tr><td colspan="8"><Error error={error} /></td></tr>}
              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>
                {POSSIBLE_PERMISSIONS.map(perm => (
                  <td key={perm}>
                    <label htmlFor={`${user.id}-permission-${perm}`}>
                      <input
                        id={`${user.id}-permission-${perm}`}
                        type="checkbox"
                        checked={permissions.includes(perm)}
                        value={perm}
                        onChange={(e) => {this.handlePermissionChange(e, updatePermissions)}}
                      />
                    </label>
                  </td>
                ))}
                <td>
                  <SickButton
                    onClick={updatePermissions}
                    type="button"
                    disabled={loading}
                  >
                    Updat{loading ? 'ing' : 'e'}
                  </SickButton>
                </td>
              </tr>
            </>
          )
        }}
      </Mutation>
    );
  }
}

export default Permissions;
