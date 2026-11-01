from django.urls import path
from .views import MyMembershipsView, LeaveMembershipView, ManagerRequestsView, ManagerUpdateRequestView

urlpatterns = [
    path('memberships/my/', MyMembershipsView.as_view(), name='my_memberships'),
    path('memberships/<int:id>/', LeaveMembershipView.as_view(), name='leave_membership'),
    path('manager/membership-requests/', ManagerRequestsView.as_view(), name='manager_requests'),
    path('manager/membership-requests/<int:id>/', ManagerUpdateRequestView.as_view(), name='manager_update_request'),
]