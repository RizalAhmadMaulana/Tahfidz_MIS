from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator

User = get_user_model()

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['username'] = user.username
        data['role'] = user.role
        data['name'] = f"{user.first_name} {user.last_name}"
        
        # 1. LOGIKA: Cek apakah password masih default (sama dengan username)
        data['is_default'] = user.check_password(user.username)
        
        # 2. LOGIKA: Cek apakah profil sudah lengkap
        # Dianggap lengkap jika Email, No HP, Jenis Kelamin, dan Info Lahir sudah terisi
        data['is_profile_complete'] = all([
            user.email, 
            user.phone_number, 
            user.gender, 
            user.birth_info
        ])
        
        return data

# --- LOGIKA SINKRONISASI TOTAL: Management User ---
class ManagementUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'password', 'nip', 'nisn')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role')
        username = validated_data.get('username')
        
        if role == 'GURU': validated_data['nip'] = username
        elif role == 'WALI_MURID': validated_data['nisn'] = username
            
        user = User.objects.create(**validated_data)
        user.set_password(password if password else username)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        old_role = instance.role
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        new_role = instance.role
        
        if new_role == 'GURU':
            instance.nip = instance.username
            instance.nisn = None
            if not password and old_role != 'GURU':
                instance.set_password(instance.username)
        
        elif new_role == 'WALI_MURID':
            instance.nisn = instance.username
            instance.nip = None
            if not password and old_role != 'WALI_MURID':
                instance.set_password(instance.username)
        
        else: 
            instance.nip = None
            instance.nisn = None
        
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance

# --- LOGIKA: Data Guru ---
class GuruSerializer(serializers.ModelSerializer):
    kelas_ampu = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'gender', 'nip', 'birth_info', 'phone_number', 'email', 'kelas_ampu')
    
    def get_kelas_ampu(self, obj):
        try:
            kelasList = obj.kelas_diampu.all()
            if kelasList.exists():
                return ", ".join([k.nama_kelas for k in kelasList])
            return "-"
        except AttributeError:
            return "-"

    def create(self, validated_data):
        val = str(validated_data.get('nip'))
        validated_data.update({'username': val, 'role': 'GURU', 'nisn': None})
        user = User.objects.create(**validated_data)
        user.set_password(val)
        user.save()
        return user
    def update(self, instance, validated_data):
        new_val = str(validated_data.get('nip', instance.nip))
        if new_val != str(instance.nip):
            instance.username = new_val
            instance.set_password(new_val)
        for attr, value in validated_data.items(): setattr(instance, attr, value)
        instance.save()
        return instance
    
# --- LOGIKA: Data Siswa ---
class SiswaSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'gender', 'nisn', 'kelas', 'birth_info', 'phone_number', 'email')
    def create(self, validated_data):
        val = str(validated_data.get('nisn'))
        validated_data.update({'username': val, 'role': 'WALI_MURID', 'nip': None})
        user = User.objects.create(**validated_data)
        user.set_password(val)
        user.save()
        return user
    def update(self, instance, validated_data):
        new_val = str(validated_data.get('nisn', instance.nisn))
        if new_val != str(instance.nisn):
            instance.username = new_val
            instance.set_password(new_val)
        for attr, value in validated_data.items(): setattr(instance, attr, value)
        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'profile_photo', 'gender', 'nip', 'birth_info', 'nisn', 'kelas')
        read_only_fields = ('username', 'role')

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'profile_photo')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)