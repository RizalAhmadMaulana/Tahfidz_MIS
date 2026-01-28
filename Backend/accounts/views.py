import pandas as pd
from rest_framework import status, generics, viewsets, permissions, filters 
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer, UpdateProfileSerializer, MyTokenObtainPairSerializer, 
    ChangePasswordSerializer, ManagementUserSerializer, GuruSerializer, 
    SiswaSerializer
)

User = get_user_model()

class IsAdminOrGuru(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'GURU'])

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

# --- LOGIC LOGIN & PROFILE ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    def get_object(self): return self.request.user
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = UpdateProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    def get_object(self): return self.request.user
    def update(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = self.get_object()
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Password lama salah."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get("new_password"))
            user.save()
            update_session_auth_hash(request, user)
            return Response({"message": "Password berhasil diubah"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = ManagementUserSerializer
    permission_classes = [IsAdminRole]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email', 'role']

class UserImportExcelView(generics.CreateAPIView):
    permission_classes = [IsAdminRole]
    parser_classes = (MultiPartParser,)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Pilih file excel terlebih dahulu!"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            df = pd.read_excel(file)
            count = 0
            for _, row in df.iterrows():
                username = str(row['username'])
                # Cek jika user sudah ada
                if not User.objects.filter(username=username).exists():
                    role = str(row.get('role', 'WALI_MURID')).upper()
                    password = str(row.get('password', username))
                    
                    user = User.objects.create_user(
                        username=username,
                        first_name=row.get('first_name', ''),
                        last_name=row.get('last_name', ''),
                        email=row.get('email', ''),
                        phone_number=str(row.get('phone_number', '')),
                        role=role,
                        password=password
                    )
                    
                    # Sinkronisasi NIP/NISN berdasarkan role
                    if role == 'GURU': user.nip = username
                    elif role == 'WALI_MURID': user.nisn = username
                    user.save()
                    
                    count += 1
            return Response({"message": f"Berhasil mengimport {count} user baru."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- LOGIC CRUD DATA GURU (FILTER KELAS) ---
class GuruViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='GURU').order_by('-id')
    serializer_class = GuruSerializer
    permission_classes = [IsAdminOrGuru]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'nip']

    # PERBAIKAN LOGIK: Filter Guru berdasarkan kelas yang diampu di tabel academic.Kelas
    def get_queryset(self):
        queryset = super().get_queryset()
        kelas_param = self.request.query_params.get('kelas')
        if kelas_param:
            # Kita filter Guru yang mengajar di kelas_diampu yang nama_kelasnya cocok
            queryset = queryset.filter(kelas_diampu__nama_kelas__iexact=kelas_param).distinct()
        return queryset

class GuruImportExcelView(generics.CreateAPIView):
    permission_classes = [IsAdminRole]
    parser_classes = (MultiPartParser,)
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file: return Response({"error": "Pilih file excel!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            count = 0
            for _, row in df.iterrows():
                nip_str = str(row['nip'])
                if not User.objects.filter(nip=nip_str).exists():
                    User.objects.create_user(
                        username=nip_str, first_name=row.get('first_name',''), last_name=row.get('last_name',''),
                        gender=row.get('gender','Laki Laki'), nip=nip_str, birth_info=str(row.get('birth_info','')),
                        phone_number=str(row.get('phone_number','')), email=row.get('email',''), role='GURU', password=nip_str
                    )
                    count += 1
            return Response({"message": f"Berhasil mengimport {count} Guru."}, status=status.HTTP_201_CREATED)
        except Exception as e: return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- LOGIKA CRUD DATA SISWA (FILTER KELAS) ---
class SiswaViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='WALI_MURID').order_by('first_name')
    serializer_class = SiswaSerializer
    permission_classes = [IsAdminOrGuru]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'nisn', 'kelas']

    def get_queryset(self):
        queryset = super().get_queryset()
        kelas_param = self.request.query_params.get('kelas')
        if kelas_param:
            queryset = queryset.filter(kelas__iexact=kelas_param)
        return queryset

class SiswaImportExcelView(generics.CreateAPIView):
    permission_classes = [IsAdminOrGuru]
    parser_classes = (MultiPartParser,)
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file: return Response({"error": "Pilih file excel!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            count = 0
            for _, row in df.iterrows():
                nisn_str = str(row['nisn'])
                if not User.objects.filter(nisn=nisn_str).exists():
                    User.objects.create_user(
                        username=nisn_str, first_name=row.get('first_name',''), last_name=row.get('last_name',''),
                        gender=row.get('gender','Laki Laki'), nisn=nisn_str, kelas=str(row.get('kelas','1 A')),
                        birth_info=str(row.get('birth_info','')), phone_number=str(row.get('phone_number','')),
                        email=row.get('email',''), role='WALI_MURID', password=nisn_str
                    )
                    count += 1
            return Response({"message": f"Berhasil mengimport {count} Siswa."}, status=status.HTTP_201_CREATED)
        except Exception as e: return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)