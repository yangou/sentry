import {Flex} from 'grid-emotion';
import {withRouter} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import {getParams} from 'app/views/organizationEvents/utils/getParams';
import {t} from 'app/locale';
import BetaTag from 'app/components/betaTag';
import Feature from 'app/components/acl/feature';
import GlobalSelectionHeader from 'app/components/organizations/globalSelectionHeader';
import SentryTypes from 'app/sentryTypes';
import PageHeading from 'app/components/pageHeading';
import space from 'app/styles/space';
import withGlobalSelection from 'app/utils/withGlobalSelection';
import withOrganization from 'app/utils/withOrganization';

import EventsContext from './utils/eventsContext';
import SearchBar from './searchBar';

class OrganizationEventsContainer extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
    selection: SentryTypes.GlobalSelection,
    router: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  handleSearch = query => {
    let {router, location} = this.props;
    router.push({
      pathname: location.pathname,
      query: getParams({
        ...(location.query || {}),
        query,
        zoom: null,
      }),
    });
  };

  render() {
    const {organization, location, selection, children} = this.props;

    const projects =
      organization.projects && organization.projects.filter(({isMember}) => isMember);

    return (
      <EventsContext.Provider
        value={{
          project: selection.projects,
          environment: selection.environments,
          ...selection.datetime,
        }}
      >
        <OrganizationEventsContent>
          <Feature features={['global-views']} renderDisabled>
            <GlobalSelectionHeader
              organization={organization}
              projects={projects}
              initializeWithUrlParams={true}
              showAbsolute={true}
              showRelative={true}
            />

            <Body>
              <Flex align="center" justify="space-between" mb={2}>
                <HeaderTitle>
                  {t('Events')} <BetaTag />
                </HeaderTitle>
                <StyledSearchBar
                  organization={organization}
                  query={(location.query && location.query.query) || ''}
                  placeholder={t('Search for events, users, tags, and everything else.')}
                  onSearch={this.handleSearch}
                />
              </Flex>

              {children}
            </Body>
          </Feature>
        </OrganizationEventsContent>
      </EventsContext.Provider>
    );
  }
}
export default withRouter(
  withOrganization(withGlobalSelection(OrganizationEventsContainer))
);
export {OrganizationEventsContainer};

const OrganizationEventsContent = styled(Flex)`
  background-color: ${p => p.theme.whiteDark};
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  margin-bottom: -20px; /* <footer> has margin-top: 20px; */
`;

const Body = styled('div')`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${space(3)} ${space(4)};
`;

const HeaderTitle = styled(PageHeading)`
  flex: 1;
`;

const StyledSearchBar = styled(SearchBar)`
  flex: 1;
`;
