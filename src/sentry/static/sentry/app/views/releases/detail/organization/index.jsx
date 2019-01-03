import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

import SentryTypes from 'app/sentryTypes';
import Feature from 'app/components/acl/feature';
import {t} from 'app/locale';
import Alert from 'app/components/alert';
import LoadingError from 'app/components/loadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import withOrganization from 'app/utils/withOrganization';
import {PageContent} from 'app/styles/organization';

import ReleaseHeader from '../shared/releaseHeader';
import {getRelease} from '../shared/utils';

class OrganizationReleaseDetails extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization,
  };

  static childContextTypes = {
    release: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      release: null,
      loading: true,
      error: false,
    };
  }

  getChildContext() {
    return {
      release: this.state.release,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  getTitle() {
    const {params: {version}, organization} = this.props;
    return `Release ${version} | ${organization.slug}`;
  }

  fetchData() {
    this.setState({
      loading: true,
      error: false,
    });

    const {orgId, version} = this.props.params;

    getRelease(orgId, version)
      .then(release => {
        this.setState({loading: false, release});
      })
      .catch(() => {
        this.setState({loading: false, error: true});
      });
  }

  renderNoAccess() {
    return (
      <PageContent>
        <Alert type="warning">{t("You don't have access to this feature")}</Alert>
      </PageContent>
    );
  }

  renderContent() {
    const release = this.state.release;
    const {orgId, projectId} = this.props.params;

    if (this.state.loading) return <LoadingIndicator />;
    if (this.state.error) return <LoadingError onRetry={this.fetchData} />;

    return (
      <PageContent>
        <Feature
          features={['organizations:sentry10']}
          organization={this.props.organization}
          renderDisabled={this.renderNoAccess}
        >
          <ReleaseHeader release={release} orgId={orgId} projectId={projectId} />
          {/*React.cloneElement(this.props.children, {
          release,
          environment: this.props.environment,
        })*/}
        </Feature>
      </PageContent>
    );
  }

  render() {
    return <DocumentTitle title={this.getTitle()}>{this.renderContent()}</DocumentTitle>;
  }
}

export default withOrganization(OrganizationReleaseDetails);
