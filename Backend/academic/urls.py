from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KelasViewSet, KelasImportExcelView,
    SetorHafalanViewSet, HafalanImportExcelView,
    LaporanViewSet,
    DashboardViewSet # Tambahkan ini
)

router = DefaultRouter()
router.register(r'kelas', KelasViewSet, basename='kelola-kelas')
router.register(r'hafalan', SetorHafalanViewSet, basename='setor-hafalan')
router.register(r'laporan', LaporanViewSet, basename='laporan-progress')
router.register(r'dashboard', DashboardViewSet, basename='dashboard') # Endpoint: /api/academic/dashboard/summary/

urlpatterns = [
    path('kelas/import/', KelasImportExcelView.as_view(), name='kelas-import'),
    path('hafalan/import/', HafalanImportExcelView.as_view(), name='hafalan-import'),
    path('', include(router.urls)),
]