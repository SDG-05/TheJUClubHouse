from rest_framework import viewsets
from django.db.models import Q
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

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # 1. Search Filter (?search=keyword)
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )
            
        # 2. Category Filter (?category=TECHNOLOGY)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
            
        return queryset