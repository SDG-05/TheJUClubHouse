# Phase 3 will register the Club model here.
from django.contrib import admin
from .models import Club

@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "manager", "is_published", "created_at")
    list_filter = ("category", "is_published")
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}