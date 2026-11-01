from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ("STUDENT", "Student"),
        ("CLUB_MANAGER", "Club Manager"),
        ("ADMIN", "Admin"),
    ]

    # id is automatically created as BigAutoField due to DEFAULT_AUTO_FIELD in settings.py
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default="STUDENT"
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email
