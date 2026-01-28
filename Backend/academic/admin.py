from django.contrib import admin
from .models import Kelas, SetorHafalan

# Agar tampilan tabel Kelas rapi
@admin.register(Kelas)
class KelasAdmin(admin.ModelAdmin):
    list_display = ('nama_kelas', 'target_hafalan', 'created_at')
    search_fields = ('nama_kelas',)

# Agar tampilan tabel Setor Hafalan rapi
@admin.register(SetorHafalan)
class SetorHafalanAdmin(admin.ModelAdmin):
    list_display = ('siswa', 'tanggal', 'surah', 'jenis_setoran', 'nilai', 'wa_status')
    list_filter = ('jenis_setoran', 'nilai', 'wa_status', 'tanggal')
    search_fields = ('siswa__first_name', 'siswa__last_name', 'surah')
    list_per_page = 20