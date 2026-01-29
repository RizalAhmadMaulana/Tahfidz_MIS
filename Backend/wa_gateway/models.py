from django.db import models

class WATemplate(models.Model):
    NAMA_KEGUNAAN = (
        ('setor_hafalan', 'Konfirmasi Setor Hafalan'),
        ('broadcast_umum', 'Broadcast Umum'),
    )
    nama = models.CharField(max_length=50, choices=NAMA_KEGUNAAN, unique=True)
    pesan = models.TextField(help_text="Gunakan tag [nama_siswa], [surah], [nilai],[ket_adab]")

    def __str__(self):
        return self.nama

class WAMessageLog(models.Model):
    STATUS_CHOICES = (
        ('terkirim', 'Terkirim'),
        ('delay', 'Delay'),
        ('gagal', 'Gagal'),
    )
    nama_siswa = models.CharField(max_length=100, blank=True, null=True)
    penerima = models.CharField(max_length=20)
    pesan = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']