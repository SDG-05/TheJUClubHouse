import json

from rest_framework import serializers

from .models import Club


class SocialLinksField(serializers.JSONField):
    """Accept social links as JSON or as a JSON string from multipart/form-data."""

    def to_internal_value(self, data):
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except (TypeError, ValueError):
                raise serializers.ValidationError("Must be a valid JSON object.")
        if data in (None, ""):
            return {}
        if not isinstance(data, dict):
            raise serializers.ValidationError("Must be a JSON object.")
        return super().to_internal_value(data)


class ManagerBasicSerializer(serializers.Serializer):
    """Read-only nested object for the club manager."""
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)


class ClubSerializer(serializers.ModelSerializer):
    manager_details = ManagerBasicSerializer(source='manager', read_only=True)
    member_count = serializers.SerializerMethodField()
    social_links = SocialLinksField(required=False)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        # Prevent privilege escalation for non-admins
        if user and getattr(user, 'is_authenticated', False) and user.role != 'ADMIN':
            validated_data.pop('manager', None)
            validated_data.pop('is_published', None)
        return super().update(instance, validated_data)

    class Meta:
        model = Club
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'logo',
            'contact_email', 'website', 'social_links', 'manager',
            'manager_details', 'member_count', 'is_published',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'created_at', 'updated_at',
            'member_count', 'manager_details'
        ]

    def get_member_count(self, obj):
        # Count only APPROVED memberships to prevent N+1 queries
        return obj.memberships.filter(status='APPROVED').count()
