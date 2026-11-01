from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet
from memberships.views import join_club, ClubMembersView # <-- ADD THIS IMPORT

router = DefaultRouter()
router.register(r'', ClubViewSet, basename='club')

urlpatterns = [
    path('', include(router.urls)),
    path('<slug:slug>/join/', join_club, name='club_join'),        # <-- ADD THIS
    path('<slug:slug>/members/', ClubMembersView.as_view(), name='club_members'), # <-- ADD THIS
]