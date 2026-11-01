# Phase 3 will define the Club model here.
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class Club(models.Model):
    CATEGORY_CHOICES = [
        ("TECHNOLOGY", "Technology"),
        ("ACADEMIC", "Academic"),
        ("ARTS", "Arts"),
        ("SPORTS", "Sports"),
        ("COMMUNITY", "Community"),
    ]

    # id is automatically BigAutoField due to DEFAULT_AUTO_FIELD in settings.py
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="COMMUNITY")
    logo = models.ImageField(upload_to="club_logos/", null=True, blank=True)
    contact_email = models.EmailField()
    website = models.URLField(blank=True, default="")
    social_links = models.JSONField(default=dict, blank=True)
    
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_clubs",
    )
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)