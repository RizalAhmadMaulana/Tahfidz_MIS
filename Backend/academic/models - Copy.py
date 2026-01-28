from django.db import models
from django.conf import settings # Mengambil User model dari settings

class Kelas(models.Model):
    nama_kelas = models.CharField(max_length=50, unique=True)
    target_hafalan = models.CharField(max_length=255, blank=True, null=True)
    
    # LOGIKA: Relasi ke User dengan Role Musyif
    # on_delete=models.SET_NULL: Jika Musyif dihapus, kelasnya jangan ikut kehapus (musyif jadi kosong)
    musyif = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='kelas_diampu',
        limit_choices_to={'role': 'MUSYIF'} # Filter hanya user Musyif yang bisa dipilih
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama_kelas
    
class SetorHafalan(models.Model):
    JENIS_CHOICES = (
        ('Ziyadah', 'Ziyadah'),
        ('Murajaah', 'Murajaah'),
    )
    
    NILAI_CHOICES = (
        ('A', 'A - Sangat Baik'),
        ('B', 'B - Baik'),
        ('C', 'C - Cukup'),
        ('D', 'D - Kurang'),
    )
    
    wa_sent = models.BooleanField(default=False)

    # Relasi ke Siswa (WALI_MURID)
    siswa = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hafalan_siswa',
        limit_choices_to={'role': 'WALI_MURID'}
    )
    
    # Relasi ke Musyif (Penguji)
    musyif = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='hafalan_musyif',
        limit_choices_to={'role': 'MUSYIF'}
    )

    tanggal = models.DateField()
    juz = models.CharField(max_length=5) # Contoh: "30"
    surah = models.CharField(max_length=100) # Contoh: "An-Naba"
    ayat = models.CharField(max_length=50) # Contoh: "1-40"
    jenis_setoran = models.CharField(max_length=20, choices=JENIS_CHOICES)
    nilai = models.CharField(max_length=5, choices=NILAI_CHOICES)
    catatan = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.siswa.first_name} - {self.surah}"