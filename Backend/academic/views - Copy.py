import pandas as pd
import io
import re
from datetime import date, timedelta
from django.http import FileResponse
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .models import Kelas, SetorHafalan
from .serializers import KelasSerializer, SetorHafalanSerializer

# Library PDF ReportLab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

User = get_user_model()

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

# --- CRUD KELAS ---
class KelasViewSet(viewsets.ModelViewSet):
    queryset = Kelas.objects.all().order_by('nama_kelas')
    serializer_class = KelasSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nama_kelas', 'musyif__first_name', 'musyif__last_name']

# --- IMPORT EXCEL KELAS ---
class KelasImportExcelView(generics.CreateAPIView):
    permission_classes = [IsAdminRole]
    parser_classes = (MultiPartParser,)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Pilih file excel terlebih dahulu!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            count = 0
            for index, row in df.iterrows():
                nip = str(row['nip_musyif'])
                musyif_obj = User.objects.filter(username=nip, role='MUSYIF').first()
                Kelas.objects.update_or_create(
                    nama_kelas=row['nama_kelas'],
                    defaults={
                        'musyif': musyif_obj,
                        'target_hafalan': str(row.get('target_hafalan', '0'))
                    }
                )
                count += 1
            return Response({"message": f"Berhasil import {count} data kelas."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- CRUD SETOR HAFALAN ---
class SetorHafalanViewSet(viewsets.ModelViewSet):
    queryset = SetorHafalan.objects.all().order_by('-tanggal', '-id')
    serializer_class = SetorHafalanSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['siswa__first_name', 'siswa__last_name', 'surah']

# --- IMPORT EXCEL HAFALAN ---
class HafalanImportExcelView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser,)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Pilih file excel!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            count = 0
            for index, row in df.iterrows():
                nisn = str(row['nisn_siswa'])
                nip = str(row['nip_musyif'])
                siswa_obj = User.objects.filter(nisn=nisn, role='WALI_MURID').first()
                musyif_obj = User.objects.filter(username=nip, role='MUSYIF').first()
                if not siswa_obj: continue

                SetorHafalan.objects.create(
                    siswa=siswa_obj,
                    musyif=musyif_obj,
                    tanggal=pd.to_datetime(row['tanggal']).date(),
                    juz=str(row['juz']),
                    surah=str(row['surah']),
                    ayat=str(row['ayat']),
                    jenis_setoran=row['jenis'],
                    nilai=str(row['nilai']),
                    catatan=str(row.get('catatan', '-'))
                )
                count += 1
            return Response({"message": f"Berhasil import {count} data."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- LOGIKA MENU LAPORAN PROGRESS ---
class LaporanViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    # 1. Logic Riwayat Terbaru
    @action(detail=False, methods=['get'])
    def riwayat(self, request):
        queryset = SetorHafalan.objects.all().order_by('-tanggal', '-id')
        kelas = request.query_params.get('kelas')
        siswa_id = request.query_params.get('siswa')
        filter_waktu = request.query_params.get('filter_waktu')

        if kelas and kelas != "Semua":
            queryset = queryset.filter(siswa__kelas=kelas)
        if siswa_id and siswa_id != "Semua":
            queryset = queryset.filter(siswa_id=siswa_id)
        
        if filter_waktu == 'hari_ini':
            queryset = queryset.filter(tanggal=date.today())
        elif filter_waktu == 'kemarin':
            queryset = queryset.filter(tanggal=date.today() - timedelta(days=1))

        serializer = SetorHafalanSerializer(queryset, many=True)
        return Response(serializer.data)

    # 2. Logic Rekap Laporan & Search
    @action(detail=False, methods=['get'])
    def rekap_data(self, request):
        dari_tgl = request.query_params.get('dari_tgl')
        sampai_tgl = request.query_params.get('sampai_tgl')
        kelas_nama = request.query_params.get('kelas')
        siswa_id = request.query_params.get('siswa')

        queryset = SetorHafalan.objects.all().order_by('tanggal')

        if dari_tgl and sampai_tgl:
            queryset = queryset.filter(tanggal__range=[dari_tgl, sampai_tgl])
        if kelas_nama and kelas_nama != "Semua":
            queryset = queryset.filter(siswa__kelas=kelas_nama)
        if siswa_id and siswa_id != "Semua":
            queryset = queryset.filter(siswa_id=siswa_id)

        summary = None
        if siswa_id and siswa_id != "Semua":
            try:
                siswa_obj = User.objects.get(id=siswa_id)
                # Hitung surah unik dari hasil filter
                total_surah = queryset.values('surah').distinct().count()
                
                target = 0
                kelas_obj = Kelas.objects.filter(nama_kelas=siswa_obj.kelas).first()
                if kelas_obj:
                    nums = re.findall(r'\d+', kelas_obj.target_hafalan or "0")
                    target = int(nums[0]) if nums else 0

                summary = {
                    "nama_siswa": f"{siswa_obj.first_name} {siswa_obj.last_name}",
                    "total_hafalan": f"{total_surah} Surah",
                    "target_hafalan": f"{target} Surah",
                    "status": "Terpenuhi" if total_surah >= target else "Belum Terpenuhi"
                }
            except User.DoesNotExist: pass

        serializer = SetorHafalanSerializer(queryset, many=True)
        return Response({"summary": summary, "details": serializer.data})

    # 3. Logic Download PDF (Match Preview)
    @action(detail=False, methods=['get'])
    def download_pdf(self, request):
        dari_tgl = request.query_params.get('dari_tgl')
        sampai_tgl = request.query_params.get('sampai_tgl')
        kelas_nama = request.query_params.get('kelas', 'Semua')
        siswa_id = request.query_params.get('siswa', 'Semua')

        queryset = SetorHafalan.objects.filter(tanggal__range=[dari_tgl, sampai_tgl]).order_by('tanggal')
        if kelas_nama != "Semua":
            queryset = queryset.filter(siswa__kelas=kelas_nama)
        if siswa_id != "Semua":
            queryset = queryset.filter(siswa_id=siswa_id)

        buffer = io.BytesIO()
        # Lebarkan margin sedikit agar catatan muat
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=25, leftMargin=25, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        
        # Style Tambahan
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16, spaceAfter=10)
        label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold')
        value_style = ParagraphStyle('ValueStyle', parent=styles['Normal'], fontSize=9)

        elements.append(Paragraph("<b>LAPORAN MUTABAAH DIGITAL MIS</b>", title_style))
        elements.append(Paragraph(f"Periode: {dari_tgl} s/d {sampai_tgl}", styles['Normal']))
        elements.append(Spacer(1, 15))

        # --- RINGKASAN (IDENTITAS & PROGRES) ---
        if siswa_id != "Semua":
            try:
                siswa_obj = User.objects.get(id=siswa_id)
                total_h = queryset.values('surah').distinct().count()
                target = 0
                kelas_obj = Kelas.objects.filter(nama_kelas=siswa_obj.kelas).first()
                if kelas_obj:
                    nums = re.findall(r'\d+', kelas_obj.target_hafalan or "0")
                    target = int(nums[0]) if nums else 0
                
                status_txt = "Terpenuhi" if total_h >= target else "Belum Terpenuhi"
                status_color = colors.green if total_h >= target else colors.red

                summary_data = [
                    [Paragraph("<b>Identitas Siswa</b>", label_style), "", Paragraph("<b>Ringkasan Progres</b>", label_style), ""],
                    [Paragraph("Nama", value_style), f": {siswa_obj.first_name} {siswa_obj.last_name}", Paragraph("Total Hafalan", value_style), f": {total_h} Surah"],
                    [Paragraph("Kelas", value_style), f": {siswa_obj.kelas}", Paragraph("Target Kelas", value_style), f": {target} Surah"],
                    [Paragraph("NISN", value_style), f": {siswa_obj.nisn}", Paragraph("Status", value_style), Paragraph(f": <b>{status_txt}</b>", ParagraphStyle('s', textColor=status_color, fontSize=9))],
                ]
                sum_table = Table(summary_data, colWidths=[80, 180, 80, 180])
                sum_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE'), ('LINEBELOW', (0,0), (1,0), 1, colors.grey), ('LINEBELOW', (2,0), (3,0), 1, colors.grey)]))
                elements.append(sum_table)
                elements.append(Spacer(1, 20))
            except User.DoesNotExist: pass

        # --- TABEL DETAIL (DENGAN KOLOM CATATAN) ---
        elements.append(Paragraph("<b>Detail Setoran Hafalan:</b>", label_style))
        elements.append(Spacer(1, 5))
        
        data = [["No", "Tanggal", "Nama Siswa", "Surah", "Juz", "Ayat", "Jenis", "Nilai", "Catatan"]]
        for idx, h in enumerate(queryset, 1):
            data.append([
                idx, h.tanggal.strftime('%d/%m/%y'), h.siswa.first_name, h.surah, 
                h.juz, h.ayat, h.jenis_setoran, h.nilai, 
                Paragraph(h.catatan or "-", value_style) # Paragraph agar teks wrap
            ])

        # Widths: No(20), Tgl(55), Nama(70), Surah(70), Juz(25), Ayat(55), Jenis(60), Nilai(30), Catatan(145)
        main_table = Table(data, colWidths=[20, 55, 70, 70, 25, 55, 60, 30, 145])
        main_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1B4332")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (7, -1), 'CENTER'),
            ('ALIGN', (8, 0), (8, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        
        elements.append(main_table)
        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f'Laporan_Mutabaah_{date.today()}.pdf')