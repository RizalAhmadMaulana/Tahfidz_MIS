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
from django.db.models import Count, Q

# Library PDF ReportLab
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Library Tambahan untuk Grafik di PDF
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
import requests
from wa_gateway.models import WATemplate, WAMessageLog

User = get_user_model()

def calculate_adab_score(instance):
    total_poin = instance.adab_1 + instance.adab_2 + instance.adab_3 + instance.adab_4
    skor_akhir = (total_poin / 20) * 100
    
    if skor_akhir >= 91:
        predikat = "Sangat Baik (A)"
        deskripsi = "Menjadi Teladan. Konsisten menunjukkan adab yang luhur."
    elif skor_akhir >= 76:
        predikat = "Baik (B)"
        deskripsi = "Membudaya. Sering menunjukkan perilaku positif."
    elif skor_akhir >= 60:
        predikat = "Cukup (C)"
        deskripsi = "Mulai Terlihat. Perilaku baik muncul jika ada aturan."
    else:
        predikat = "Kurang (D)"
        deskripsi = "Perlu Bimbingan. Sering melanggar norma."
        
    instance.skor_adab = int(skor_akhir)
    instance.predikat_adab = predikat
    instance.deskripsi_adab = deskripsi
    # Update field hasil perhitungan saja
    instance.save(update_fields=['skor_adab', 'predikat_adab', 'deskripsi_adab'])

def send_auto_wa(instance):
    """
    LOGIKA: Mengirim laporan hafalan otomatis menggunakan template
    """
    try:
        # 1. Ambil template 'setor_hafalan'
        template = WATemplate.objects.get(nama='setor_hafalan')
        pesan_raw = template.pesan
        
        # 2. Ambil data santri dan guru dari instance hafalan
        siswa = instance.siswa
        guru = instance.guru
        nomor_wa = siswa.phone_number
        
        if not siswa.phone_number: 
            # Jika tidak ada nomor, status failed
            instance.wa_status = 'failed'
            instance.save(update_fields=['wa_status'])
            return

        # 3. Proses Mapping Tag (Ganti [tag] dengan data asli)
        replacements = {
            "[nama_siswa]": f"{siswa.first_name} {siswa.last_name}",
            "[kelas]": getattr(siswa, 'kelas', '-'),
            "[tanggal]": instance.tanggal.strftime('%d/%m/%Y'),
            "[guru]": f"{guru.first_name} {guru.last_name}",
            "[surah]": instance.surah,
            "[juz]": str(instance.juz),
            "[ayat]": instance.ayat or "-",
            "[jenis]": instance.jenis_setoran,
            "[nilai]": instance.nilai,
            "[catatan]": instance.catatan or "-",
            "[skor_adab]": str(instance.skor_adab),          # Contoh: 80
            "[predikat_adab]": instance.predikat_adab or "-", # Contoh: Baik (B)
            "[ket_adab]": instance.deskripsi_adab or "-"
        }

        pesan_final = pesan_raw
        for tag, value in replacements.items():
            pesan_final = pesan_final.replace(tag, str(value))

        # 4. Kirim ke Node.js API (Port 6969)
        payload = {
            "sender": "admin_mis", 
            "number": nomor_wa,
            "message": pesan_final
        }
        
        # Endpoint sesuai instruksi gateway
        res = requests.post("http://localhost:6969/send-message", json=payload, timeout=10)
        
        # 5. Catat Log ke database Django
        status_wa = 'terkirim' if res.status_code == 200 else 'gagal'
        WAMessageLog.objects.create(
            nama_siswa=f"{siswa.first_name} {siswa.last_name}",
            penerima=nomor_wa,
            pesan=pesan_final,
            status=status_wa
        )
        
        # UPDATE STATUS BERDASARKAN HASIL REQUEST
        if res.status_code == 200:
            instance.wa_status = 'sent' # Terkirim
        else:
            instance.wa_status = 'failed' # Gagal Gateway
            
        instance.save(update_fields=['wa_status'])
            
    except WATemplate.DoesNotExist:
        print("Error: Template 'setor_hafalan' belum ada!")
    except Exception as e:
        print(f"Auto WA Error: {str(e)}")

class IsAdminOrGuru(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'GURU'])

class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

# --- CRUD KELAS ---
class KelasViewSet(viewsets.ModelViewSet):
    queryset = Kelas.objects.all().order_by('nama_kelas')
    serializer_class = KelasSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nama_kelas', 'guru__first_name', 'guru__last_name']

# --- IMPORT EXCEL KELAS ---
class KelasImportExcelView(generics.CreateAPIView):
    permission_classes = [IsAdminOrGuru]
    parser_classes = (MultiPartParser,)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "Pilih file excel terlebih dahulu!"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            df = pd.read_excel(file)
            count = 0
            for index, row in df.iterrows():
                nip = str(row['nip_guru'])
                guru_obj = User.objects.filter(username=nip, role='GURU').first()
                Kelas.objects.update_or_create(
                    nama_kelas=row['nama_kelas'],
                    defaults={
                        'guru': guru_obj,
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
    def perform_create(self, serializer):
        # 1. Simpan data (termasuk nilai adab 1-5 dari frontend karena serializer sudah diperbaiki)
        instance = serializer.save()
        
        # 2. Hitung Skor & Predikat
        calculate_adab_score(instance)
        
        # 3. PERBAIKAN LOGIC WA: Hanya kirim jika tombol "Simpan & Kirim WA" diklik
        trigger_wa = self.request.data.get('trigger_wa')
        
        # Pastikan trigger_wa dibaca sebagai boolean (terkadang dikirim sebagai string "true"/"false")
        should_send = str(trigger_wa).lower() == 'true' if trigger_wa else False

        if should_send:
            send_auto_wa(instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        calculate_adab_score(instance)
        
        # PERBAIKAN LOGIC WA UNTUK EDIT
        trigger_wa = self.request.data.get('trigger_wa')
        should_send = str(trigger_wa).lower() == 'true' if trigger_wa else False

        if should_send:
            send_auto_wa(instance)

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
                nip = str(row['nip_guru'])
                siswa_obj = User.objects.filter(nisn=nisn, role='WALI_MURID').first()
                guru_obj = User.objects.filter(username=nip, role='GURU').first()
                if not siswa_obj: continue

                SetorHafalan.objects.create(
                    siswa=siswa_obj,
                    guru=guru_obj,
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

    @action(detail=False, methods=['get'])
    def riwayat(self, request):
        queryset = SetorHafalan.objects.all().order_by('-tanggal', '-id')
        if request.user.role == 'WALI_MURID':
            queryset = queryset.filter(siswa=request.user)
        else:
            kelas = request.query_params.get('kelas')
            siswa_id = request.query_params.get('siswa')
            if kelas and kelas != "Semua":
                queryset = queryset.filter(siswa__kelas=kelas)
            if siswa_id and siswa_id != "Semua":
                queryset = queryset.filter(siswa_id=siswa_id)
        
        filter_waktu = request.query_params.get('filter_waktu')
        if filter_waktu == 'hari_ini':
            queryset = queryset.filter(tanggal=date.today())
        elif filter_waktu == 'kemarin':
            queryset = queryset.filter(tanggal=date.today() - timedelta(days=1))

        serializer = SetorHafalanSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def rekap_data(self, request):
        dari_tgl = request.query_params.get('dari_tgl')
        sampai_tgl = request.query_params.get('sampai_tgl')
        queryset = SetorHafalan.objects.all().order_by('tanggal')
        if dari_tgl and sampai_tgl:
            queryset = queryset.filter(tanggal__range=[dari_tgl, sampai_tgl])

        target_siswa_id = None
        if request.user.role == 'WALI_MURID':
            queryset = queryset.filter(siswa=request.user)
            target_siswa_id = request.user.id
        else:
            kelas_nama = request.query_params.get('kelas')
            target_siswa_id = request.query_params.get('siswa')
            if kelas_nama and kelas_nama != "Semua":
                queryset = queryset.filter(siswa__kelas=kelas_nama)
            if target_siswa_id and target_siswa_id != "Semua":
                queryset = queryset.filter(siswa_id=target_siswa_id)

        summary = None
        if target_siswa_id and target_siswa_id != "Semua":
            try:
                siswa_obj = User.objects.get(id=target_siswa_id)
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

    @action(detail=False, methods=['get'])
    def download_pdf(self, request):
        dari_tgl = request.query_params.get('dari_tgl')
        sampai_tgl = request.query_params.get('sampai_tgl')
        queryset = SetorHafalan.objects.filter(tanggal__range=[dari_tgl, sampai_tgl]).order_by('tanggal')

        target_siswa_id = None
        if request.user.role == 'WALI_MURID':
            queryset = queryset.filter(siswa=request.user)
            target_siswa_id = request.user.id
        else:
            kelas_nama = request.query_params.get('kelas', 'Semua')
            target_siswa_id = request.query_params.get('siswa', 'Semua')
            if kelas_nama != "Semua":
                queryset = queryset.filter(siswa__kelas=kelas_nama)
            if target_siswa_id != "Semua":
                queryset = queryset.filter(siswa_id=target_siswa_id)

        # Evaluasi queryset ke list agar perhitungan akurat
        data_list = list(queryset)

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=25, leftMargin=25, topMargin=30, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=TA_CENTER, fontSize=16, spaceAfter=10)
        label_style = ParagraphStyle('LabelStyle', parent=styles['Normal'], fontSize=10, fontName='Helvetica-Bold')
        value_style = ParagraphStyle('ValueStyle', parent=styles['Normal'], fontSize=9)

        elements.append(Paragraph("<b>LAPORAN MUTABAAH DIGITAL MIS</b>", title_style))
        elements.append(Paragraph(f"Periode: {dari_tgl} s/d {sampai_tgl}", styles['Normal']))
        elements.append(Spacer(1, 15))

        if target_siswa_id and target_siswa_id != "Semua":
            try:
                siswa_obj = User.objects.get(id=target_siswa_id)
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

                # --- FITUR CHART PDF (LOGIKA DIPERBAIKI) ---
                # PERBAIKAN: Hitung langsung dari data_list agar proporsi akurat
                mapping = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
                for h in data_list:
                    if h.nilai in mapping: mapping[h.nilai] += 1
                
                total_nilai = sum(mapping.values())
                
                d_pie = Drawing(200, 140)
                pc = Pie()
                pc.x = 25
                pc.y = 20
                pc.width = 100
                pc.height = 100
                pc.data = [mapping['A'], mapping['B'], mapping['C'], mapping['D']]
                
                # Tambahkan Persentase ke Label
                pc_labels = []
                for k in ['A', 'B', 'C', 'D']:
                    val = mapping[k]
                    if val > 0:
                        pct = (val / total_nilai) * 100
                        pc_labels.append(f"{k} ({pct:.0f}%)")
                    else:
                        pc_labels.append("")
                pc.labels = pc_labels
                
                pc.slices.strokeWidth = 0.5
                pc.slices[0].fillColor = colors.HexColor("#22C55E")
                pc.slices[1].fillColor = colors.HexColor("#3b82f6")
                pc.slices[2].fillColor = colors.HexColor("#fbbf24")
                pc.slices[3].fillColor = colors.HexColor("#f87171")
                d_pie.add(pc)

                # Statistik Progres (Kumulatif 7 Hari Terakhir)
                today = date.today()
                labels_p, data_p = [], []
                day_map = {"Monday":"Sen", "Tuesday":"Sel", "Wednesday":"Rab", "Thursday":"Kam", "Friday":"Jum", "Saturday":"Sab", "Sunday":"Min"}
                for i in range(6, -1, -1):
                    t_d = today - timedelta(days=i)
                    labels_p.append(day_map.get(t_d.strftime('%A')))
                    # Hitung kumulatif surah unik sampai tanggal t_d
                    c = queryset.filter(tanggal__lte=t_d).values('surah').distinct().count()
                    data_p.append(c)

                d_bar = Drawing(250, 140)
                bc = VerticalBarChart()
                bc.x = 30
                bc.y = 30
                bc.height = 80
                bc.width = 180
                bc.data = [tuple(data_p)]
                bc.categoryAxis.categoryNames = labels_p
                bc.bars[0].fillColor = colors.HexColor("#22C55E")
                bc.valueAxis.valueMin = 0
                # Menyesuaikan step agar tidak terlalu rapat
                max_val = max(data_p) if data_p else 5
                bc.valueAxis.valueMax = max_val + 2
                bc.valueAxis.valueStep = 1 if max_val < 10 else 2
                d_bar.add(bc)

                chart_table_data = [
                    [Paragraph("<b>Diagram Grafik Nilai</b>", label_style), Paragraph("<b>Diagram Progress Hafalan</b>", label_style)],
                    [d_pie, d_bar]
                ]
                chart_table = Table(chart_table_data, colWidths=[250, 250])
                chart_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER'), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
                elements.append(chart_table)
                elements.append(Spacer(1, 15))

            except: pass

        # --- TABEL DETAIL ---
        elements.append(Paragraph("<b>Detail Setoran Hafalan:</b>", label_style))
        elements.append(Spacer(1, 5))
        
        data = [["No", "Tanggal", "Nama Siswa", "Surah", "Juz", "Ayat", "Jenis", "Nilai", "Catatan"]]
        for idx, h in enumerate(data_list, 1):
            data.append([idx, h.tanggal.strftime('%d/%m/%y'), h.siswa.first_name, h.surah, h.juz, h.ayat, h.jenis_setoran, h.nilai, Paragraph(h.catatan or "-", value_style)])

        main_table = Table(data, colWidths=[20, 55, 70, 70, 25, 55, 60, 30, 145])
        main_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1B4332")), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke), ('ALIGN', (0, 0), (7, -1), 'CENTER'), ('ALIGN', (8, 0), (8, -1), 'LEFT'), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 8), ('GRID', (0, 0), (-1, -1), 0.5, colors.grey), ('VALIGN', (0,0), (-1,-1), 'TOP')]))
        elements.append(main_table)
        doc.build(elements)
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f'Laporan_Mutabaah_{date.today()}.pdf')

# --- LOGIKA MENU BERANDA ---
class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_siswa = User.objects.filter(role='WALI_MURID').count()
        total_guru = User.objects.filter(role='GURU').count()
        total_kelas = Kelas.objects.count()
        best_progress = SetorHafalan.objects.values('siswa__first_name', 'siswa__last_name').annotate(total_surah=Count('surah', distinct=True)).order_by('-total_surah').first()
        top_student = f"{best_progress['siswa__first_name']} {best_progress['siswa__last_name']}" if best_progress else "-"
        top_count = best_progress['total_surah'] if best_progress else 0

        periode = request.query_params.get('periode', 'Mingguan')
        today = date.today()
        base_qs = SetorHafalan.objects.filter(siswa=request.user) if request.user.role == 'WALI_MURID' else SetorHafalan.objects.all()

        n_counts = base_qs.values('nilai').annotate(c=Count('id'))
        m_n = {'A': 0, 'B': 0, 'C': 0, 'D': 0}
        for item in n_counts:
            if item['nilai'] in m_n: m_n[item['nilai']] = item['c']
        d_nilai = [m_n['A'], m_n['B'], m_n['C'], m_n['D']]

        l_p, d_p = [], []
        if periode == 'Mingguan':
            day_map = {"Monday":"Senin", "Tuesday":"Selasa", "Wednesday":"Rabu", "Thursday":"Kamis", "Friday":"Jumat", "Saturday":"Sabtu", "Sunday":"Minggu"}
            for i in range(6, -1, -1):
                t_d = today - timedelta(days=i)
                l_p.append(day_map.get(t_d.strftime('%A')))
                d_p.append(base_qs.filter(tanggal__lte=t_d).values('surah').distinct().count())
        elif periode == 'Bulanan':
            for i in range(3, -1, -1):
                l_p.append(f"Minggu {4-i}")
                t_d = today - timedelta(days=i*7)
                d_p.append(base_qs.filter(tanggal__lte=t_d).values('surah').distinct().count())
        elif periode == 'Semester':
            month_map = {1:"Januari", 2:"Februari", 3:"Maret", 4:"April", 5:"Mei", 6:"Juni", 7:"Juli", 8:"Agustus", 9:"September", 10:"Oktober", 11:"November", 12:"Desember"}
            for i in range(5, -1, -1):
                m = today.month - i
                y = today.year
                if m <= 0: m += 12; y -= 1
                l_p.append(month_map[m])
                last_d = date(y, m+1, 1) - timedelta(days=1) if m < 12 else date(y, 12, 31)
                d_p.append(base_qs.filter(tanggal__lte=last_d).values('surah').distinct().count())

        return Response({
            "cards": {"total_siswa": total_siswa, "total_guru": total_guru, "total_kelas": total_kelas, "best_student": {"name": top_student, "count": f"{top_count} Surah"}},
            "charts": {"nilai": d_nilai, "progress": {"labels": l_p, "data": d_p}}
        })