from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from accounts.permissions import IsAdminRole, IsAssignedClubManagerOrAdmin
from .models import Club
from .serializers import ClubSerializer


class ClubViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Club instances.
    Standardized to use `slug` as the lookup field.
    Supports ?search= and ?category= query parameters.
    """
    # select_related prevents N+1 query issues when fetching manager_details
    queryset = Club.objects.select_related('manager').all()
    serializer_class = ClubSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            permission_classes = [IsAdminRole]
        elif self.action in ('update', 'partial_update'):
            permission_classes = [IsAssignedClubManagerOrAdmin]
        else:
            permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # 1. Visibility filter (list only)
        if self.action == 'list':
            if not (
                user.is_authenticated
                and user.role in ('ADMIN', 'CLUB_MANAGER')
            ):
                queryset = queryset.filter(is_published=True)
            elif user.role == 'CLUB_MANAGER':
                # Managers see published clubs plus unpublished clubs they manage
                queryset = queryset.filter(Q(is_published=True) | Q(manager=user))

        # 2. Search Filter (?search=keyword)
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )

        # 3. Category Filter (?category=TECHNOLOGY)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset
