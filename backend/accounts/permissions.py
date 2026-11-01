from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class IsClubManagerOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['CLUB_MANAGER', 'ADMIN']

class IsAssignedClubManagerOrAdmin(BasePermission):
    """Object-level permission for editing a specific club."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True
        if request.user.role == 'CLUB_MANAGER':
            return obj.manager_id == request.user.id
        return False

class IsStudentRole(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'STUDENT'