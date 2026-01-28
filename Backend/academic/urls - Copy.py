from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KelasViewSet, KelasImportExcelView,
    SetorHafalanViewSet, HafalanImportExcelView,
    LaporanViewSet # Tambahkan LaporanViewSet
)

router = DefaultRouter()
router.register(r'kelas', KelasViewSet, basename='kelola-kelas')
router.register(r'hafalan', SetorHafalanViewSet, basename='setor-hafalan')
router.register(r'laporan', LaporanViewSet, basename='laporan-progress') # Endpoint: /api/academic/laporan/

urlpatterns = [
    path('kelas/import/', KelasImportExcelView.as_view(), name='kelas-import'),
    path('hafalan/import/', HafalanImportExcelView.as_view(), name='hafalan-import'),
    path('', include(router.urls)),
]