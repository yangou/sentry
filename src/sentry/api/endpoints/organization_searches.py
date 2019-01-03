from __future__ import absolute_import

from rest_framework.response import Response
from django.db.models import Q

from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.serializers import serialize
from sentry.models.savedsearch import (
    DEFAULT_SAVED_SEARCH_QUERIES,
    DEFAULT_SAVED_SEARCHES,
    SavedSearch,
)


class OrganizationSearchesEndpoint(OrganizationEndpoint):

    def get(self, request, organization):
        """
        List an Organization's saved searches

        Retrieve a list of saved searches for a given Organization. For custom
        saved searches, return them for all projects even if we have duplicates.
        For default searches, just return one of each search

            {method} {path}

        """
        saved_searches = list(SavedSearch.objects.filter(
            Q(owner=request.user) | Q(owner__isnull=True),
            project_id__in=self.get_project_ids(request, organization),
        ).exclude(query__in=DEFAULT_SAVED_SEARCH_QUERIES))

        for default_saved_search in DEFAULT_SAVED_SEARCHES:
            saved_searches.append(SavedSearch(
                name=default_saved_search['name'],
                query=default_saved_search['query'],
            ))

        saved_searches.sort(key=lambda search: search.name)
        return Response(serialize(saved_searches, request.user))
