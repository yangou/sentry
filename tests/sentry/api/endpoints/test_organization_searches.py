from __future__ import absolute_import

from django.core.urlresolvers import reverse
from django.utils import timezone
from exam import fixture

from sentry.api.serializers import serialize
from sentry.models import SavedSearch
from sentry.models.savedsearch import DEFAULT_SAVED_SEARCHES
from sentry.testutils import APITestCase


class OrganizationSearchesListTest(APITestCase):
    @fixture
    def user(self):
        return self.create_user('test@test.com')

    def test_simple(self):
        self.login_as(user=self.user)
        team = self.create_team(members=[self.user])
        project1 = self.create_project(teams=[team], name='foo')
        project2 = self.create_project(teams=[team], name='bar')

        SavedSearch.objects.create(
            project=project1,
            name='bar',
            query=DEFAULT_SAVED_SEARCHES[0]['query'],
        )
        included = [
            SavedSearch.objects.create(
                project=project1,
                name='foo',
                query='some test',
                date_added=timezone.now().replace(microsecond=0)
            ),
            SavedSearch.objects.create(
                project=project1,
                name='wat',
                query='is:unassigned is:unresolved',
                date_added=timezone.now().replace(microsecond=0)
            ),
            SavedSearch.objects.create(
                project=project2,
                name='foo',
                query='some test',
                date_added=timezone.now().replace(microsecond=0)
            ),
        ]
        for default_saved_search in DEFAULT_SAVED_SEARCHES:
            included.append(SavedSearch(
                name=default_saved_search['name'],
                query=default_saved_search['query'],
            ))

        included.sort(key=lambda search: search.name)

        url = reverse(
            'sentry-api-0-organization-searches',
            kwargs={
                'organization_slug': self.organization.slug,
            }
        )
        response = self.client.get(url, format='json')

        assert response.status_code == 200, response.content
        assert response.data == serialize(included)
