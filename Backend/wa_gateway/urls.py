from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WATemplateViewSet, WAMessageLogViewSet, SendMessageView, BroadcastView

router = DefaultRouter()
router.register(r'templates', WATemplateViewSet)
# DAFTARKAN LOGS DI SINI: Router otomatis menangani /logs/ dan /logs/id/
router.register(r'logs', WAMessageLogViewSet, basename='wa-logs')

urlpatterns = [
    path('send-message/', SendMessageView.as_view(), name='wa-send'),
    path('broadcast/', BroadcastView.as_view(), name='wa-broadcast'),
    path('', include(router.urls)),
]