from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from apps.accounts.permissions import IsAdmin, IsAdminOrTeacher
from .models import Fee, FeeStructure
from .serializers import FeeSerializer, FeeStructureSerializer
import datetime


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAdmin]


class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.select_related('student').all()
    serializer_class = FeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'status']
    search_fields = ['student__first_name', 'student__last_name', 'title']
    ordering_fields = ['due_date', 'amount', 'created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'summary']:
            return [IsAdminOrTeacher()]
        return [IsAdmin()]

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        fee = self.get_object()
        amount = float(request.data.get('amount', 0))
        method = request.data.get('payment_method', 'cash')
        transaction_id = request.data.get('transaction_id', '')
        if amount <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        fee.paid_amount = float(fee.paid_amount) + amount
        fee.payment_method = method
        fee.transaction_id = transaction_id
        if fee.paid_amount >= float(fee.amount):
            fee.status = 'paid'
            fee.paid_date = datetime.date.today()
        elif fee.paid_amount > 0:
            fee.status = 'partial'
        fee.save()
        return Response(FeeSerializer(fee).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total = Fee.objects.aggregate(total=Sum('amount'))['total'] or 0
        collected = Fee.objects.aggregate(col=Sum('paid_amount'))['col'] or 0
        pending = Fee.objects.filter(status='pending').count()
        overdue = Fee.objects.filter(status='overdue').count()
        return Response({
            'total_billed': float(total),
            'total_collected': float(collected),
            'pending_count': pending,
            'overdue_count': overdue,
            'collection_rate': round(float(collected) / float(total) * 100, 2) if total > 0 else 0,
        })
