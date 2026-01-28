from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrator'),
        ('GURU', 'Guru'),
        ('WALI_MURID', 'Wali Murid'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='WALI_MURID')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    
    # FIELD IDENTITAS (DIPAKAI GURU & SISWA)
    gender = models.CharField(max_length=20, choices=(('Laki Laki', 'Laki Laki'), ('Perempuan', 'Perempuan')), blank=True, null=True)
    birth_info = models.CharField(max_length=255, blank=True, null=True) 

    # FIELD KHUSUS GURU
    nip = models.CharField(max_length=50, blank=True, null=True, unique=True)

    # FIELD KHUSUS SISWA
    nisn = models.CharField(max_length=50, blank=True, null=True, unique=True)
    kelas = models.CharField(max_length=50, blank=True, null=True) # Sementara CharField dummy

    def __str__(self):
        return f"{self.username} - {self.role}" 