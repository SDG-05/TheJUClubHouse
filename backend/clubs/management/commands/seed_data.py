from django.core.management.base import BaseCommand
from accounts.models import User
from clubs.models import Club


class Command(BaseCommand):
    help = "Seeds the database with initial users and clubs"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        # 1. Create Users
        users_data = [
            {
                "email": "admin@university.edu",
                "name": "System Admin",
                "role": "ADMIN",
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "email": "manager.robotics@university.edu",
                "name": "Robotics Manager",
                "role": "CLUB_MANAGER",
            },
            {
                "email": "manager.debate@university.edu",
                "name": "Debate Manager",
                "role": "CLUB_MANAGER",
            },
            {
                "email": "student1@university.edu",
                "name": "Student One",
                "role": "STUDENT",
            },
            {
                "email": "student2@university.edu",
                "name": "Student Two",
                "role": "STUDENT",
            },
        ]

        user_objects = {}
        for data in users_data:
            email = data.pop("email")
            name = data.pop("name")
            user, created = User.objects.get_or_create(
                email=email,
                defaults={"name": name, **data},
            )
            if created:
                user.set_password("Pass1234!")
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))
            else:
                self.stdout.write(f"User already exists: {email}")
            
            user_objects[email] = user

        # 2. Create Clubs
        clubs_data = [
            {
                "name": "Robotics Club",
                "slug": "robotics-club",
                "description": "Designing autonomous rovers, drones, and embedded systems.",
                "category": "TECHNOLOGY",
                "manager": user_objects["manager.robotics@university.edu"],
                "contact_email": "robotics@university.edu",
                "website": "https://robotics.university.edu",
                "is_published": True,
            },
            {
                "name": "Debate Society",
                "slug": "debate-society",
                "description": "Practicing public speaking, argumentation, and competitive debating.",
                "category": "ACADEMIC",
                "manager": user_objects["manager.debate@university.edu"],
                "contact_email": "debate@university.edu",
                "website": "https://debate.university.edu",
                "is_published": True,
            },
            {
                "name": "Photography Club",
                "slug": "photography-club",
                "description": "Exploring photography, editing, and visual storytelling.",
                "category": "ARTS",
                "manager": None,
                "contact_email": "photo@university.edu",
                "website": "https://photo.university.edu",
                "is_published": True,
            },
        ]

        for data in clubs_data:
            club, created = Club.objects.get_or_create(
                slug=data["slug"],
                defaults=data,
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created club: {club.name}"))
            else:
                self.stdout.write(f"Club already exists: {club.name}")

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))