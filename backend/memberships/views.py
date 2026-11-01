from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Membership
from .serializers import MembershipSerializer, ManagerActionSerializer
from clubs.models import Club
from accounts.permissions import IsStudentRole, IsClubManagerOrAdmin

# 1. POST /api/clubs/<slug>/join/
@api_view(['POST'])
@permission_classes([IsStudentRole])
def join_club(request, slug):
    club = get_object_or_404(Club, slug=slug)
    student = request.user

    membership = Membership.objects.filter(student=student, club=club).first()

    if not membership:
        membership = Membership.objects.create(student=student, club=club, status='PENDING')
        serializer = MembershipSerializer(membership, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    if membership.status in ['PENDING', 'APPROVED']:
        return Response(
            {"detail": "You already have a pending or approved membership for this club."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if membership.status == 'REJECTED':
        # Re-application Fix: Update existing record instead of duplicating
        membership.status = 'PENDING'
        membership.applied_at = timezone.now()
        membership.save()
        serializer = MembershipSerializer(membership, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

# 2. GET /api/memberships/my/
class MyMembershipsView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsStudentRole]

    def get_queryset(self):
        return Membership.objects.filter(student=self.request.user).select_related('student', 'club')

# 3. DELETE /api/memberships/<id>/ (Leave/Withdraw)
class LeaveMembershipView(generics.DestroyAPIView):
    queryset = Membership.objects.all()
    permission_classes = [IsStudentRole]
    lookup_field = 'id'

    def get_queryset(self):
        return Membership.objects.filter(student=self.request.user)

# 4. GET /api/clubs/<slug>/members/
class ClubMembersView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        slug = self.kwargs['slug']
        return Membership.objects.filter(club__slug=slug, status='APPROVED').select_related('student', 'club')

# 5. GET /api/manager/membership-requests/
class ManagerRequestsView(generics.ListAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsClubManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = Membership.objects.select_related('student', 'club')
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if user.role == 'ADMIN':
            return queryset
        return queryset.filter(club__manager=user) # CLUB_MANAGER sees only their club

# 6. PATCH /api/manager/membership-requests/<id>/
class ManagerUpdateRequestView(generics.UpdateAPIView):
    queryset = Membership.objects.all()
    serializer_class = ManagerActionSerializer
    permission_classes = [IsClubManagerOrAdmin]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        membership = self.get_object()
        
        # Object-level permission check
        if request.user.role != 'ADMIN' and membership.club.manager_id != request.user.id:
            return Response({"detail": "You do not have permission to manage this club's requests."}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        membership.status = serializer.validated_data['status']
        membership.save()
        
        return Response(MembershipSerializer(membership, context={'request': request}).data, status=status.HTTP_200_OK)