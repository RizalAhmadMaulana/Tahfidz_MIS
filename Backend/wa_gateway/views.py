import requests
import time
import base64 # Tambahkan library base64
from rest_framework import viewsets, status, generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import WATemplate, WAMessageLog
from .serializers import WATemplateSerializer, WAMessageLogSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class WATemplateViewSet(viewsets.ModelViewSet):
    queryset = WATemplate.objects.all()
    serializer_class = WATemplateSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'nama'

class WAMessageLogViewSet(viewsets.ModelViewSet):
    queryset = WAMessageLog.objects.all().order_by('-timestamp')
    serializer_class = WAMessageLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nama_siswa', 'penerima', 'pesan']

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        number = request.data.get('number')
        message = request.data.get('message')
        nama_siswa = request.data.get('nama_siswa', '-')
        payload = {"sender": "admin_mis", "number": number, "message": message}
        try:
            # Gunakan json=payload agar konsisten
            res = requests.post("http://localhost:6969/send-message", json=payload, timeout=10)
            status_wa = 'terkirim' if res.status_code == 200 else 'gagal'
            WAMessageLog.objects.create(
                nama_siswa=nama_siswa,
                penerima=number, 
                pesan=message, 
                status=status_wa)
            return Response({"status": status_wa}, status=res.status_code)
        except:
            return Response({"error": "Gateway Node.js Mati"}, status=500)

class BroadcastView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        nama_kelas = request.data.get('kelas')
        message_template = request.data.get('message')
        delay = int(request.data.get('delay', 5))
        media = request.FILES.get('media')
        
        query = User.objects.filter(role='WALI_MURID')
        if nama_kelas != "Semua":
            query = query.filter(kelas__iexact=nama_kelas)
        
        # LOGIKA: Encode media ke Base64 (Sekali saja)
        encoded_media, mimetype, media_name = None, None, None
        if media:
            try:
                media.seek(0)
                encoded_media = base64.b64encode(media.read()).decode('utf-8')
                mimetype = media.content_type
                media_name = media.name
            except Exception as e:
                print(f"Encoding Error: {e}")

        success, failed = 0, 0
        for user in query:
            if user.phone_number:
                pesan = message_template.replace("[nama_siswa]", f"{user.first_name} {user.last_name}")
                payload = {
                    "sender": "admin_mis", 
                    "number": user.phone_number, 
                    "message": pesan
                }
                if encoded_media:
                    payload.update({"media": encoded_media, "mimetype": mimetype, "media_name": media_name})

                try:
                    # Timeouts ditingkatkan karena upload Base64 butuh waktu lebih
                    res = requests.post("http://localhost:6969/send-message", json=payload, timeout=40)
                    
                    if res.status_code == 200: success += 1
                    else: failed += 1
                    
                    WAMessageLog.objects.create(
                        nama_siswa=full_name,
                        penerima=user.phone_number, 
                        pesan=f"(MEDIA) {pesan}" if encoded_media else pesan, 
                        status='terkirim' if res.status_code == 200 else 'gagal'
                    )
                except Exception as e:
                    print(f"Gagal kirim ke {user.phone_number}: {e}")
                    failed += 1
                
                time.sleep(delay)

        return Response({"summary": {"total": query.count(), "success": success, "failed": failed}})