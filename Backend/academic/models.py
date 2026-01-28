from django.db import models
from django.conf import settings # Mengambil User model dari settings

class Kelas(models.Model):
    nama_kelas = models.CharField(max_length=50, unique=True)
    target_hafalan = models.CharField(max_length=255, blank=True, null=True)
    
    # LOGIKA: Relasi ke User dengan Role Guru
    # on_delete=models.SET_NULL: Jika Guru dihapus, kelasnya jangan ikut kehapus (guru jadi kosong)
    guru = models.ManyToManyField('accounts.User', related_name='kelas_diampu')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama_kelas
    
class SetorHafalan(models.Model):
    WA_STATUS_CHOICES = (
        ('pending', 'Belum Dikirim'),
        ('sent', 'Terkirim'),
        ('failed', 'Gagal'),
    )

    JENIS_CHOICES = (
        ('Ziyadah(Hafalan Baru)', 'Ziyadah(Hafalan Baru)'),
        ('Murajaah(Mengulang)', 'Murajaah(Mengulang)'),
    )
    
    NILAI_CHOICES = (
        ('A', 'A - Sangat Baik'),
        ('B', 'B - Baik'),
        ('C', 'C - Cukup'),
        ('D', 'D - Kurang'),
    )
    
    # Default 'pending' agar saat klik "Simpan" statusnya "Belum Dikirim"
    wa_status = models.CharField(max_length=20, choices=WA_STATUS_CHOICES, default='pending')

    # Relasi ke Siswa (WALI_MURID)
    siswa = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hafalan_siswa',
        limit_choices_to={'role': 'WALI_MURID'}
    )
    
    # Relasi ke Guru (Penguji)
    guru = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='hafalan_guru',
        limit_choices_to={'role': 'GURU'}
    )

    # --- FIELD PENILAIAN ADAB & KARAKTER ---
    # Menyimpan poin 1-5 untuk setiap kriteria
    adab_1 = models.IntegerField(default=0) # Kriteria 1
    adab_2 = models.IntegerField(default=0) # Kriteria 2
    adab_3 = models.IntegerField(default=0) # Kriteria 3
    adab_4 = models.IntegerField(default=0) # Kriteria 4
    
    skor_adab = models.IntegerField(default=0)      # Skor 0-100
    predikat_adab = models.CharField(max_length=50, blank=True, null=True) # A/B/C/D
    deskripsi_adab = models.TextField(blank=True, null=True) # Deskripsi kualitas

    tanggal = models.DateField()
    juz = models.CharField(max_length=5) # Contoh: "30"
    surah = models.CharField(max_length=100) # Contoh: "An-Naba"
    ayat = models.CharField(max_length=50) # Contoh: "1-40"
    jenis_setoran = models.CharField(max_length=50, choices=JENIS_CHOICES)
    nilai = models.CharField(max_length=5, choices=NILAI_CHOICES)
    catatan = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.siswa.first_name} - {self.surah}"