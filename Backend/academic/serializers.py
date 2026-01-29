from rest_framework import serializers
from .models import Kelas, SetorHafalan
from accounts.models import User

class KelasSerializer(serializers.ModelSerializer):
    # Field untuk menampilkan nama-nama guru (Read Only)
    nama_guru = serializers.SerializerMethodField()
    
    # Field untuk menerima input banyak ID guru dari frontend
    guru_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='GURU'),
        source='guru', # Menghubungkan langsung ke field 'guru' di model
        many=True,
        required=False
    )

    class Meta:
        model = Kelas
        # PERBAIKAN: Masukkan guru_ids ke sini agar tidak error
        fields = ['id', 'nama_kelas', 'target_hafalan', 'guru_ids', 'nama_guru']

    def get_nama_guru(self, obj):
        # Mengambil semua guru dan menggabungkan nama mereka dengan koma
        gurus = obj.guru.all()
        if gurus.exists():
            return ", ".join([f"{m.first_name} {m.last_name}" for m in gurus])
        return "-"

    def validate_target_hafalan(self, value):
        clean_val = ''.join(filter(str.isdigit, str(value)))
        if not clean_val:
            return "0 Surah"
        return f"{clean_val} Surah"
    
class SetorHafalanSerializer(serializers.ModelSerializer):
    nama_siswa = serializers.SerializerMethodField()
    nama_guru = serializers.SerializerMethodField()
    nama_kelas = serializers.CharField(source='siswa.kelas', read_only=True)
    siswa_phone = serializers.CharField(source='siswa.phone_number', read_only=True)

    siswa = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='WALI_MURID')
    )
    guru = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='GURU'),
        allow_null=True, 
        required=False
    )

    class Meta:
        model = SetorHafalan
        fields = [
            'id', 'tanggal', 'juz', 'surah', 'ayat', 'jenis_setoran', 
            'nilai', 'catatan', 'siswa', 'guru', 
            'nama_siswa', 'nama_guru', 'nama_kelas', 'siswa_phone', 'wa_status',
            'adab_1', 'adab_2', 'adab_3', 'adab_4',     
        ]

    def get_nama_siswa(self, obj):
        return f"{obj.siswa.first_name} {obj.siswa.last_name}"

    def get_nama_guru(self, obj):
        if obj.guru:
            return f"{obj.guru.first_name} {obj.guru.last_name}"
        return "-"