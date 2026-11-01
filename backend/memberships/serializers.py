from rest_framework import serializers
from .models import Membership
from accounts.serializers import UserSerializer
from clubs.serializers import ClubSerializer

class MembershipSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    club_details = ClubSerializer(source='club', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'student', 'student_details', 'club', 'club_details',
            'status', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'student', 'club', 'applied_at', 'updated_at']

class ManagerActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])