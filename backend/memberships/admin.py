# Phase 3 will register the Membership model here.
from django.contrib import admin
from .models import Membership

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ("student", "club", "status", "applied_at")
    list_filter = ("status",)
    search_fields = ("student__email", "club__name")