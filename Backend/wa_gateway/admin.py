from django.contrib import admin
from .models import WATemplate, WAMessageLog

@admin.register(WATemplate)
class WATemplateAdmin(admin.ModelAdmin):
    list_display = ('nama', 'pesan')

@admin.register(WAMessageLog)
class WAMessageLogAdmin(admin.ModelAdmin):
    list_display = ('penerima', 'nama_siswa', 'pesan', 'status', 'timestamp')
    list_filter = ('status', 'timestamp')
    search_fields = ('penerima', 'nama_siswa')
    readonly_fields = ('timestamp',) # Agar tanggal tidak bisa diedit manual