from __future__ import absolute_import

import six

from sentry.api.serializers import Serializer, register
from sentry.models import SavedSearch, SavedSearchUserDefault


@register(SavedSearch)
class SavedSearchSerializer(Serializer):
    def get_attrs(self, item_list, user):
        if user.is_authenticated():
            user_defaults = tuple(
                SavedSearchUserDefault.objects.filter(
                    savedsearch__in=item_list,
                    user=user,
                ).values_list('savedsearch', flat=True)
            )
        else:
            user_defaults = ()

        attrs = {}
        for item in item_list:
            attrs[item] = {
                'isUserDefault': item.id in user_defaults,
            }
        return attrs

    def serialize(self, obj, attrs, user):
        is_virtual = obj.id is None
        return {
            'id': six.text_type(obj.id) if not is_virtual else None,
            'projectId': obj.project_id,
            'name': obj.name,
            'query': obj.query,
            'isDefault': obj.is_default,
            'isUserDefault': attrs['isUserDefault'],
            'dateCreated': obj.date_added if not is_virtual else None,
            'isPrivate': bool(obj.owner),
            # Whether this is a virtual search that doesn't exist in the
            # database. Used so Sentry can provide default searches.
            'isVirtual': is_virtual,
        }
