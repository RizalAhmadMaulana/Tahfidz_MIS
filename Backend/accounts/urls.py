from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyTokenObtainPairView, ProfileView, ChangePasswordView, 
    UserManagementViewSet, GuruViewSet, GuruImportExcelView,
    SiswaViewSet, SiswaImportExcelView, UserImportExcelView
)

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='management-user')
router.register(r'guru', GuruViewSet, basename='data-guru') # Endpoint: /api/guru/
router.register(r'siswa', SiswaViewSet, basename='data-siswa')

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('guru/import/', GuruImportExcelView.as_view(), name='guru-import-excel'),
    path('siswa/import/', SiswaImportExcelView.as_view(), name='siswa-import-excel'),
    path('users/import/', UserImportExcelView.as_view(), name='user-import-excel'),
    path('', include(router.urls)),
]