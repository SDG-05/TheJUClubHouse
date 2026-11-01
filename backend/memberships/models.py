# Phase 3 will define the Membership model here.
from django.db import models
from django.conf import settings


class Membership(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    club = models.ForeignKey(
        "clubs.Club",
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "club"], name="unique_student_club_membership"
            )
        ]
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.student.email} - {self.club.name} ({self.status})"